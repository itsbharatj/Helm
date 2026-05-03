import React, { useMemo } from 'react';
import { Box, Text } from 'ink';
import type { Message } from '@helm/llm';
import { Markdown } from './markdown.js';

interface ConversationProps {
  messages: Message[];
  streamingContent: string;
  isThinking: boolean;
  error: string | null;
  height: number;
  width: number;
}

function UserBubble({ content }: { content: string }) {
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box>
        <Text bold color="cyan">{'you  '}</Text>
        <Text color="gray" dimColor>─────────────────────</Text>
      </Box>
      <Box paddingLeft={2} flexShrink={1}>
        <Text color="white" wrap="wrap">{content}</Text>
      </Box>
    </Box>
  );
}

function AssistantBubble({ content, streaming = false }: { content: string; streaming?: boolean }) {
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box>
        <Text bold color="green">{'helm '}</Text>
        <Text color="gray" dimColor>─────────────────────</Text>
        {streaming && <Text color="yellow" dimColor> ◌</Text>}
      </Box>
      <Box paddingLeft={2} flexShrink={1} flexDirection="column">
        <Markdown content={content} />
      </Box>
    </Box>
  );
}

function ErrorBubble({ content }: { content: string }) {
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box>
        <Text bold color="red">{'error '}</Text>
        <Text color="gray" dimColor>────────────────────</Text>
      </Box>
      <Box paddingLeft={2}>
        <Text color="red" wrap="wrap">{content}</Text>
      </Box>
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
  const isEmpty = messages.length === 0 && !streamingContent && !isThinking && !error;

  // Estimate visible messages: each message is ~3+ lines
  // Show as many as fit, from the end
  const visibleMessages = useMemo(() => {
    if (messages.length <= 8) return messages;
    return messages.slice(-8);
  }, [messages]);

  return (
    <Box
      flexDirection="column"
      height={height}
      width={width}
      paddingX={2}
      paddingTop={1}
      overflowY="hidden"
      flexShrink={0}
    >
      {isEmpty ? (
        <Box flexDirection="column" paddingTop={2}>
          <Text color="gray">Type a message and press Enter to start.</Text>
          <Text color="gray" dimColor>Type / for commands, ! for shell.</Text>
        </Box>
      ) : (
        <>
          {visibleMessages.map((msg, i) =>
            msg.role === 'user' ? (
              <UserBubble key={i} content={msg.content} />
            ) : (
              <AssistantBubble key={i} content={msg.content} />
            ),
          )}

          {isThinking && !streamingContent && (
            <Box flexDirection="column" marginBottom={1}>
              <Box>
                <Text bold color="green">{'helm '}</Text>
                <Text color="gray" dimColor>─────────────────────</Text>
              </Box>
              <Box paddingLeft={2}>
                <Text color="gray" dimColor>thinking…</Text>
              </Box>
            </Box>
          )}

          {streamingContent && (
            <AssistantBubble content={streamingContent} streaming />
          )}

          {error && <ErrorBubble content={error} />}
        </>
      )}
    </Box>
  );
}
