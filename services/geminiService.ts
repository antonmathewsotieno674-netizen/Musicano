import { GoogleGenAI, Chat } from "@google/genai";

let chatSession: Chat | null = null;
let ai: GoogleGenAI | null = null;

const initializeAI = () => {
  if (!process.env.API_KEY) {
    console.warn("Gemini API Key is missing.");
    return null;
  }
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

export const startChatSession = () => {
  const aiInstance = initializeAI();
  if (!aiInstance) return null;

  if (!chatSession) {
    chatSession = aiInstance.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: "You are a professional DJ Assistant called 'Virtuoso AI'. You help the user with mixing advice, track compatibility (BPM/Key), and creative ideas for transitions. Keep responses concise, energetic, and helpful for a live performance context. You can analyze track metadata provided to you.",
      },
    });
  }
  return chatSession;
};

export const sendMessageToAI = async (message: string): Promise<string> => {
  const session = startChatSession();
  if (!session) return "AI Configuration Error: Missing API Key.";

  try {
    const result = await session.sendMessage({ message });
    return result.text || "I couldn't process that request.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Connection error. Please try again.";
  }
};

export const analyzeTrackCompatibility = async (trackA: string, trackB: string): Promise<string> => {
  const session = startChatSession();
  if (!session) return "AI Offline";

  const prompt = `I am mixing '${trackA}' into '${trackB}'. Analyze their potential compatibility based on standard EDM structures and suggest a transition technique.`;
  
  try {
    const result = await session.sendMessage({ message: prompt });
    return result.text || "No analysis available.";
  } catch (error) {
    return "Analysis failed.";
  }
};
