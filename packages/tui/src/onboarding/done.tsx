import React, { useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import type { Mode, Provider } from '@helm/config';

interface DoneProps {
  provider: Provider;
  mode: Mode;
  onComplete: () => void;
}

const PROVIDER_LABELS: Record<Provider, string> = {
  anthropic: 'Anthropic Claude',
  openai: 'OpenAI',
  google: 'Google Gemini',
  local: 'Local model',
};

export function Done({ provider, mode, onComplete }: DoneProps) {
  useInput((_, key) => {
    if (key.return || key.escape) onComplete();
  });

  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <Box flexDirection="column" paddingX={4} paddingY={2}>
      <Text bold color="green">
        ✓  Helm is ready
      </Text>
      <Box marginTop={1} flexDirection="column" gap={0}>
        <Box>
          <Text color="gray">Provider:  </Text>
          <Text color="white">{PROVIDER_LABELS[provider]}</Text>
        </Box>
        <Box>
          <Text color="gray">Mode:      </Text>
          <Text color="white">{mode === 'build' ? 'Build' : 'Embody'}</Text>
        </Box>
      </Box>
      <Box marginTop={2} flexDirection="column">
        <Text bold color="cyan">
          Key commands
        </Text>
        <Box marginTop={1} flexDirection="column" gap={0}>
          <Box>
            <Box width={20}><Text color="green">/mode embody</Text></Box>
            <Text color="gray">Switch to robot control mode</Text>
          </Box>
          <Box>
            <Box width={20}><Text color="green">/mode build</Text></Box>
            <Text color="gray">Switch to software build mode</Text>
          </Box>
          <Box>
            <Box width={20}><Text color="green">/clear</Text></Box>
            <Text color="gray">Clear conversation history</Text>
          </Box>
          <Box>
            <Box width={20}><Text color="green">/help</Text></Box>
            <Text color="gray">Show all commands</Text>
          </Box>
          <Box>
            <Box width={20}><Text color="yellow">Ctrl+C</Text></Box>
            <Text color="gray">Exit (E-stop in Embody mode)</Text>
          </Box>
        </Box>
      </Box>
      <Box marginTop={2}>
        <Text color="gray" dimColor>
          Starting in 3 seconds…  Press Enter to continue now.
        </Text>
      </Box>
    </Box>
  );
}
