/**
 * Helm CLI build script
 *
 * Strategy: vendor all workspace package sources into packages/cli/vendor/
 * so the CLI is self-contained for npm/npx distribution. tsx handles TypeScript
 * at runtime so we skip the esbuild CJS/ESM bundling nightmare (Ink 5 + signal-exit@3
 * don't bundle cleanly with esbuild).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.join(__dirname, '..', '..');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('Building helm-robotics for distribution...\n');

// 1. Clean and recreate vendor/
const vendorDir = path.join(__dirname, 'vendor');
if (fs.existsSync(vendorDir)) fs.rmSync(vendorDir, { recursive: true });
fs.mkdirSync(vendorDir, { recursive: true });

// 2. Copy workspace package src/ into vendor/<name>/
const PACKAGES = ['config', 'llm', 'agent', 'tui'];
for (const pkg of PACKAGES) {
  const srcDir = path.join(workspaceRoot, 'packages', pkg, 'src');
  const destDir = path.join(vendorDir, pkg);
  copyDir(srcDir, destDir);
  console.log(`  ✓ vendor/${pkg}/`);
}

// 3. Generate tsconfig.standalone.json — maps @helm/* → ./vendor/*
const standalone = {
  extends: './tsconfig.json',
  compilerOptions: {
    jsx: 'react-jsx',
    jsxImportSource: 'react',
    paths: Object.fromEntries(
      PACKAGES.flatMap((pkg) => [
        [`@helm/${pkg}`, [`./vendor/${pkg}/index.ts`]],
        [`@helm/${pkg}/*`, [`./vendor/${pkg}/*`]],
      ]),
    ),
  },
};
fs.writeFileSync(
  path.join(__dirname, 'tsconfig.standalone.json'),
  JSON.stringify(standalone, null, 2) + '\n',
);
console.log('  ✓ tsconfig.standalone.json');

// 4. Write bin/helm.js — ESM launcher (package.json has "type":"module")
const binDir = path.join(__dirname, 'bin');
fs.mkdirSync(binDir, { recursive: true });
const binContent = `#!/usr/bin/env node
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
`;
fs.writeFileSync(path.join(binDir, 'helm.js'), binContent, { mode: 0o755 });
console.log('  ✓ bin/helm.js');

console.log('\nDone. To test: node bin/helm.js --help');
console.log('To link globally: npm link (from packages/cli/)');
