import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Box, useStdout, useInput, useApp } from 'ink';
import { StatusBar } from './components/status-bar.js';
import { Conversation } from './components/conversation.js';
import { InputBox } from './components/input-box.js';
import { HelpOverlay } from './components/help-overlay.js';
import { CommandPalette } from './components/command-palette.js';
import { AgentLoop } from '@helm/agent';
import type { AgentMode } from '@helm/agent';
import { AnthropicProvider, OpenAIProvider } from '@helm/llm';
import type { Message } from '@helm/llm';
import { readConfig, updateConfig } from '@helm/config';
import type { Provider } from '@helm/config';

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

  const [dimensions, setDimensions] = useState({
    width: stdout?.columns ?? 80,
    rows: stdout?.rows ?? 24,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: stdout?.columns ?? 80,
        rows: stdout?.rows ?? 24,
      });
    };
    stdout?.on('resize', handleResize);
    return () => {
      stdout?.off('resize', handleResize);
    };
  }, [stdout]);

  const config = readConfig();
  const [mode, setMode] = useState<AgentMode>(config.default_mode);
  const [provider] = useState<Provider>(config.provider);
  const [model] = useState(config.model ?? 'claude-3-5-sonnet-20241022');

  const agentRef = useRef<AgentLoop | null>(null);
  if (!agentRef.current) {
    agentRef.current = new AgentLoop(buildProvider(config), config.default_mode);
  }

  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  // Show command palette whenever input starts with /
  const showPalette = inputValue.startsWith('/') && !isThinking;

  useInput((input, key) => {
    if (key.ctrl && input === 'c') {
      exit();
    }
  });

  const handleCommand = useCallback(
    (cmd: string): boolean => {
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
              role: 'assistant' as const,
              content: `Switched to **${newMode === 'embody' ? 'Embody' : 'Build'}** mode.`,
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant' as const,
              content: 'Usage: `/mode embody` or `/mode build`',
            },
          ]);
        }
        return true;
      }
      if (name === '/model') {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant' as const,
            content: `**Model:** ${model}\n**Provider:** ${provider}`,
          },
        ]);
        return true;
      }
      if (name === '/config') {
        const cfg = readConfig();
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant' as const,
            content: [
              `**Provider:** ${cfg.provider}`,
              `**Model:** ${cfg.model ?? 'default'}`,
              `**Mode:** ${cfg.default_mode}`,
              `**Config:** \`~/.helm/config.toml\``,
            ].join('\n'),
          },
        ]);
        return true;
      }
      return false;
    },
    [exit, model, provider],
  );

  const handleSubmit = useCallback(
    async (value: string) => {
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
            {
              role: 'assistant' as const,
              content: `Unknown command: \`${trimmed}\`\nType \`/help\` for a list.`,
            },
          ]);
        }
        return;
      }

      if (trimmed.startsWith('!')) {
        const shellCmd = trimmed.slice(1).trim();
        setMessages((prev) => [...prev, { role: 'user' as const, content: trimmed }]);
        try {
          const { execSync } = await import('child_process');
          const out = execSync(shellCmd, { encoding: 'utf-8', timeout: 30000 });
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant' as const,
              content: '```\n' + (out || '(no output)') + '\n```',
            },
          ]);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          setMessages((prev) => [
            ...prev,
            { role: 'assistant' as const, content: `**Shell error:** ${msg}` },
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
    },
    [isThinking, handleCommand],
  );

  const handlePaletteSelect = useCallback((value: string) => {
    if (value.endsWith(' ')) {
      setInputValue(value);
    } else {
      handleSubmit(value);
      setInputValue('');
    }
  }, [handleSubmit]);

  // Layout heights
  const statusBarHeight = 2;   // 1 content + 1 top border
  const inputBoxHeight = 2;    // 1 content + 1 top border
  const paletteVisible = showPalette && !showHelp;
  const paletteHeight = paletteVisible
    ? Math.min(
        inputValue.startsWith('/')
          ? ['', ...Array(7)].filter((_, i) =>
              ['/help', '/clear', '/mode embody', '/mode build', '/model', '/config', '/quit'][i]?.startsWith(inputValue),
            ).length + 1
          : 9,
        9,
      )
    : 0;
  const conversationHeight =
    dimensions.rows - statusBarHeight - inputBoxHeight - (paletteVisible ? paletteHeight : 0) - (showHelp ? 0 : 0);

  return (
    <Box flexDirection="column" width={dimensions.width} height={dimensions.rows}>
      <StatusBar
        mode={mode}
        provider={provider}
        model={model}
        isThinking={isThinking}
        width={dimensions.width}
      />

      {showHelp ? (
        <Box flexGrow={1} overflowY="hidden">
          <HelpOverlay width={dimensions.width} />
        </Box>
      ) : (
        <Box flexGrow={1} overflowY="hidden">
          <Conversation
            messages={messages}
            streamingContent={streamingContent}
            isThinking={isThinking}
            error={error}
            height={conversationHeight}
            width={dimensions.width}
          />
        </Box>
      )}

      {paletteVisible && (
        <CommandPalette
          query={inputValue}
          onSelect={handlePaletteSelect}
          onDismiss={() => setInputValue('')}
          width={dimensions.width}
        />
      )}

      <InputBox
        value={inputValue}
        onChange={setInputValue}
        onSubmit={handleSubmit}
        isDisabled={isThinking}
        width={dimensions.width}
      />
    </Box>
  );
}
