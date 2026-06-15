import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import Groq from "groq-sdk";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const dataDir = path.join(process.cwd(), "data");
const usersFilePath = path.join(dataDir, "users.json");
const sessionsFilePath = path.join(dataDir, "sessions.json");
const analyticsFilePath = path.join(dataDir, "analytics.json");

interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  rememberMe?: boolean;
}

interface Session {
  userId: string;
  email: string;
  name: string;
  expiresAt: number;
}

const defaultUsers: User[] = [
  {
    id: "demo_user",
    email: "demo@clarify.com",
    password: bcrypt.hashSync("demo123", 10),
    name: "Demo User",
    rememberMe: true,
  },
];

let users: User[] = [];
let sessions: Record<string, Session> = {};

function ensureDataStorage() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(usersFilePath)) {
    fs.writeFileSync(usersFilePath, JSON.stringify(defaultUsers, null, 2), "utf-8");
  }

  if (!fs.existsSync(sessionsFilePath)) {
    fs.writeFileSync(sessionsFilePath, JSON.stringify({}, null, 2), "utf-8");
  }

  if (!fs.existsSync(analyticsFilePath)) {
    fs.writeFileSync(analyticsFilePath, JSON.stringify([], null, 2), "utf-8");
  }
}

function loadJsonFile<T>(filePath: string, defaultValue: T): T {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch (error) {
    return defaultValue;
  }
}

function saveJsonFile(filePath: string, data: unknown) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

function persistData() {
  saveJsonFile(usersFilePath, users);
  saveJsonFile(sessionsFilePath, sessions);
}

function sanitizeUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}

function getTokenFromRequest(req: Request) {
  const authHeader = req.headers.authorization;
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }

  return req.body?.token || null;
}

function generateToken(): string {
  return crypto.randomBytes(48).toString("hex");
}

function isSessionValid(session: Session | undefined) {
  return Boolean(session && session.expiresAt > Date.now());
}

async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

// Language detection helper - simple script and keyword based
function detectLanguages(text: string): string[] {
  if (!text || text.trim().length < 3) return [];
  
  const detected: string[] = [];
  
  // Check for Hinglish (mix of Hindi and English with English characters)
  const hindiChars = /[\u0900-\u097F]/g.test(text); // Devanagari script
  const englishChars = /[a-zA-Z0-9]/.test(text);
  const hinglishKeywords = /\b(kyu|hota|hai|ye|woh|mera|tera|iska|uska|jo|karenge|hora|hui|hoga|aur|par|nahin|nahi|kaise|kab|jab|tab|phir|toh|bhi|hi|to|do|kar|na|naa|ban|dekh|sun|bolo|suno|likho|padh|samjho|lekin)\b/i.test(text);
  
  if ((hindiChars || hinglishKeywords) && englishChars) {
    detected.push('Hinglish');
  } else if (hindiChars) {
    detected.push('Hindi');
  }
  
  // Check for pure English (Latin characters, numbers, common punctuation)
  const latinChars = text.match(/[a-zA-Z0-9]/g) || [];
  const latinScore = latinChars.length / Math.max(1, text.trim().length);
  if (latinScore > 0.5 && !detected.includes('Hinglish') && !detected.includes('Hindi')) {
    detected.push('English');
  }
  
  // Check for Spanish (Spanish-specific chars and common words)
  if (/[àáâãäåèéêëìíîïòóôõöùúûüýÿ]|¿|¡/.test(text) || 
      /\b(es|la|que|de|el|por|para|en|un|una|los|las|con|como|más|este|pero)\b/i.test(text)) {
    if (!detected.includes('Spanish')) detected.push('Spanish');
  }
  
  // Check for French
  if (/[àâäéèêëïîôùûüœæ]|«|»/.test(text) ||
      /\b(le|la|les|de|et|un|une|des|cette|être|avoir|qui|que|pour|dans)\b/i.test(text)) {
    if (!detected.includes('French')) detected.push('French');
  }
  
  // Check for German
  if (/[äöüß]/.test(text) ||
      /\b(der|die|das|und|ist|ein|eine|einen|zum|zur|mit)\b/i.test(text)) {
    if (!detected.includes('German')) detected.push('German');
  }
  
  // Check for Chinese (CJK characters)
  if (/[\u4E00-\u9FFF\u3040-\u309F\uAC00-\uD7AF]/.test(text)) {
    if (!detected.includes('Chinese')) detected.push('Chinese');
  }
  
  // Check for Arabic
  if (/[\u0600-\u06FF]/.test(text)) {
    if (!detected.includes('Arabic')) detected.push('Arabic');
  }
  
  // If nothing detected, default to English if there are Latin chars
  if (detected.length === 0 && /[a-zA-Z]/.test(text)) {
    detected.push('English');
  }
  
  // Return unique languages, max 3
  return [...new Set(detected)].slice(0, 3);
}

