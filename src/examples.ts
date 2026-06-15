export interface DoubtExample {
  title: string;
  raw: string;
  badge: string;
  language: string;
  icon: string;
}

export const DOUBT_EXAMPLES: DoubtExample[] = [
  {
    title: "AC Current Reversion",
    raw: "current kyu reverse hota hai ac me",
    badge: "Physics",
    language: "Hinglish",
    icon: "Zap",
  },
  {
    title: "Integration Formulas",
    raw: "integration formula not understanding",
    badge: "Mathematics",
    language: "Broken English",
    icon: "Binary",
  },
  {
    title: "Java Loop Debugging",
    raw: "java loop issue",
    badge: "Computer Science",
    language: "Short & Ambiguous",
    icon: "Code",
  },
  {
    title: "Erroneous Derivation",
    raw: "mera derivation galat aa raha hai",
    badge: "Math/Physics",
    language: "Hindi + Latin script",
    icon: "FileSignature",
  },
  {
    title: "AC Motor Inherent Stability",
    raw: "why current opposite in ac motor not stable??",
    badge: "Engineering / Physics",
    language: "Unclear grammar",
    icon: "Cpu",
  },
];
