import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import type { Provider } from '@helm/config';

interface ProviderOption {
  value: Provider;
  label: string;
  description: string;
}

const PROVIDERS: ProviderOption[] = [
  {
    value: 'anthropic',
    label: 'Anthropic Claude',
    description: 'Recommended — claude-3-5-sonnet, claude-3-haiku',
  },
  {
    value: 'openai',
    label: 'OpenAI',
    description: 'GPT-4o, GPT-4o-mini, GPT-4-turbo',
  },
  {
    value: 'google',
    label: 'Google Gemini',
    description: 'gemini-1.5-pro, gemini-1.5-flash',
  },
  {
    value: 'local',
    label: 'Local model',
    description: 'Ollama / vLLM with custom base URL',
  },
];

interface ProviderSelectProps {
  onComplete: (provider: Provider) => void;
  onBack: () => void;
}

export function ProviderSelect({ onComplete, onBack }: ProviderSelectProps) {
  const [selected, setSelected] = useState(0);

  useInput((input, key) => {
    if (key.upArrow) setSelected((s) => Math.max(0, s - 1));
    if (key.downArrow) setSelected((s) => Math.min(PROVIDERS.length - 1, s + 1));
    if (key.return) onComplete(PROVIDERS[selected].value);
    if (key.escape || input === 'b') onBack();
  });

  return (
    <Box flexDirection="column" paddingX={4} paddingY={2}>
      <Text bold color="cyan">
        Select your LLM provider
      </Text>
      <Text color="gray">
        You can change this later with /model
      </Text>
      <Box marginTop={1} flexDirection="column">
        {PROVIDERS.map((p, i) => {
          const isSelected = i === selected;
          return (
            <Box key={p.value} marginBottom={1} flexDirection="column">
              <Box>
                <Text color={isSelected ? 'cyan' : 'gray'} bold={isSelected}>
                  {isSelected ? '▶ ' : '  '}
                </Text>
                <Text color={isSelected ? 'white' : 'gray'} bold={isSelected}>
                  {p.label}
                </Text>
              </Box>
              <Box paddingLeft={3}>
                <Text color={isSelected ? 'gray' : 'gray'} dimColor={!isSelected}>
                  {p.description}
                </Text>
              </Box>
            </Box>
          );
        })}
      </Box>
      <Box marginTop={1}>
        <Text color="gray" dimColor>
          ↑↓ navigate  ·  Enter to select  ·  b to go back
        </Text>
      </Box>
    </Box>
  );
}