async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

const allowedOrigin = process.env.CORS_ORIGIN || "*";

// =========================
// MIDDLEWARE
// =========================

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(
  cors({
    origin: allowedOrigin,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.use(
  express.json({
    limit: "20mb",
  })
);

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again in a moment." },
});

app.use("/api/", apiLimiter);

// =========================
// GROQ CLIENT
// =========================

let groqClient: Groq | null = null;

function getGroqClient(): Groq {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      // Provide a lightweight mock client for local development so the
      // server doesn't crash when GROQ_API_KEY is not present. The mock
      // returns predictable placeholder data for frontend testing.
      // NOTE: This should NEVER be used in production.
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      groqClient = {
        chat: {
          completions: {
            create: async (_opts: any) => {
              return {
                choices: [
                  {
                    message: {
                      content: JSON.stringify({
                        originalDoubt: "(mock)",
                        rewrittenDoubt: "This is a mock rewrite (GROQ_API_KEY missing).",
                        subject: "General",
                        confidence: 50,
                        confusionLevel: "Moderate",
                        doubtQualityScore: 60,
                        doubtQualityTips: ["Give more context", "Specify the formula"],
                        clarificationNeeded: false,
                        clarificationQuestion: "",
                        recommendedKeywords: ["example", "mock"],
                        explanation: "This is a mock explanation used for local development.",
                        relatedFormulas: [],
                        additionalFollowUps: [],
                        isMultilingual: false,
                        detectedLanguages: []
                      }),
                    },
                  },
                ],
              };
            },
          },
        },
      } as unknown as Groq;
    } else {
      groqClient = new Groq({
        apiKey,
      });
    }
  }

  return groqClient;
}

// =========================
// SAFE JSON PARSER
// =========================

function parseGroqResponse(text: string) {
  try {
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);
  } catch {
    try {
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");

      if (start !== -1 && end !== -1) {
        return JSON.parse(text.slice(start, end + 1));
      }
    } catch {}

    return {
      rawResponse: text,
      parseError: true,
    };
  }
}

function buildClarifyFallback(currentQuery: string, subjectContext?: string) {
  const subject = subjectContext || "this topic";
  const lower = currentQuery.toLowerCase();
  const currentDraftQuery = currentQuery.trim().endsWith("?")
    ? currentQuery.trim()
    : `I need help understanding ${currentQuery.trim()} in ${subject}.`;

  if (lower.includes("ac")) {
    return {
      tutorReply: "When you say AC, do you mean alternating current in electricity? Are you asking why its direction reverses periodically?",
      assistantReply: "When you say AC, do you mean alternating current in electricity? Are you asking why its direction reverses periodically?",
      currentDraftQuery,
      needsMoreClarification: true,
      confidenceInDraft: 55,
      nextSuggestedInput: "Yes, I mean alternating current direction changing."
    };
  }

  if (lower.includes("formula") || lower.includes("equation")) {
    return {
      tutorReply: "Which part of the formula is unclear: the meaning of a variable, why the formula applies, or how to substitute values?",
      assistantReply: "Which part of the formula is unclear: the meaning of a variable, why the formula applies, or how to substitute values?",
      currentDraftQuery,
      needsMoreClarification: true,
      confidenceInDraft: 58,
      nextSuggestedInput: "I know the formula but I don't understand one variable."
    };
  }

  return {
    tutorReply: `What exactly is confusing you in ${subject}: the definition, the formula, the diagram, or the calculation step?`,
    assistantReply: `What exactly is confusing you in ${subject}: the definition, the formula, the diagram, or the calculation step?`,
    currentDraftQuery,
    needsMoreClarification: true,
    confidenceInDraft: 45,
    nextSuggestedInput: "The formula part is confusing me."
  };
}

