import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function* formatMarkdownStream(text: string, customInstruction: string) {
  let prompt = `
    You are an expert in Markdown formatting. Your task is to correct, clean, and properly format the user-provided text into valid, readable Markdown.
    
    Correct any syntax errors, fix inconsistencies, and ensure it's well-structured and readable. 
    Pay attention to headings, lists, code blocks, and emphasis.
    For file structures, use a proper code block with tree-like notation.
    Do not add any new content, comments, or explanations. Only return the corrected Markdown code itself.
  `;

  if (customInstruction && customInstruction.trim()) {
    prompt += `
      \nIMPORTANT: The user has provided the following specific instructions. You MUST follow them:
      ---
      ${customInstruction}
      ---
    `;
  }

  prompt += `
    \nHere is the text to format:
    ---
    ${text}
    ---
  `;

  try {
    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error("Error streaming from Gemini API:", error);
    throw new Error("Failed to format Markdown. Please check your API key and network connection.");
  }
};