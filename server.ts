import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// =========================
// MIDDLEWARE
// =========================

app.use(cors());

app.use(
  express.json({
    limit: "20mb",
  })
);

// =========================
// GROQ CLIENT
// =========================

let groqClient: Groq | null = null;

function getGroqClient(): Groq {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      throw new Error("GROQ_API_KEY is missing in .env");
    }

    groqClient = new Groq({
      apiKey,
    });
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

// =========================
// ROOT ROUTE
// =========================

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Educational Doubt Rewriter API Running",
  });
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
You are an Intelligent Educational Doubt Rewriter and Tutor.

Your task:

1. Correct grammar and spelling.
2. Translate Hindi/Hinglish into English if needed.
3. Preserve the student's intent.
4. Identify the subject.
5. Provide confidence score.
6. Rate doubt quality.
7. Suggest improvements.
8. Identify confusion type.
9. Ask clarification questions if needed.
10. Provide a detailed educational explanation.
11. Suggest keywords.
12. Suggest formulas/laws.
13. Suggest follow-up questions.

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

    return res.json(parseGroqResponse(resultText));
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
You are a Socratic Tutor.

Rules:

1. Keep replies short (2-3 sentences).
2. Ask guiding questions.
3. Help students think.
4. Maintain a refined currentDraftQuery.
5. Be encouraging and friendly.

Return ONLY valid JSON:

{
  "assistantReply": "",
  "currentDraftQuery": "",
  "needsMoreClarification": true
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

    return res.json(parseGroqResponse(resultText));
  } catch (error: any) {
    console.error("Clarify Chat Error:", error);

    return res.status(500).json({
      error:
        error?.message ||
        "Failed to process clarification chat.",
    });
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

async function startServer() {
  try {
    if (process.env.NODE_ENV !== "production") {
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