import React from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';

interface InputBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  isDisabled: boolean;
  width: number;
  placeholder?: string;
}

export function InputBox({
  value,
  onChange,
  onSubmit,
  isDisabled,
  width,
  placeholder = 'Message Helm…  (/ for commands)',
}: InputBoxProps) {
  return (
    <Box
      width={width}
      borderStyle="single"
      borderBottom={false}
      borderLeft={false}
      borderRight={false}
      borderTop={true}
      paddingX={2}
      paddingY={0}
    >
      <Text color={isDisabled ? 'gray' : 'cyan'} bold>
        {'> '}
      </Text>
      {isDisabled ? (
        <Text color="gray">{placeholder}</Text>
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
