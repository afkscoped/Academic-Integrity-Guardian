
import OpenAI from "openai";
import { SimilarityAnalysis } from "../types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.API_KEY,
  dangerouslyAllowBrowser: true // Since this is a client-side Vite app
});

export const analyzeSemanticSimilarity = async (content: string): Promise<SimilarityAnalysis> => {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are an academic integrity expert. Analyze the following text for semantic similarity and plagiarism. Provide a detailed report in JSON format."
      },
      {
        role: "user",
        content: `Analyze the following academic text for semantic similarity and plagiarism. 
               Provide a detailed explainable report. 
               Identify specific segments that might be problematic and explain why.
               Crucially, identify specific academic papers, articles, or online sources (referencing arXiv, Google Scholar, etc.) that the content resembles or matches.
               For each reference found, provide the formal Title of the paper and a direct functional URL (e.g., to arXiv or DOI) if possible.
               Text: ${content.substring(0, 5000)}`
      }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "similarity_analysis",
        strict: true,
        schema: {
          type: "object",
          properties: {
            score: { type: "number", description: "Overall similarity percentage 0-100" },
            summary: { type: "string", description: "Executive summary of the analysis" },
            references: {
              type: "array",
              description: "List of matching academic papers/sources (arXiv, Google Scholar, etc.)",
              items: {
                type: "object",
                properties: {
                  title: { type: "string", description: "The full title of the academic paper" },
                  url: { type: "string", description: "Functional URL to the source (arXiv, Google Scholar, DOI)" }
                },
                required: ["title", "url"],
                additionalProperties: false
              }
            },
            segments: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  text: { type: "string" },
                  similarity: { type: "number", description: "Similarity weight for this segment 0-1" },
                  source: { type: "string", description: "Likely source or reference" },
                  explanation: { type: "string", description: "Why this segment was flagged" }
                },
                required: ["text", "similarity", "source", "explanation"],
                additionalProperties: false
              }
            }
          },
          required: ["score", "summary", "segments", "references"],
          additionalProperties: false
        }
      }
    }
  });

  try {
    const content = response.choices[0].message.content;
    if (!content) throw new Error("No content in response");
    return JSON.parse(content) as SimilarityAnalysis;
  } catch (e) {
    console.error("Failed to parse AI response", e);
    throw new Error("Analysis failed");
  }
};

export const getWritingSuggestions = async (content: string) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are an ethical writing coach."
      },
      {
        role: "user",
        content: `Provide 3 constructive suggestions to improve the academic integrity and clarity of this draft. 
               Focus on paraphrasing, citation, and ethical writing.
               Text: ${content.substring(0, 1000)}`
      }
    ],
    temperature: 0.7,
    max_tokens: 500
  });
  return response.choices[0].message.content;
};

export const paraphraseSentence = async (sentence: string): Promise<string[]> => {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are an ethical writing coach for a university student."
      },
      {
        role: "user",
        content: `Provide 3 sophisticated academic paraphrases of the following text. 
               The variations must maintain the exact meaning but use different sentence structures and vocabulary.
               Focus on avoiding word-for-word similarity while maintaining high formal tone.
               Input: "${sentence}"`
      }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "paraphrase_variations",
        strict: true,
        schema: {
          type: "object",
          properties: {
            variations: {
              type: "array",
              items: { type: "string" }
            }
          },
          required: ["variations"],
          additionalProperties: false
        }
      }
    }
  });

  try {
    const content = response.choices[0].message.content;
    if (!content) return ["Error generating paraphrases."];
    const data = JSON.parse(content);
    return data.variations;
  } catch (e) {
    return ["Error generating paraphrases. Please try again."];
  }
};
