import { buildPrompt, LearningGoalInput } from '../utils/aiPrompt';
import { randomUUID } from 'crypto';

interface DeepSeekResponse {
  courseName: string;
  subtopics: Array<{
    title: string;
    description: string;
    estimatedHours: number;
    resources: Array<{
      title: string;
      type: 'video' | 'article' | 'documentation' | 'course';
      url: string;
    }>;
  }>;
}

/**
 * Handles communication with the local Ollama instance running DeepSeek-R1.
 */
export class AiGenerationService {
  private readonly apiUrl: string;
  private readonly modelName: string;

  constructor() {
    this.apiUrl = process.env.OLLAMA_API_URL || 'http://localhost:11434';
    // DeepSeek-R1 is reasoning-based and exceptional at generating JSON
    this.modelName = 'deepseek-r1:8b';
  }

  public async generatePlan(input: LearningGoalInput): Promise<DeepSeekResponse> {
    const prompt = buildPrompt(input);
    const body = {
      model: this.modelName,
      prompt,
      stream: false,
      format: 'json', // Enforces JSON constraint in Ollama
    };

    console.log(`[AI Service] Requesting plan for "${input.topic}" from local ${this.modelName}...`);
    
    try {
      const response = await fetch(`${this.apiUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        // Add a generous timeout as local LLM inference can take 10-60+ seconds depending on hardware
        signal: AbortSignal.timeout(120000), 
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      let rawText = data.response || '';

      // Clean up DeepSeek reasoning tags (e.g., <think>...</think>)
      rawText = this.sanitizeDeepSeekOutput(rawText);

      // Safely parse JSON
      const parsedJSON = this.extractJSON(rawText);
      return parsedJSON as DeepSeekResponse;
    } catch (error: any) {
      console.error('[AI Service] Failed to generate plan:', error);
      throw new Error(`AI Generation failed: ${error.message}`);
    }
  }

  /**
   * DeepSeek-R1 wraps its "internal monologue" in <think> tags. 
   * This strips them out to ensure we only process the final JSON output.
   */
  private sanitizeDeepSeekOutput(text: string): string {
    const thinkRegex = /<think>[\s\S]*?<\/think>/gi;
    return text.replace(thinkRegex, '').trim();
  }

  /**
   * Extracts JSON from a string, handling edge cases where the LLM might have
   * prepended text or markdown code blocks around the JSON object.
   */
  private extractJSON(text: string): Record<string, any> {
    try {
      // First, try a direct parse assuming clean JSON
      return JSON.parse(text);
    } catch (e) {
      // Fallback: look for `{ ... }` block
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('LLM output could not be parsed into a JSON object.');
    }
  }
}

export const aiGenerationService = new AiGenerationService();
