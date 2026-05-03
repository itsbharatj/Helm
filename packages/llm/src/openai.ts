import type { LLMProvider, Message } from './base.js';

export class OpenAIProvider implements LLMProvider {
  private apiKey: string;
  private model: string;
  private baseURL: string;

  constructor(apiKey: string, model?: string, baseURL?: string) {
    this.apiKey = apiKey;
    this.model = model ?? this.getDefaultModel();
    this.baseURL = baseURL ?? 'https://api.openai.com/v1';
  }

  getProviderName(): string {
    return this.baseURL.includes('openai.com') ? 'OpenAI' : 'Local Model';
  }

  getDefaultModel(): string {
    return 'gpt-4o';
  }

  async validateKey(apiKey: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseURL}/models`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async chat(
    messages: Message[],
    systemPrompt: string,
    onToken: (token: string) => void,
  ): Promise<string> {
    const res = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        stream: true,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenAI API error: ${res.status} ${res.statusText}`);
    }

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      for (const line of chunk.split('\n')) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') break;
        try {
          const json = JSON.parse(data);
          const token: string = json.choices?.[0]?.delta?.content ?? '';
          if (token) {
            onToken(token);
            fullText += token;
          }
        } catch {
          // skip malformed lines
        }
      }
    }

    return fullText;
  }
}
