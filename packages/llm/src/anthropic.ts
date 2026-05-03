import Anthropic from '@anthropic-ai/sdk';
import type { LLMProvider, Message } from './base.js';

export class AnthropicProvider implements LLMProvider {
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model?: string) {
    this.client = new Anthropic({ apiKey });
    this.model = model ?? this.getDefaultModel();
  }

  getProviderName(): string {
    return 'Anthropic Claude';
  }

  getDefaultModel(): string {
    return 'claude-3-5-sonnet-20241022';
  }

  async validateKey(apiKey: string): Promise<boolean> {
    try {
      const client = new Anthropic({ apiKey });
      await client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'ping' }],
      });
      return true;
    } catch {
      return false;
    }
  }

  async chat(
    messages: Message[],
    systemPrompt: string,
    onToken: (token: string) => void,
  ): Promise<string> {
    let fullText = '';

    const stream = this.client.messages.stream({
      model: this.model,
      max_tokens: 8096,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        onToken(event.delta.text);
        fullText += event.delta.text;
      }
    }

    return fullText;
  }
}
