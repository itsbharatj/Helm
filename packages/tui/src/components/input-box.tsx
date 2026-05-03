import React from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';

interface InputBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  isDisabled: boolean;
  width: number;
}

export function InputBox({
  value,
  onChange,
  onSubmit,
  isDisabled,
  width,
}: InputBoxProps) {
  const isCommand = value.startsWith('/');
  const isShell = value.startsWith('!');

  const promptColor = isDisabled
    ? 'gray'
    : isCommand
    ? 'yellow'
    : isShell
    ? 'magenta'
    : 'cyan';

  const placeholder = isDisabled
    ? 'waiting for response…'
    : 'Message Helm  (/ for commands, ! for shell)';

  return (
    <Box
      width={width}
      borderStyle="single"
      borderBottom={false}
      borderLeft={false}
      borderRight={false}
      borderTop={true}
      borderColor={isDisabled ? 'gray' : 'gray'}
      paddingX={2}
    >
      <Text color={promptColor} bold>
        {'> '}
      </Text>
      {isDisabled ? (
        <Text color="gray" dimColor>
          {value || placeholder}
        </Text>
      ) : (
        <TextInput
          value={value}
          onChange={onChange}
          onSubmit={onSubmit}
          placeholder={placeholder}
        />
      )}
    </Box>
  );
}
