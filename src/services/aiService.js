import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const generateMermaidFromPrompt = async (prompt) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const systemPrompt = `You are a diagram generator. The user will describe a process, system, or concept.
Your job is to return ONLY valid Mermaid flowchart syntax. No explanation, no markdown code blocks, no extra text.

Rules:
- Always start with: graph TD
- Use A[Label] for normal rectangle nodes
- Use A{Label} for decision/diamond nodes  
- Use A([Label]) for start/end oval nodes
- Use A --> B for connections
- Use A -->|label| B for labeled connections
- Keep labels short (max 4 words)
- Max 10 nodes
- IDs must be single letters or short alphanumeric like A, B, C1

Example output:
graph TD
  A([Start]) --> B[Enter Credentials]
  B --> C{Valid?}
  C -->|Yes| D[Dashboard]
  C -->|No| E[Show Error]
  E --> B
  D --> F([End])

Now generate a flowchart for: ${prompt}`;

  const result = await model.generateContent(systemPrompt);
  const raw = result.response.text().trim();

  console.log('RAW AI RESPONSE:', JSON.stringify(raw));

  // Strip markdown code fences
  let text = raw
    .replace(/```mermaid/gi, '')
    .replace(/```/g, '')
    .trim();

  // Extract only the part starting from "graph TD" (case-insensitive)
  const graphIndex = text.search(/graph\s+(?:TD|LR|RL|BT|TB)/i);
  if (graphIndex !== -1) {
    text = text.slice(graphIndex);
  }

  // Remove any trailing text after the last valid mermaid line
  const lines = text.split('\n').filter(line => {
    const t = line.trim();
    if (!t) return false;
    // Keep graph declaration, node definitions, and edge lines
    return (
      /^(?:graph|flowchart)\s/i.test(t) ||
      /^\w+/.test(t)
    );
  });

  const cleaned = lines.join('\n').trim();

  console.log('CLEANED MERMAID:', JSON.stringify(cleaned));

  if (!cleaned.startsWith('graph')) {
    throw new Error('AI did not return valid Mermaid syntax');
  }

  return cleaned;
};