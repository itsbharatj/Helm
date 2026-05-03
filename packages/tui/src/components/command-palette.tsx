import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';

export interface SlashCommand {
  cmd: string;
  args?: string;
  desc: string;
}

export const SLASH_COMMANDS: SlashCommand[] = [
  { cmd: '/help', desc: 'Show all commands' },
  { cmd: '/clear', desc: 'Clear conversation history' },
  { cmd: '/mode', args: 'embody', desc: 'Switch to Embody mode (robot control)' },
  { cmd: '/mode', args: 'build', desc: 'Switch to Build mode (software dev)' },
  { cmd: '/model', desc: 'Show current model and provider' },
  { cmd: '/config', desc: 'Show current configuration' },
  { cmd: '/quit', desc: 'Exit Helm' },
];

function cmdFull(c: SlashCommand) {
  return c.args ? `${c.cmd} ${c.args}` : c.cmd;
}

interface CommandPaletteProps {
  query: string;
  onSelect: (value: string) => void;
  onDismiss: () => void;
  width: number;
}

export function CommandPalette({ query, onSelect, onDismiss, width }: CommandPaletteProps) {
  const filtered = SLASH_COMMANDS.filter((c) =>
    cmdFull(c).startsWith(query),
  );

  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    setCursor(0);
  }, [query]);

  useInput((input, key) => {
    if (filtered.length === 0) return;
    if (key.upArrow) {
      setCursor((c) => Math.max(0, c - 1));
    } else if (key.downArrow) {
      setCursor((c) => Math.min(filtered.length - 1, c + 1));
    } else if (key.tab) {
      onSelect(cmdFull(filtered[cursor]) + ' ');
    } else if (key.return && filtered.length > 0) {
      onSelect(cmdFull(filtered[cursor]));
    } else if (key.escape) {
      onDismiss();
    }
  });

  if (filtered.length === 0) return null;

  return (
    <Box
      flexDirection="column"
      width={width}
      borderStyle="single"
      borderColor="gray"
      borderBottom={false}
      borderLeft={false}
      borderRight={false}
      borderTop={true}
      paddingX={2}
      paddingY={0}
    >
      {filtered.map((c, i) => {
        const full = cmdFull(c);
        const isSelected = i === cursor;
        return (
          <Box key={full}>
            <Text color={isSelected ? 'cyan' : 'gray'} bold={isSelected}>
              {isSelected ? '▶ ' : '  '}
            </Text>
            <Box width={22}>
              <Text color={isSelected ? 'white' : 'gray'} bold={isSelected}>
                {full}
              </Text>
            </Box>
            <Text color="gray" dimColor={!isSelected}>
              {c.desc}
            </Text>
          </Box>
        );
      })}
      <Box>
        <Text color="gray" dimColor>
          {'Tab to complete  ·  ↑↓ navigate  ·  Enter to run  ·  Esc to dismiss'}
        </Text>
      </Box>
    </Box>
  );
}
