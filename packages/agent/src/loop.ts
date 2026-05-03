import type { LLMProvider, Message } from '@helm/llm';
import { embodyPrompt, buildPrompt } from './prompts/index.js';

export type AgentMode = 'embody' | 'build';

export type AgentEvent =
  | { type: 'token'; content: string }
  | { type: 'message_start' }
  | { type: 'message_end'; fullContent: string }
  | { type: 'error'; error: string };

export class AgentLoop {
  private messages: Message[] = [];
  private mode: AgentMode;
  private provider: LLMProvider;
  private systemPrompt: string;

  constructor(provider: LLMProvider, mode: AgentMode = 'build') {
    this.provider = provider;
    this.mode = mode;
    this.systemPrompt = this.loadSystemPrompt(mode);
  }

  private loadSystemPrompt(mode: AgentMode): string {
    return mode === 'embody' ? embodyPrompt : buildPrompt;
  }

  setMode(mode: AgentMode): void {
    this.mode = mode;
    this.systemPrompt = this.loadSystemPrompt(mode);
  }

  getMode(): AgentMode {
    return this.mode;
  }

  setProvider(provider: LLMProvider): void {
    this.provider = provider;
  }

  clearHistory(): void {
    this.messages = [];
  }

  getMessages(): Message[] {
    return [...this.messages];
  }

  async send(
    userMessage: string,
    onEvent: (event: AgentEvent) => void,
  ): Promise<void> {
    this.messages.push({ role: 'user', content: userMessage });
    onEvent({ type: 'message_start' });

    let fullResponse = '';
    try {
      fullResponse = await this.provider.chat(
        this.messages,
        this.systemPrompt,
        (token) => {
          onEvent({ type: 'token', content: token });
        },
      );
      this.messages.push({ role: 'assistant', content: fullResponse });
      onEvent({ type: 'message_end', fullContent: fullResponse });
    } catch (err) {
      this.messages.pop();
      const message = err instanceof Error ? err.message : String(err);
      onEvent({ type: 'error', error: message });
    }
  }
}
