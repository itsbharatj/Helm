import { z } from 'zod';

export const ProviderSchema = z.enum(['anthropic', 'openai', 'google', 'local']);
export type Provider = z.infer<typeof ProviderSchema>;

export const ModeSchema = z.enum(['embody', 'build']);
export type Mode = z.infer<typeof ModeSchema>;

export const HelmConfigSchema = z.object({
  version: z.string().default('1'),
  provider: ProviderSchema.default('anthropic'),
  api_key: z.string().optional(),
  model: z.string().optional(),
  default_mode: ModeSchema.default('build'),
  local_base_url: z.string().optional(),
  confirm_before_act: z.boolean().default(true),
  ros_domain_id: z.number().default(0),
  theme: z.enum(['dark', 'light', 'auto']).default('auto'),
});

export type HelmConfig = z.infer<typeof HelmConfigSchema>;
