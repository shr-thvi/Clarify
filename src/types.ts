export interface DoubtRewriteResult {
  originalDoubt: string;
  rewrittenDoubt: string;
  subject: string;
  confidence: number;
  confusionLevel: string;
  doubtQualityScore: number;
  doubtQualityTips: string[];
  clarificationNeeded: boolean;
  clarificationQuestion: string;
  recommendedKeywords: string[];
  explanation: string;
  relatedFormulas: string[];
  additionalFollowUps: string[];
  isMultilingual: boolean;
  detectedLanguages: string[];
}

export interface SavedDoubt {
  id: string;
  timestamp: string;
  rawInput: string;
  mode: string;
  result: DoubtRewriteResult;
  starred: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "tutor";
  content: string;
  draftQuery?: string;
  confidenceInDraft?: number;
  nextSuggestedInput?: string;
}
