import React, { useState } from 'react';
import { Box } from 'ink';
import { Onboarding } from './onboarding/index.js';
import { Shell } from './shell.js';
import { configExists } from '@helm/config';

type AppState = 'onboarding' | 'shell';

export function App() {
  const [appState, setAppState] = useState<AppState>(
    configExists() ? 'shell' : 'onboarding',
  );

  return (
    <Box flexDirection="column" width="100%">
      {appState === 'onboarding' && (
        <Onboarding onComplete={() => setAppState('shell')} />
      )}
      {appState === 'shell' && <Shell />}
    </Box>
  );
}
