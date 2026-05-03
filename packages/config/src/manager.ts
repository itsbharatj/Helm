import fs from 'fs';
import path from 'path';
import os from 'os';
import TOML from '@iarna/toml';
import { HelmConfigSchema, type HelmConfig } from './schema.js';

export const CONFIG_DIR = path.join(os.homedir(), '.helm');
export const CONFIG_PATH = path.join(CONFIG_DIR, 'config.toml');

export function configExists(): boolean {
  return fs.existsSync(CONFIG_PATH);
}

export function readConfig(): HelmConfig {
  if (!fs.existsSync(CONFIG_PATH)) {
    return HelmConfigSchema.parse({});
  }
  const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
  const parsed = TOML.parse(raw);
  return HelmConfigSchema.parse(parsed);
}

export function writeConfig(config: HelmConfig): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  const toml = TOML.stringify(config as TOML.JsonMap);
  fs.writeFileSync(CONFIG_PATH, toml, { mode: 0o600 });
}

export function updateConfig(updates: Partial<HelmConfig>): HelmConfig {
  const current = readConfig();
  const next = HelmConfigSchema.parse({ ...current, ...updates });
  writeConfig(next);
  return next;
}
