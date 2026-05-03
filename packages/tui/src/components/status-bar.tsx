import React from 'react';
import { Box, Text } from 'ink';
import type { AgentMode } from '@helm/agent';
import type { Provider } from '@helm/config';

interface StatusBarProps {
  mode: AgentMode;
  provider: Provider;
  model: string;
  isThinking: boolean;
  width: number;
}

const PROVIDER_LABELS: Record<Provider, string> = {
  anthropic: 'Claude',
  openai: 'OpenAI',
  google: 'Gemini',
  local: 'Local',
};

const MODE_COLORS: Record<AgentMode, string> = {
  embody: 'cyan',
  build: 'green',
};

export function StatusBar({ mode, provider, model, isThinking, width }: StatusBarProps) {
  const modeLabel = mode === 'embody' ? 'Embody' : 'Build';
  const providerLabel = PROVIDER_LABELS[provider];
  const modelShort = model.split('-').slice(0, 3).join('-');
  const thinkingIndicator = isThinking ? ' ◌' : '';

  return (
    <Box
      width={width}
      borderStyle="single"
      borderBottom={false}
      borderLeft={false}
      borderRight={false}
      borderTop={true}
      paddingX={1}
    >
      <Text bold color="white">
        Helm
      </Text>
      <Text color="gray">  │  </Text>
      <Text color="white">Mode: </Text>
      <Text bold color={MODE_COLORS[mode]}>
        {modeLabel}
      </Text>
      <Text color="gray">  │  </Text>
      <Text color="white">{providerLabel} </Text>
      <Text color="gray">({modelShort})</Text>
      <Text color="yellow">{thinkingIndicator}</Text>
    </Box>
  );
}
