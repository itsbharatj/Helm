import React from 'react';
import { Box, Text } from 'ink';

interface HelpOverlayProps {
  width: number;
}

const COMMANDS = [
  { cmd: '/help', desc: 'Show this help' },
  { cmd: '/clear', desc: 'Clear conversation history' },
  { cmd: '/mode embody', desc: 'Switch to Embody mode (robot control)' },
  { cmd: '/mode build', desc: 'Switch to Build mode (software development)' },
  { cmd: '/model', desc: 'Show current model' },
  { cmd: '/config', desc: 'Show current configuration' },
  { cmd: '/quit', desc: 'Exit Helm' },
  { cmd: '!<cmd>', desc: 'Run a shell command' },
];

const KEYBINDS = [
  { key: 'Ctrl+C', desc: 'Exit / emergency stop in Embody mode' },
  { key: 'Enter', desc: 'Submit message' },
];

export function HelpOverlay({ width }: HelpOverlayProps) {
  return (
    <Box
      flexDirection="column"
      paddingX={2}
      paddingY={1}
      width={width}
    >
      <Text bold color="cyan">
        Helm — Slash Commands
      </Text>
      <Text> </Text>
      {COMMANDS.map(({ cmd, desc }) => (
        <Box key={cmd}>
          <Box width={22}>
            <Text color="green">{cmd}</Text>
          </Box>
          <Text color="gray">{desc}</Text>
        </Box>
      ))}
      <Text> </Text>
      <Text bold color="cyan">
        Keybindings
      </Text>
      <Text> </Text>
      {KEYBINDS.map(({ key, desc }) => (
        <Box key={key}>
          <Box width={22}>
            <Text color="yellow">{key}</Text>
          </Box>
          <Text color="gray">{desc}</Text>
        </Box>
      ))}
    </Box>
  );
}
