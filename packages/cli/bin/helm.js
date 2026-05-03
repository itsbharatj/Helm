#!/usr/bin/env node
/**
 * Helm CLI launcher — ESM entry point.
 * Delegates to tsx so TypeScript runs natively without a separate compile step.
 * This avoids the CJS/ESM bundling incompatibilities in Ink 5 / yoga-layout.
 */
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const tsx = path.join(__dirname, '..', 'node_modules', '.bin', 'tsx');
const tsconfig = path.join(__dirname, '..', 'tsconfig.standalone.json');
const entry = path.join(__dirname, '..', 'src', 'cli.ts');

const result = spawnSync(
  tsx,
  ['--tsconfig', tsconfig, entry, ...process.argv.slice(2)],
  { stdio: 'inherit', env: process.env },
);

process.exit(result.status ?? 0);
