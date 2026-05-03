#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import { App } from '@helm/tui';

const VERSION = '0.1.0';

function printUsage() {
  console.log(`helm ${VERSION} — A terminal agent for ROS2 robots

Usage:
  helm                  Start Helm (onboarding if first run)
  helm --version        Print version
  helm --reset          Delete config and re-run onboarding
  helm --help           Show this help

Inside Helm:
  /help                 Show available commands
  /mode embody|build    Switch operating mode
  /clear                Clear conversation
  /quit                 Exit
`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    printUsage();
    process.exit(0);
  }

  if (args.includes('--version') || args.includes('-v')) {
    console.log(VERSION);
    process.exit(0);
  }

  if (args.includes('--reset')) {
    const { CONFIG_PATH } = await import('@helm/config');
    const fs = await import('fs');
    if (fs.existsSync(CONFIG_PATH)) {
      fs.unlinkSync(CONFIG_PATH);
      console.log('Config reset. Re-running onboarding on next launch.');
    } else {
      console.log('No config found — nothing to reset.');
    }
    process.exit(0);
  }

  if (!process.stdout.isTTY) {
    console.error(
      'Error: Helm requires an interactive terminal (TTY).\n' +
      'Run helm directly in your terminal, not piped or redirected.',
    );
    process.exit(1);
  }

  const { waitUntilExit } = render(React.createElement(App), {
    exitOnCtrlC: true,
  });

  await waitUntilExit();
}

main().catch((err) => {
  console.error('Fatal error:', err instanceof Error ? err.message : err);
  process.exit(1);
});
