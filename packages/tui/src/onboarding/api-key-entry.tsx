import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import type { Provider } from '@helm/config';
import { AnthropicProvider } from '@helm/llm';
import { OpenAIProvider } from '@helm/llm';

interface ApiKeyEntryProps {
  provider: Provider;
  onComplete: (apiKey: string) => void;
  onBack: () => void;
  onSkip: () => void;
}

const PROVIDER_HINTS: Record<Provider, string> = {
  anthropic: 'Starts with sk-ant-…  (anthropic.com/settings/api-keys)',
  openai: 'Starts with sk-…  (platform.openai.com/api-keys)',
  google: 'Get it at aistudio.google.com',
  local: 'Enter any string (used as Bearer token, or leave blank)',
};

const PROVIDER_LABELS: Record<Provider, string> = {
  anthropic: 'Anthropic',
  openai: 'OpenAI',
  google: 'Google Gemini',
  local: 'Local model',
};

type ValidationState = 'idle' | 'validating' | 'valid' | 'invalid';

async function validateKey(provider: Provider, apiKey: string): Promise<boolean> {
  if (provider === 'local') return true;
  try {
    if (provider === 'anthropic') {
      const p = new AnthropicProvider(apiKey);
      return await p.validateKey(apiKey);
    }
    if (provider === 'openai') {
      const p = new OpenAIProvider(apiKey);
      return await p.validateKey(apiKey);
    }
    return true;
  } catch {
    return false;
  }
}

export function ApiKeyEntry({ provider, onComplete, onBack, onSkip }: ApiKeyEntryProps) {
  const [value, setValue] = useState('');
  const [validation, setValidation] = useState<ValidationState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setValidation('idle');
    setErrorMsg('');
  }, [provider]);

  const handleSubmit = async (val: string) => {
    const key = val.trim();
    if (!key) {
      onSkip();
      return;
    }
    setValidation('validating');
    setErrorMsg('');
    const ok = await validateKey(provider, key);
    if (ok) {
      setValidation('valid');
      setTimeout(() => onComplete(key), 400);
    } else {
      setValidation('invalid');
      setErrorMsg('Key validation failed. Check the key and try again.');
    }
  };

  const displayValue = value.replace(/./g, '•');

  return (
    <Box flexDirection="column" paddingX={4} paddingY={2}>
      <Text bold color="cyan">
        {PROVIDER_LABELS[provider]} API key
      </Text>
      <Box marginTop={1} marginBottom={1}>
        <Text color="gray">{PROVIDER_HINTS[provider]}</Text>
      </Box>
      <Box borderStyle="round" paddingX={1} borderColor={
        validation === 'valid' ? 'green' :
        validation === 'invalid' ? 'red' :
        'gray'
      }>
        <Text color="gray">Key: </Text>
        {validation === 'validating' ? (
          <Text color="yellow">Validating…</Text>
        ) : validation === 'valid' ? (
          <Text color="green">✓ Valid</Text>
        ) : (
          <TextInput
            value={value}
            onChange={setValue}
            onSubmit={handleSubmit}
            placeholder="Paste your API key here"
            mask="•"
          />
        )}
      </Box>
      {errorMsg && (
        <Box marginTop={1}>
          <Text color="red">{errorMsg}</Text>
        </Box>
      )}
      <Box marginTop={2} flexDirection="column" gap={0}>
        <Text color="gray" dimColor>
          Enter to validate and continue
        </Text>
        <Text color="gray" dimColor>
          Leave empty + Enter to skip  ·  b to go back
        </Text>
        <Text color="gray" dimColor>
          Stored at ~/.helm/config.toml (chmod 600)
        </Text>
      </Box>
    </Box>
  );
}
