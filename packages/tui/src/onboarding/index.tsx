import React, { useState, useCallback } from 'react';
import { Box, Text } from 'ink';
import { Welcome } from './welcome.js';
import { ProviderSelect } from './provider-select.js';
import { ApiKeyEntry } from './api-key-entry.js';
import { ModeSelect } from './mode-select.js';
import { Done } from './done.js';
import { writeConfig } from '@helm/config';
import type { Provider, Mode } from '@helm/config';

type OnboardingStep = 'welcome' | 'provider' | 'api-key' | 'mode' | 'done';

interface OnboardingState {
  provider: Provider;
  apiKey: string;
  mode: Mode;
}

interface OnboardingProps {
  onComplete: () => void;
}

const STEP_LABELS: Record<OnboardingStep, string> = {
  welcome: 'Welcome',
  provider: 'LLM Provider',
  'api-key': 'API Key',
  mode: 'Mode',
  done: 'Ready',
};

const STEPS: OnboardingStep[] = ['welcome', 'provider', 'api-key', 'mode', 'done'];

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [state, setState] = useState<OnboardingState>({
    provider: 'anthropic',
    apiKey: '',
    mode: 'build',
  });

  const stepIndex = STEPS.indexOf(step);

  const handleWelcome = useCallback((doSetup: boolean) => {
    if (!doSetup) {
      writeConfig({
        version: '1',
        provider: 'anthropic',
        default_mode: 'build',
        confirm_before_act: true,
        ros_domain_id: 0,
        theme: 'auto',
      });
      onComplete();
      return;
    }
    setStep('provider');
  }, [onComplete]);

  const handleProvider = useCallback((provider: Provider) => {
    setState((s) => ({ ...s, provider }));
    setStep('api-key');
  }, []);

  const handleApiKey = useCallback((apiKey: string) => {
    setState((s) => ({ ...s, apiKey }));
    setStep('mode');
  }, []);

  const handleApiKeySkip = useCallback(() => {
    setStep('mode');
  }, []);

  const handleMode = useCallback((mode: Mode) => {
    setState((s) => {
      const next = { ...s, mode };
      writeConfig({
        version: '1',
        provider: next.provider,
        api_key: next.apiKey || undefined,
        default_mode: next.mode,
        confirm_before_act: true,
        ros_domain_id: 0,
        theme: 'auto',
      });
      return next;
    });
    setStep('done');
  }, []);

  return (
    <Box flexDirection="column" width="100%">
      <Box paddingX={4} paddingY={1} borderStyle="single" borderBottom={false} borderLeft={false} borderRight={false} borderTop={false}>
        <Text bold color="cyan">Helm  </Text>
        {STEPS.filter((s) => s !== 'welcome').map((s, i) => {
          const idx = STEPS.indexOf(s);
          const current = idx === stepIndex;
          const done = idx < stepIndex;
          return (
            <React.Fragment key={s}>
              <Text color={done ? 'green' : current ? 'white' : 'gray'} bold={current}>
                {done ? '✓ ' : current ? '● ' : '○ '}
                {STEP_LABELS[s]}
              </Text>
              {i < STEPS.length - 2 && <Text color="gray">  ›  </Text>}
            </React.Fragment>
          );
        })}
      </Box>

      {step === 'welcome' && <Welcome onComplete={handleWelcome} />}
      {step === 'provider' && (
        <ProviderSelect onComplete={handleProvider} onBack={() => setStep('welcome')} />
      )}
      {step === 'api-key' && (
        <ApiKeyEntry
          provider={state.provider}
          onComplete={handleApiKey}
          onBack={() => setStep('provider')}
          onSkip={handleApiKeySkip}
        />
      )}
      {step === 'mode' && (
        <ModeSelect onComplete={handleMode} onBack={() => setStep('api-key')} />
      )}
      {step === 'done' && (
        <Done provider={state.provider} mode={state.mode} onComplete={onComplete} />
      )}
    </Box>
  );
}
