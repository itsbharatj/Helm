import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Box, useStdout, useInput, useApp } from 'ink';
import { StatusBar } from './components/status-bar.js';
import { Conversation } from './components/conversation.js';
import { InputBox } from './components/input-box.js';
import { HelpOverlay } from './components/help-overlay.js';
import { AgentLoop } from '@helm/agent';
import type { AgentMode } from '@helm/agent';
import { AnthropicProvider, OpenAIProvider } from '@helm/llm';
import type { Message } from '@helm/llm';
import { readConfig, updateConfig } from '@helm/config';
import type { Provider } from '@helm/config';

const HELP_TEXT = `
Helm slash commands:
  /help           Show this help
  /clear          Clear conversation
  /mode embody    Switch to Embody mode
  /mode build     Switch to Build mode
  /model          Show current model
  /config         Show current config
  /quit           Exit Helm

Prefix with ! to run a shell command.
`.trim();

function buildProvider(config: ReturnType<typeof readConfig>) {
  if (config.provider === 'anthropic') {
    return new AnthropicProvider(config.api_key ?? '', config.model);
  }
  return new OpenAIProvider(
    config.api_key ?? '',
    config.model,
    config.local_base_url,
  );
}

export function Shell() {
  const { stdout } = useStdout();
  const { exit } = useApp();
  const [width, setWidth] = useState(stdout?.columns ?? 80);
  const [height, setHeight] = useState(stdout?.rows ?? 24);

  const config = readConfig();
  const [mode, setMode] = useState<AgentMode>(config.default_mode);
  const [provider, setProvider] = useState<Provider>(config.provider);
  const [model, setModel] = useState(config.model ?? 'claude-3-5-sonnet-20241022');

  const agentRef = useRef<AgentLoop | null>(null);
  if (!agentRef.current) {
    const llm = buildProvider(config);
    agentRef.current = new AgentLoop(llm, config.default_mode);
  }

  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setWidth(stdout?.columns ?? 80);
      setHeight(stdout?.rows ?? 24);
    };
    stdout?.on('resize', handleResize);
    return () => { stdout?.off('resize', handleResize); };
  }, [stdout]);

  useInput((input, key) => {
    if (key.ctrl && input === 'c') {
      exit();
    }
  });

  const handleCommand = useCallback((cmd: string): boolean => {
    const parts = cmd.trim().split(/\s+/);
    const name = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (name === '/quit' || name === '/exit') {
      exit();
      return true;
    }
    if (name === '/clear') {
      agentRef.current?.clearHistory();
      setMessages([]);
      setStreamingContent('');
      setError(null);
      return true;
    }
    if (name === '/help') {
      setShowHelp((s) => !s);
      return true;
    }
    if (name === '/mode') {
      const newMode = args[0] as AgentMode;
      if (newMode === 'embody' || newMode === 'build') {
        setMode(newMode);
        agentRef.current?.setMode(newMode);
        updateConfig({ default_mode: newMode });
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `Switched to ${newMode === 'embody' ? 'Embody' : 'Build'} mode.`,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Usage: /mode embody | /mode build' },
        ]);
      }
      return true;
    }
    if (name === '/model') {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Current model: ${model}  (provider: ${provider})` },
      ]);
      return true;
    }
    if (name === '/config') {
      const cfg = readConfig();
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: [
            `Provider:    ${cfg.provider}`,
            `Model:       ${cfg.model ?? 'default'}`,
            `Mode:        ${cfg.default_mode}`,
            `Config:      ~/.helm/config.toml`,
          ].join('\n'),
        },
      ]);
      return true;
    }
    return false;
  }, [exit, model, provider]);

  const handleSubmit = useCallback(async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || isThinking) return;
    setInputValue('');
    setError(null);
    setShowHelp(false);

    if (trimmed.startsWith('/')) {
      const handled = handleCommand(trimmed);
      if (!handled) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `Unknown command: ${trimmed}. Type /help for a list.` },
        ]);
      }
      return;
    }

    if (trimmed.startsWith('!')) {
      const shellCmd = trimmed.slice(1).trim();
      setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
      try {
        const { execSync } = await import('child_process');
        const out = execSync(shellCmd, { encoding: 'utf-8', timeout: 30000 });
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: out || '(no output)' },
        ]);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `Shell error: ${msg}` },
        ]);
      }
      return;
    }

    setIsThinking(true);
    setStreamingContent('');

    await agentRef.current?.send(trimmed, (event) => {
      if (event.type === 'message_start') {
        setIsThinking(true);
        setStreamingContent('');
      } else if (event.type === 'token') {
        setStreamingContent((s) => s + event.content);
      } else if (event.type === 'message_end') {
        setIsThinking(false);
        setStreamingContent('');
        setMessages(agentRef.current?.getMessages() ?? []);
      } else if (event.type === 'error') {
        setIsThinking(false);
        setStreamingContent('');
        setError(event.error);
      }
    });
  }, [isThinking, handleCommand]);

  const conversationHeight = height - 4;

  return (
    <Box flexDirection="column" width={width} height={height}>
      <StatusBar
        mode={mode}
        provider={provider}
        model={model}
        isThinking={isThinking}
        width={width}
      />
      {showHelp ? (
        <HelpOverlay width={width} />
      ) : (
        <Conversation
          messages={messages}
          streamingContent={streamingContent}
          isThinking={isThinking}
          error={error}
          height={conversationHeight}
          width={width}
        />
      )}
      <InputBox
        value={inputValue}
        onChange={setInputValue}
        onSubmit={handleSubmit}
        isDisabled={isThinking}
        width={width}
      />
    </Box>
  );
}
