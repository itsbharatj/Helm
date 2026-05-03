import React from 'react';
import { Box, Text, Static } from 'ink';
import type { Message } from '@helm/llm';

interface ConversationProps {
  messages: Message[];
  streamingContent: string;
  isThinking: boolean;
  error: string | null;
  height: number;
  width: number;
}

function UserMessage({ content }: { content: string }) {
  return (
    <Box marginBottom={1} flexDirection="column">
      <Box>
        <Text bold color="cyan">
          {'> '}
        </Text>
        <Text color="white" wrap="wrap">
          {content}
        </Text>
      </Box>
    </Box>
  );
}

function AssistantMessage({ content }: { content: string }) {
  return (
    <Box marginBottom={1} flexDirection="column">
      <Box>
        <Text bold color="green">
          {'  '}
        </Text>
        <Text color="white" wrap="wrap">
          {content}
        </Text>
      </Box>
    </Box>
  );
}

function SystemMessage({ content, color = 'yellow' }: { content: string; color?: string }) {
  return (
    <Box marginBottom={1}>
      <Text color={color} wrap="wrap">
        {content}
      </Text>
    </Box>
  );
}

export function Conversation({
  messages,
  streamingContent,
  isThinking,
  error,
  height,
  width,
}: ConversationProps) {
  const isEmpty = messages.length === 0 && !streamingContent && !isThinking;

  return (
    <Box
      flexDirection="column"
      height={height}
      width={width}
      paddingX={2}
      paddingY={1}
      overflowY="hidden"
    >
      {isEmpty && (
        <Box flexDirection="column" alignItems="center" justifyContent="center" height={height - 2}>
          <Text color="gray">Type a message to start. </Text>
          <Text color="gray">Slash commands: /help /clear /mode /quit</Text>
        </Box>
      )}

      <Static items={messages}>
        {(msg, i) =>
          msg.role === 'user' ? (
            <UserMessage key={i} content={msg.content} />
          ) : (
            <AssistantMessage key={i} content={msg.content} />
          )
        }
      </Static>

      {isThinking && !streamingContent && (
        <Box>
          <Text color="green">{'  '}</Text>
          <Text color="gray">thinking…</Text>
        </Box>
      )}

      {streamingContent && (
        <Box flexDirection="column" marginBottom={1}>
          <Box>
            <Text bold color="green">
              {'  '}
            </Text>
            <Text color="white" wrap="wrap">
              {streamingContent}
            </Text>
          </Box>
        </Box>
      )}

      {error && (
        <SystemMessage
          content={`Error: ${error}`}
          color="red"
        />
      )}
    </Box>
  );
}
