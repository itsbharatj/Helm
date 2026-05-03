import React from 'react';
import { Box, Text } from 'ink';

interface InlineSegment {
  text: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
}

function parseInline(raw: string): InlineSegment[] {
  const segments: InlineSegment[] = [];
  let remaining = raw;

  while (remaining.length > 0) {
    const boldIdx = remaining.indexOf('**');
    const codeIdx = remaining.indexOf('`');
    const italicIdx = remaining.indexOf('*');

    const candidates: Array<{ idx: number; type: 'bold' | 'code' | 'italic' }> = [];
    if (boldIdx >= 0) candidates.push({ idx: boldIdx, type: 'bold' });
    if (codeIdx >= 0) candidates.push({ idx: codeIdx, type: 'code' });
    if (italicIdx >= 0 && italicIdx !== boldIdx) candidates.push({ idx: italicIdx, type: 'italic' });

    if (candidates.length === 0) {
      segments.push({ text: remaining });
      break;
    }

    candidates.sort((a, b) => a.idx - b.idx);
    const first = candidates[0];

    if (first.idx > 0) {
      segments.push({ text: remaining.slice(0, first.idx) });
      remaining = remaining.slice(first.idx);
      continue;
    }

    if (first.type === 'bold') {
      const end = remaining.indexOf('**', 2);
      if (end < 0) {
        segments.push({ text: remaining });
        break;
      }
      segments.push({ text: remaining.slice(2, end), bold: true });
      remaining = remaining.slice(end + 2);
    } else if (first.type === 'code') {
      const end = remaining.indexOf('`', 1);
      if (end < 0) {
        segments.push({ text: remaining });
        break;
      }
      segments.push({ text: remaining.slice(1, end), code: true });
      remaining = remaining.slice(end + 1);
    } else if (first.type === 'italic') {
      const end = remaining.indexOf('*', 1);
      if (end < 0) {
        segments.push({ text: remaining });
        break;
      }
      segments.push({ text: remaining.slice(1, end), italic: true });
      remaining = remaining.slice(end + 1);
    }
  }

  return segments;
}

function InlineText({ segments }: { segments: InlineSegment[] }) {
  return (
    <>
      {segments.map((seg, i) => {
        if (seg.code) {
          return (
            <Text key={i} color="green" bold>
              {seg.text}
            </Text>
          );
        }
        if (seg.bold && seg.italic) {
          return (
            <Text key={i} bold italic>
              {seg.text}
            </Text>
          );
        }
        if (seg.bold) {
          return (
            <Text key={i} bold>
              {seg.text}
            </Text>
          );
        }
        if (seg.italic) {
          return (
            <Text key={i} italic>
              {seg.text}
            </Text>
          );
        }
        return <Text key={i}>{seg.text}</Text>;
      })}
    </>
  );
}

interface MarkdownProps {
  content: string;
  width?: number;
}

export function Markdown({ content, width }: MarkdownProps) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <Box
          key={`code-${i}`}
          flexDirection="column"
          borderStyle="single"
          borderColor="gray"
          paddingX={1}
          marginTop={0}
          marginBottom={1}
          width={width ? width - 2 : undefined}
        >
          {lang && (
            <Text color="gray" dimColor>
              {lang}
            </Text>
          )}
          {codeLines.map((cl, ci) => (
            <Text key={ci} color="green" wrap="wrap">
              {cl}
            </Text>
          ))}
        </Box>,
      );
      i++;
      continue;
    }

    if (/^#{1,3} /.test(line)) {
      const level = line.match(/^(#{1,3}) /)?.[1]?.length ?? 1;
      const text = line.slice(level + 1);
      const color = level === 1 ? 'cyan' : level === 2 ? 'white' : 'gray';
      elements.push(
        <Box key={`h-${i}`} marginBottom={0}>
          <Text bold color={color} wrap="wrap">
            {text}
          </Text>
        </Box>,
      );
      i++;
      continue;
    }

    if (/^(\*|-) /.test(line)) {
      const text = line.slice(2);
      elements.push(
        <Box key={`li-${i}`} flexDirection="row">
          <Text color="cyan">{'• '}</Text>
          <Box flexShrink={1}>
            <Text wrap="wrap">
              <InlineText segments={parseInline(text)} />
            </Text>
          </Box>
        </Box>,
      );
      i++;
      continue;
    }

    if (/^\d+\. /.test(line)) {
      const match = line.match(/^(\d+)\. (.*)$/);
      if (match) {
        elements.push(
          <Box key={`ol-${i}`} flexDirection="row">
            <Text color="cyan">{match[1]}. </Text>
            <Box flexShrink={1}>
              <Text wrap="wrap">
                <InlineText segments={parseInline(match[2])} />
              </Text>
            </Box>
          </Box>,
        );
        i++;
        continue;
      }
    }

    if (/^-{3,}$/.test(line.trim())) {
      elements.push(
        <Box key={`hr-${i}`} marginY={0}>
          <Text color="gray">{'─'.repeat(40)}</Text>
        </Box>,
      );
      i++;
      continue;
    }

    if (line.trim() === '') {
      elements.push(<Box key={`blank-${i}`} height={1} />);
      i++;
      continue;
    }

    elements.push(
      <Box key={`p-${i}`} flexShrink={1}>
        <Text wrap="wrap">
          <InlineText segments={parseInline(line)} />
        </Text>
      </Box>,
    );
    i++;
  }

  return <Box flexDirection="column">{elements}</Box>;
}