function normalizeClarifyChatResponse(parsed: any, currentQuery: string, subjectContext?: string) {
  const fallback = buildClarifyFallback(currentQuery, subjectContext);
  const tutorReply = parsed?.tutorReply || parsed?.assistantReply || parsed?.reply || fallback.tutorReply;
  const currentDraftQuery = parsed?.currentDraftQuery || parsed?.draftQuery || fallback.currentDraftQuery;
  const confidenceInDraft =
    typeof parsed?.confidenceInDraft === "number"
      ? Math.max(0, Math.min(100, Math.round(parsed.confidenceInDraft)))
      : fallback.confidenceInDraft;

  return {
    tutorReply,
    assistantReply: tutorReply,
    currentDraftQuery,
    needsMoreClarification: parsed?.needsMoreClarification ?? fallback.needsMoreClarification,
    confidenceInDraft,
    nextSuggestedInput: parsed?.nextSuggestedInput || fallback.nextSuggestedInput
  };
}

// Load users and sessions from disk on startup
ensureDataStorage();
users = loadJsonFile<User[]>(usersFilePath, defaultUsers);
sessions = loadJsonFile<Record<string, Session>>(sessionsFilePath, {});

// =========================
// API INFO ROUTE
// =========================

app.get("/api", (req: Request, res: Response) => {
  res.json({
    message: "Educational Doubt Rewriter API Running",
  });
});

// =========================
// HEALTH CHECK ENDPOINT
// =========================

app.get("/health", (req: Request, res: Response) => {
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
  };
  res.status(200).json(health);
});

app.get("/api/health", (req: Request, res: Response) => {
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
  };
  res.status(200).json(health);
});

// =========================
// REWRITE DOUBT ENDPOINT
// =========================

