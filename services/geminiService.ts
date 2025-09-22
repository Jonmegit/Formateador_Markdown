
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const formatMarkdown = async (text: string): Promise<string> => {
  const prompt = `
    You are an expert in Markdown formatting. Your task is to correct, clean, and properly format the user-provided text into valid, readable Markdown.
    
    Correct any syntax errors, fix inconsistencies, and ensure it's well-structured and readable. 
    Pay attention to headings, lists, code blocks, and emphasis.
    For file structures, use a proper code block with tree-like notation.
    Do not add any new content, comments, or explanations. Only return the corrected Markdown code itself.

    Here is the text to format:
    ---
    ${text}
    ---
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to format Markdown. Please check your API key and network connection.");
  }
};
