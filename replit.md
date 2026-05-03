# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains the shared API server, mockup sandbox, and the **Helm** CLI — a terminal agent for ROS2 robots.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter helm-robotics run dev` — run Helm CLI in the terminal

## Helm CLI (packages/)

Helm is a terminal-based agent for ROS2 robots, inspired by Claude Code and OpenClaw. It provides two operating modes:

- **Build mode** — helps design and implement robot software stacks
- **Embody mode** — natural language control of a connected ROS2 robot

### Package Structure

```
packages/
├── cli/          # Entry point (helm-robotics npm package)
├── tui/          # Ink-based React terminal UI
├── agent/        # LLM agent loop with mode-aware system prompts
├── llm/          # Provider abstraction (Anthropic, OpenAI, local)
└── config/       # TOML config at ~/.helm/config.toml (Zod-validated)
```

### Running Helm

```bash
pnpm --filter helm-robotics run dev
```

Or via the "Helm CLI" workflow in the Replit interface.

### Config

Stored at `~/.helm/config.toml` (chmod 600). Run `helm --reset` to re-trigger onboarding.

### Phase Status

- [x] Phase 1: Foundation — TUI shell, onboarding, Anthropic provider, agent loop
- [ ] Phase 2: Embody mode — rclnodejs, sensing/actuation tools, e-stop, telemetry
- [ ] Phase 3: Skills registry — slam_toolbox, Nav2, frontier exploration
- [ ] Phase 4: Build mode — file tools, ROS2 project scaffolding, colcon
- [ ] Phase 5: Polish — multi-provider, community plugins, docs

See `packages/agent/src/prompts/` for the Embody and Build mode system prompts.
See `packages/tui/src/` for the Ink TUI components.

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
