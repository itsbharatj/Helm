export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface StreamEvent {
  type: 'token' | 'done';
  token?: string;
}

export interface LLMProvider {
  chat(
    messages: Message[],
    systemPrompt: string,
    onToken: (token: string) => void,
  ): Promise<string>;
  validateKey(apiKey: string): Promise<boolean>;
  getDefaultModel(): string;
  getProviderName(): string;
}
