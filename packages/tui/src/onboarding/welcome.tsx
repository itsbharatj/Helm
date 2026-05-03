import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';

interface WelcomeProps {
  onComplete: (setup: boolean) => void;
}

const LOGO = `
  ██╗  ██╗███████╗██╗     ███╗   ███╗
  ██║  ██║██╔════╝██║     ████╗ ████║
  ███████║█████╗  ██║     ██╔████╔██║
  ██╔══██║██╔══╝  ██║     ██║╚██╔╝██║
  ██║  ██║███████╗███████╗██║ ╚═╝ ██║
  ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝     ╚═╝
`;

const OPTIONS = ['Set up now', 'Skip for now'];

export function Welcome({ onComplete }: WelcomeProps) {
  const [selected, setSelected] = useState(0);

  useInput((_, key) => {
    if (key.upArrow) setSelected((s) => Math.max(0, s - 1));
    if (key.downArrow) setSelected((s) => Math.min(OPTIONS.length - 1, s + 1));
    if (key.return) onComplete(selected === 0);
    if (key.escape) onComplete(false);
  });

  return (
    <Box flexDirection="column" alignItems="center" paddingY={1}>
      <Text color="cyan" bold>
        {LOGO}
      </Text>
      <Text color="gray" italic>
        A terminal agent for ROS2 robots
      </Text>
      <Box marginTop={2} marginBottom={1}>
        <Text color="gray">
          Helm gives you a natural language interface to your robot.
        </Text>
      </Box>
      <Text color="gray">
        Control hardware in Embody mode, or build robot software in Build mode.
      </Text>
      <Box marginTop={2} flexDirection="column">
        {OPTIONS.map((opt, i) => (
          <Box key={opt}>
            <Text color={selected === i ? 'cyan' : 'gray'} bold={selected === i}>
              {selected === i ? '▶ ' : '  '}
            </Text>
            <Text color={selected === i ? 'white' : 'gray'}>{opt}</Text>
          </Box>
        ))}
      </Box>
      <Box marginTop={2}>
        <Text color="gray" dimColor>
          ↑↓ navigate  ·  Enter to select
        </Text>
      </Box>
    </Box>
  );
}