app.post("/api/rewrite-doubt", async (req: Request, res: Response) => {
  try {
    const { rawDoubt, mode } = req.body;

    if (!rawDoubt) {
      return res.status(400).json({
        error: "Please enter a doubt.",
      });
    }

    const groq = getGroqClient();

    // If running locally without GROQ_API_KEY, return a deterministic
    // mock response object so the frontend can operate normally.
    if (!process.env.GROQ_API_KEY) {
      // Detect physics context
      const doubtLower = rawDoubt.toLowerCase();
      const isPhysics = doubtLower.includes("current") || doubtLower.includes("voltage") || doubtLower.includes("circuit") || doubtLower.includes("alternating");
      const isAC = doubtLower.includes("ac") || doubtLower.includes("alternating current");
      
      const mock: any = {
        originalDoubt: rawDoubt,
        rewrittenDoubt: isAC 
          ? `Explain the behavior of alternating current (AC) in the context: ${rawDoubt}`
          : `Rephrase in ${mode} mode: ${rawDoubt}`,
        rewrittenQuestion: isAC 
          ? `Explain the behavior of alternating current (AC) in the context: ${rawDoubt}`
          : `Rephrase in ${mode} mode: ${rawDoubt}`,
        subject: isPhysics ? "Electrical Engineering / Physics" : "General",
        confidence: isPhysics ? 75 : 55,
        confusionLevel: isPhysics ? "Conceptual Understanding" : "Moderate",
        doubtQualityScore: 65,
        doubtQualityTips: isAC 
          ? ["Clarify: Are you asking about Alternating Current (electrical) or Air Conditioner?", "Provide circuit details or frequency context", "Specify what aspect confuses you (direction, voltage, power?)"]
          : ["Give more context", "List known variables", "Specify the exact concept"],
        clarificationNeeded: isAC,
        clarificationQuestion: isAC ? "Do you mean Alternating Current (AC electrical) or an Air Conditioner device?" : "",
        recommendedKeywords: isAC ? ["alternating current", "AC circuit", "frequency", "voltage", "current direction"] : ["mock", "example"],
        explanation: isAC 
          ? "In an alternating current (AC) circuit, the direction of current flow reverses periodically based on the AC frequency (typically 50 or 60 Hz). This is fundamentally different from direct current (DC). The reversal occurs because the AC voltage source alternates between positive and negative values."
          : "This is a mock explanation returned during local development.",
        relatedFormulas: isAC ? ["V(t) = V₀ sin(ωt)", "I(t) = I₀ sin(ωt - φ)", "ω = 2πf", "P = V_rms × I_rms × cos(φ)"] : [],
        additionalFollowUps: isAC ? ["What frequency is the AC source?", "Are you studying single-phase or three-phase AC?", "What is the load impedance?"] : [],
        isMultilingual: true,
        detectedLanguages: detectLanguages(rawDoubt)
      };

      return res.json(mock);
    }

    let modeInstruction = "";

    switch (mode) {
      case "academic":
        modeInstruction =
          "Rewrite into a highly formal academic question.";
        break;

      case "concise":
        modeInstruction =
          "Rewrite into a concise search-friendly query.";
        break;

      case "textbook":
        modeInstruction =
          "Rewrite into a detailed textbook-style question.";
        break;

      case "socratic":
        modeInstruction =
          "Rewrite into a deep conceptual inquiry using Socratic style.";
        break;

      default:
        modeInstruction =
          "Rewrite into a clear and structured academic question.";
    }

    const systemInstruction = `
You are an Intelligent Educational Doubt Rewriter, Physics & Engineering Tutor.

Your task:

1. **Correct grammar and spelling** while preserving intent.
2. **Translate Hindi/Hinglish into English** if needed.
3. **CRITICAL: Detect context and ambiguity** — "AC" could mean:
   - Alternating Current (Physics/Electrical Engineering context)
   - Air Conditioner (common misconception in student queries)
   - Analyze the sentence context. If unclear, ask clarification.
4. **Identify the subject accurately** from keywords:
   - Physics keywords: voltage, current, circuit, electromagnetic, wave, motion, force, energy
   - Chemistry keywords: reaction, molecule, bond, acid, base, pH, oxidation
   - Math keywords: derivative, integral, function, equation, calculus, trigonometry
   - Biology keywords: cell, organism, photosynthesis, mitochondria, DNA, enzyme
   - Engineering keywords: circuit, transformer, motor, AC/DC, ampere, watt
5. **Provide confidence score** (0-100) on how well you understood the doubt.
6. **Rate doubt quality** (0-100) based on clarity and completeness.
7. **Suggest improvements** to make the question more professional.
8. **Identify confusion type** (Conceptual, Calculation, Definition, Application, Misconception).
9. **Ask clarification questions if needed** to resolve ambiguities.
10. **Provide a detailed educational explanation** with step-by-step reasoning.
11. **Provide a concise answer to the question** (1-2 sentences, direct and accurate).
12. **Suggest keywords** relevant to the topic.
13. **Suggest formulas/laws** that apply.
14. **Suggest follow-up questions** to deepen understanding.

**Context-aware parsing rules:**
- If student mentions "current reverse" + "AC" → assume Alternating Current (physics)
- If student says "current reverse in AC me" → Physics: Ask about AC frequency, circuits
- Look for Hinglish physics terms: "current", "voltage", "circuit", "frequency", "motor", "transformer"
- If ambiguous, ask: "By AC, do you mean Alternating Current (electrical) or Air Conditioner?"

Mode:
${modeInstruction}

Return ONLY valid JSON in this exact structure:

{
  "rewrittenQuestion": "",
  "subject": "",
  "confidence": 0,
  "qualityScore": 0,
  "confusionType": "",
  "clarificationNeeded": false,
  "clarificationQuestions": [],
  "keywords": [],
  "formulas": [],
  "followUpQuestions": [],
  "explanation": "",
  "answer": "",
  "tips": []
}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content: systemInstruction,
        },
        {
          role: "user",
          content: rawDoubt,
        },
      ],
    });

    const resultText =
      completion.choices?.[0]?.message?.content || "{}";

    const parsed = parseGroqResponse(resultText);
    
    // Add language detection to the response
    parsed.detectedLanguages = detectLanguages(rawDoubt);
    parsed.isMultilingual = true;

    return res.json(parsed);
  } catch (error: any) {
    console.error("Rewrite API Error:", error);

    return res.status(500).json({
      error:
        error?.message ||
        "Failed to process the doubt.",
    });
  }
});

// =========================
// CLARIFY CHAT ENDPOINT
// =========================

// =========================
// TRANSLATION FALLBACK ENDPOINT (stub for local/dev)
// =========================
app.post("/api/translate", async (req: Request, res: Response) => {
  try {
    const { text, targetLang } = req.body;

    if (!text) return res.status(400).json({ error: "text is required" });

    // Attempt to call a configured LibreTranslate instance if provided
    const libreUrl = process.env.LIBRE_TRANSLATE_URL;
    const libreKey = process.env.LIBRE_TRANSLATE_KEY;

    if (!targetLang || targetLang === "en") {
      return res.json({ translatedText: text });
    }

    if (libreUrl) {
      try {
        const payload: any = { q: text, source: "auto", target: targetLang, format: "text" };
        if (libreKey) payload.api_key = libreKey;

        const resp = await fetch(libreUrl.replace(/\/$/, "") + "/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (resp.ok) {
          const json = await resp.json().catch(() => null);
          if (json && (json.translatedText || json.translated_text || json.translation)) {
            const t = json.translatedText || json.translated_text || json.translation;
            return res.json({ translatedText: t });
          }
          if (json && typeof json === "string") {
            return res.json({ translatedText: json });
          }
        }
      } catch (e) {
        console.error("Libre translate call failed", e);
      }
    }

    // Fallback to deterministic simulated translation for local dev
    const lower = text.toLowerCase();
    let translated = null as string | null;

    if (targetLang === "hi") {
      if (lower.includes("alternating current") || lower.includes("ac")) {
        translated = "AC सर्किट में करंट की दिशा आवधिक रूप से बदलती है क्योंकि स्रोत वोल्टेज पलटता है।";
      } else if (lower.includes("current")) {
        translated = "वर्तमान दिशा समय के साथ बदलती है।";
      }
    }

    if (targetLang === "es") {
      if (lower.includes("alternating current") || lower.includes("ac")) {
        translated = "En un circuito de CA, la dirección de la corriente se invierte periódicamente debido a la alternancia de la tensión.";
      } else if (lower.includes("current")) {
        translated = "La dirección de la corriente cambia con el tiempo.";
      }
    }

    if (!translated) {
      translated = `${text} (translated to ${targetLang})`;
    }

    return res.json({ translatedText: translated });
  } catch (e) {
    console.error('Translate error', e);
    res.status(500).json({ error: 'Translation failed' });
  }
});

// Analytics ingestion endpoint
app.post('/api/analytics', (req: Request, res: Response) => {
  try {
    const event = req.body;
    if (!event || !event.type) return res.status(400).json({ error: 'event.type required' });
    let existing: any[] = [];
    try {
      existing = JSON.parse(fs.readFileSync(analyticsFilePath, 'utf-8')) || [];
    } catch (e) {
      existing = [];
    }
    const record = { ...event, timestamp: new Date().toISOString() };
    existing.unshift(record);
    fs.writeFileSync(analyticsFilePath, JSON.stringify(existing.slice(0, 5000), null, 2), 'utf-8');
    return res.json({ success: true });
  } catch (e) {
    console.error('Analytics ingest failed', e);
    res.status(500).json({ error: 'failed' });
  }
});

app.get('/api/analytics', (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit) || 50;
    const existing = JSON.parse(fs.readFileSync(analyticsFilePath, 'utf-8')) || [];
    return res.json({ events: (existing as any[]).slice(0, limit) });
  } catch (e) {
    console.error('Analytics fetch failed', e);
    return res.status(500).json({ error: 'failed to read analytics' });
  }
});

app.post("/api/clarify-chat", async (req: Request, res: Response) => {
  try {
    const {
      history = [],
      currentQuery,
      subjectContext,
    } = req.body;

    if (!currentQuery) {
      return res.status(400).json({
        error: "currentQuery is required",
      });
    }

    const groq = getGroqClient();

    const systemInstruction = `
You are a Socratic Tutor specialized in Physics, Engineering, Chemistry, Biology, and Mathematics.

Rules:

1. Keep replies short (2-3 sentences max).
2. Ask guiding questions that help students think deeper.
3. Help students clarify ambiguous terms:
   - If they mention "AC", ask: "Do you mean Alternating Current (electrical) or Air Conditioner?"
   - If they mention "current reverse", clarify: "Are you asking about AC current direction reversing?"
4. Maintain a refined currentDraftQuery by extracting key concepts.
5. Be encouraging, friendly, and Socratic.
6. Context awareness:
   - Physics/Engineering: Look for circuit, voltage, current, frequency, transformer, motor
   - Chemistry: Look for reactions, elements, bonds, pH, oxidation
   - Math: Look for calculus, algebra, geometry, functions
7. Adjust your guidance based on subject context.

Return ONLY valid JSON:

{
  "tutorReply": "",
  "assistantReply": "",
  "currentDraftQuery": "",
  "needsMoreClarification": true,
  "confidenceInDraft": 45,
  "nextSuggestedInput": ""
}
`;

    const messages = [
      {
        role: "system" as const,
        content: systemInstruction,
      },

      ...(history || []).map(
        (msg: { role: string; content: string }) => ({
          role: msg.role as "user" | "assistant" | "system",
          content: msg.content,
        })
      ),

      {
        role: "user" as const,
        content: `
Current Student Response:
${currentQuery}

Subject Context:
${subjectContext || "Unknown"}
`,
      },
    ];

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.4,
      messages,
    });

    const resultText =
      completion.choices?.[0]?.message?.content || "{}";

    if (!process.env.GROQ_API_KEY) {
      return res.json(buildClarifyFallback(currentQuery, subjectContext));
    }

    return res.json(
      normalizeClarifyChatResponse(
        parseGroqResponse(resultText),
        currentQuery,
        subjectContext
      )
    );
  } catch (error: any) {
    console.error("Clarify Chat Error:", error);

    return res.json(buildClarifyFallback(req.body?.currentQuery || "this doubt", req.body?.subjectContext));
  }
});

// =========================
// AUTHENTICATION
// =========================

// SIGNUP ENDPOINT
app.post("/api/auth/signup", async (req: Request, res: Response) => {
  try {
    const { email, password, name, rememberMe } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: "Email, password, and name are required" });
    }

    if (users.find((u) => u.email === email)) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await hashPassword(password);
    const newUser: User = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      name,
      rememberMe,
    };

    users.push(newUser);
    persistData();

    const token = generateToken();
    const expiresAt = Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000);
    sessions[token] = { userId: newUser.id, email, name, expiresAt };
    persistData();

    res.status(201).json({
      success: true,
      token,
      user: sanitizeUser(newUser),
      message: "Account created successfully",
    });
  } catch (error) {
    console.error("Signup failed", error);
    res.status(500).json({ error: "Signup failed" });
  }
});

// LOGIN ENDPOINT
app.post("/api/auth/login", async (req: Request, res: Response) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = users.find((u) => u.email === email);
    const validPassword = user ? await verifyPassword(password, user.password) : false;

    if (!user || !validPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateToken();
    const expiresAt = Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000);
    sessions[token] = { userId: user.id, email: user.email, name: user.name, expiresAt };
    persistData();

    res.json({
      success: true,
      token,
      user: sanitizeUser(user),
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login failed", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// VERIFY TOKEN ENDPOINT
app.post("/api/auth/verify", (req: Request, res: Response) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(400).json({ error: "Token required" });
    }

    const session = sessions[token];

    if (!isSessionValid(session)) {
      delete sessions[token];
      persistData();
      return res.status(401).json({ error: "Token expired or invalid" });
    }

    res.json({
      success: true,
      user: { id: session!.userId, email: session!.email, name: session!.name },
    });
  } catch (error) {
    console.error("Verification failed", error);
    res.status(500).json({ error: "Verification failed" });
  }
});

// UPDATE PROFILE ENDPOINT
app.post("/api/auth/update-profile", (req: Request, res: Response) => {
  try {
    const token = getTokenFromRequest(req);
    const { name, email } = req.body;

    if (!token || !name || !email) {
      return res.status(400).json({ error: "Token, name, and email are required" });
    }

    const session = sessions[token];
    if (!isSessionValid(session)) {
      delete sessions[token];
      persistData();
      return res.status(401).json({ error: "Session expired. Please sign in again." });
    }

    const user = users.find((u) => u.id === session.userId);
    if (!user) {
      return res.status(404).json({ error: "Account not found" });
    }

    const emailOwner = users.find((u) => u.email === email && u.id !== user.id);
    if (emailOwner) {
      return res.status(400).json({ error: "Email already registered" });
    }

    user.name = name;
    user.email = email;

    Object.values(sessions).forEach((activeSession) => {
      if (activeSession.userId === user.id) {
        activeSession.name = name;
        activeSession.email = email;
      }
    });

    persistData();

    res.json({
      success: true,
      user: sanitizeUser(user),
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Profile update failed", error);
    res.status(500).json({ error: "Profile update failed" });
  }
});

// CHANGE PASSWORD ENDPOINT
app.post("/api/auth/change-password", async (req: Request, res: Response) => {
  try {
    const token = getTokenFromRequest(req);
    const { currentPassword, newPassword } = req.body;

    if (!token || !currentPassword || !newPassword) {
      return res.status(400).json({ error: "All password fields are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const session = sessions[token];
    if (!isSessionValid(session)) {
      delete sessions[token];
      persistData();
      return res.status(401).json({ error: "Session expired. Please sign in again." });
    }

    const user = users.find((u) => u.id === session.userId);
    if (!user) {
      return res.status(404).json({ error: "Account not found" });
    }

    const currentMatches = await verifyPassword(currentPassword, user.password);
    if (!currentMatches) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    user.password = await hashPassword(newPassword);
    persistData();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Password change failed", error);
    res.status(500).json({ error: "Password change failed" });
  }
});

// DELETE ACCOUNT ENDPOINT
app.post("/api/auth/delete-account", (req: Request, res: Response) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(400).json({ error: "Token required" });
    }

    const session = sessions[token];
    if (!isSessionValid(session)) {
      delete sessions[token];
      persistData();
      return res.status(401).json({ error: "Session expired. Please sign in again." });
    }

    const userIndex = users.findIndex((u) => u.id === session.userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: "Account not found" });
    }

    users.splice(userIndex, 1);

    Object.entries(sessions).forEach(([sessionToken, activeSession]) => {
      if (activeSession.userId === session.userId) {
        delete sessions[sessionToken];
      }
    });

    persistData();

    res.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Account deletion failed", error);
    res.status(500).json({ error: "Account deletion failed" });
  }
});

// LOGOUT ENDPOINT
app.post("/api/auth/logout", (req: Request, res: Response) => {
  try {
    const token = getTokenFromRequest(req);

    if (token && sessions[token]) {
      delete sessions[token];
      persistData();
    }

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout failed", error);
    res.status(500).json({ error: "Logout failed" });
  }
});

// =========================
// HEALTH CHECK
// =========================

app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// =========================
// START SERVER
// =========================

// =========================
// ENVIRONMENT VALIDATION
// =========================

function validateEnvironment(): void {
  const requiredVars = ['GROQ_API_KEY'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('\n❌ MISSING REQUIRED ENVIRONMENT VARIABLES:');
    missingVars.forEach(varName => {
      console.error(`  - ${varName}`);
    });
    console.error('\n📋 Please create a .env file with required variables.');
    console.error('   Copy .env.example and fill in the values.\n');
    process.exit(1);
  }
  
  // Warn about recommended variables
  const recommendedVars = ['APP_URL'];
  const missingRecommended = recommendedVars.filter(varName => !process.env[varName]);
  
  if (missingRecommended.length > 0) {
    console.warn('⚠️  RECOMMENDED ENVIRONMENT VARIABLES NOT SET:');
    missingRecommended.forEach(varName => {
      console.warn(`  - ${varName}`);
    });
  }
  
  // Log startup configuration
  console.log('\n✅ Configuration validated:');
  console.log(`  - Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  - Port: ${process.env.PORT || 3000}`);
  console.log(`  - App URL: ${process.env.APP_URL || 'http://localhost:3000'}\n`);
}

// =========================
// SERVER STARTUP
// =========================

async function startServer() {
  try {
    // Validate environment before starting
    validateEnvironment();
    
    const isProduction =
      process.env.NODE_ENV === "production" ||
      __dirname.endsWith(`${path.sep}dist`) ||
      __dirname.endsWith("/dist");

    if (!isProduction) {
      const vite = await createViteServer({
        server: {
          middlewareMode: true,
        },
        appType: "spa",
      });

      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), "dist");

      app.use(express.static(distPath));

      app.get("*", (req: Request, res: Response) => {
        res.sendFile(
          path.join(distPath, "index.html")
        );
      });
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`
===================================
🚀 Server Started Successfully
🌐 http://localhost:${PORT}
===================================
`);
    });
  } catch (error: any) {
    console.error("Server startup failed:", error);
  }
}

startServer();
