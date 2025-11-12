import { GoogleGenAI } from "@google/genai";
import { translations, type Language, type ModelConfig } from "../lib/translations";

export const validateApiKey = async (key: string): Promise<boolean> => {
    if (!key) return false;
    const ai = new GoogleGenAI({ apiKey: key });
    try {
        // Use a lightweight model and a very short prompt to validate the key
        await ai.models.generateContent({ model: "gemini-2.5-flash", contents: "test" });
        return true;
    } catch (error) {
        console.error("API Key validation failed:", error);
        return false;
    }
};

export interface AiAnalysisResult {
    score: number;
    assessment: string;
    analysis: string;
    suggestions?: string[];
}

export interface PlagiarismAnalysisResult {
    score: number;
    assessment: string;
    analysis: string;
    plagiarizedSegments: string[];
}


export const runAnalysis = async (
    text: string,
    apiKey: string,
    language: Language,
    model: 'gemini-2.5-flash' | 'gemini-2.5-pro',
    config: ModelConfig
): Promise<{
    plagiarismResult: PlagiarismAnalysisResult;
    aiResult: AiAnalysisResult;
    sources: any[];
}> => {
  const ai = new GoogleGenAI({ apiKey });
  const prompt = translations[language].ai.prompt;
  const t_config = translations[language].ui.config;

  // Construct the system instruction from the config parts
  const systemInstruction = `
# ${t_config.behavior.persona.label.toUpperCase()}
${config.persona}

# ${t_config.behavior.context.label.toUpperCase()}
${config.context}

# ${t_config.memory.label.toUpperCase()}
${config.memory}
  `.trim();
  
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: `${prompt}\n${text}`,
      config: {
        systemInstruction: systemInstruction,
        temperature: config.temperature,
        topK: config.topK,
        topP: config.topP,
        tools: [{ googleSearch: {} }],
      },
    });

    const fullText = response.text;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    
    // --- Plagiarism Parsing ---
    const plagiarismSection = fullText.split('[PLAGIARISM_ANALYSIS_END]')[0].split('[PLAGIARISM_ANALYSIS_START]')[1] || '';
    const {
        scoreKey,
        assessmentKey,
        plagiarizedSegmentsKey,
    } = translations[language].ai;

    const plagiarismScoreMatch = plagiarismSection.match(new RegExp(`${scoreKey}: (\\d+)`));
    const plagiarismAssessmentMatch = plagiarismSection.match(new RegExp(`${assessmentKey}: (.*)`));
    const plagiarismAnalysisMatch = plagiarismSection.split('---');
    
    // --- Plagiarized Segments Parsing ---
    const segmentsSection = fullText.split('[PLAGIARIZED_SEGMENTS_END]')[0].split('[PLAGIARIZED_SEGMENTS_START]')[1] || '';
    const segmentsMatch = segmentsSection.match(new RegExp(`${plagiarizedSegmentsKey}: (.*)`));
    const segments = segmentsMatch ? segmentsMatch[1].split('|||').map(s => s.trim()).filter(Boolean) : [];

    const plagiarismResult: PlagiarismAnalysisResult = {
        score: plagiarismScoreMatch ? parseInt(plagiarismScoreMatch[1], 10) : 0,
        assessment: plagiarismAssessmentMatch ? plagiarismAssessmentMatch[1].trim() : "error.assessmentFailed",
        analysis: plagiarismAnalysisMatch.length > 1 ? plagiarismAnalysisMatch[1].trim() : plagiarismSection,
        plagiarizedSegments: segments
    };

    // --- AI Detection Parsing ---
    const aiSection = fullText.split('[AI_ANALYSIS_END]')[0].split('[AI_ANALYSIS_START]')[1] || '';
    const {
        aiScoreKey,
        aiAssessmentKey,
        humanizingSuggestionsKey
    } = translations[language].ai;

    const aiScoreMatch = aiSection.match(new RegExp(`${aiScoreKey}: (\\d+)`));
    const aiAssessmentMatch = aiSection.match(new RegExp(`${aiAssessmentKey}: (.*)`));
    const aiAnalysisMatch = aiSection.split('---');
    
    // --- AI Suggestions Parsing ---
    const suggestionsSection = fullText.split('[HUMANIZING_SUGGESTIONS_END]')[0].split('[HUMANIZING_SUGGESTIONS_START]')[1] || '';
    const suggestionsMatch = suggestionsSection.match(new RegExp(`${humanizingSuggestionsKey}: (.*)`));
    const suggestions = suggestionsMatch ? suggestionsMatch[1].split('|||').map(s => s.trim()).filter(Boolean) : [];

    const aiResult: AiAnalysisResult = {
        score: aiScoreMatch ? parseInt(aiScoreMatch[1], 10) : 0,
        assessment: aiAssessmentMatch ? aiAssessmentMatch[1].trim() : "error.assessmentFailed",
        analysis: aiAnalysisMatch.length > 1 ? aiAnalysisMatch[1].trim() : aiSection,
        suggestions: suggestions.length > 0 ? suggestions : undefined,
    };

    return { plagiarismResult, aiResult, sources };

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error && (error.message.includes('API key not valid') || error.message.includes('API key is invalid'))) {
        throw new Error("error.invalidApiKey");
    }
    throw new Error("error.apiFail");
  }
};