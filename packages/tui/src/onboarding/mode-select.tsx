import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import type { Mode } from '@helm/config';

interface ModeOption {
  value: Mode;
  label: string;
  description: string;
  detail: string;
}

const MODES: ModeOption[] = [
  {
    value: 'build',
    label: 'Build mode',
    description: 'Build robot software (recommended to start)',
    detail: 'Design packages, write nodes, run colcon builds — like Claude Code for ROS2.',
  },
  {
    value: 'embody',
    label: 'Embody mode',
    description: 'Control a connected robot',
    detail: 'Issue natural language commands; the agent publishes ROS2 messages directly.',
  },
];

interface ModeSelectProps {
  onComplete: (mode: Mode) => void;
  onBack: () => void;
}

export function ModeSelect({ onComplete, onBack }: ModeSelectProps) {
  const [selected, setSelected] = useState(0);

  useInput((input, key) => {
    if (key.upArrow) setSelected((s) => Math.max(0, s - 1));
    if (key.downArrow) setSelected((s) => Math.min(MODES.length - 1, s + 1));
    if (key.return) onComplete(MODES[selected].value);
    if (key.escape || input === 'b') onBack();
  });

  const current = MODES[selected];

  return (
    <Box flexDirection="column" paddingX={4} paddingY={2}>
      <Text bold color="cyan">
        Select your default mode
      </Text>
      <Text color="gray">You can switch anytime with /mode embody or /mode build</Text>
      <Box marginTop={1} flexDirection="column">
        {MODES.map((m, i) => {
          const isSelected = i === selected;
          return (
            <Box key={m.value} marginBottom={1} flexDirection="column">
              <Box>
                <Text color={isSelected ? 'green' : 'gray'} bold={isSelected}>
                  {isSelected ? '▶ ' : '  '}
                </Text>
                <Text color={isSelected ? 'white' : 'gray'} bold={isSelected}>
                  {m.label}
                </Text>
                <Text color="gray"> — {m.description}</Text>
              </Box>
            </Box>
          );
        })}
      </Box>
      <Box
        borderStyle="round"
        borderColor="gray"
        paddingX={2}
        paddingY={1}
        marginTop={1}
        width={60}
      >
        <Text color="gray">{current.detail}</Text>
      </Box>
      <Box marginTop={1}>
        <Text color="gray" dimColor>
          ↑↓ navigate  ·  Enter to confirm  ·  b to go back
        </Text>
      </Box>
    </Box>
  );
}
