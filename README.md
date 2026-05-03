<div align="center">

```
  ██╗  ██╗███████╗██╗     ███╗   ███╗
  ██║  ██║██╔════╝██║     ████╗ ████║
  ███████║█████╗  ██║     ██╔████╔██║
  ██╔══██║██╔══╝  ██║     ██║╚██╔╝██║
  ██║  ██║███████╗███████╗██║ ╚═╝ ██║
  ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝     ╚═╝
```

**A terminal agent for ROS2 robots**

[![npm](https://img.shields.io/npm/v/helm-robotics?color=cyan&label=npm)](https://npmjs.com/package/helm-robotics)
[![node](https://img.shields.io/badge/node-22%2B-green)](https://nodejs.org)
[![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![platform](https://img.shields.io/badge/platform-Linux%20%7C%20macOS-lightgrey)](https://github.com)

</div>

---

Helm is a Claude Code–style terminal agent built for robotics. You talk to it in plain English, and it talks to your robot — publishing ROS2 messages, reading sensor data, running SLAM, and building robot software stacks from scratch.

```
  Helm  │  Mode: Embody  │  Robot: turtle1  │  Claude

  you  ─────────────────────────────────────────────
    Move the robot 2 meters forward then stop.

  helm ─────────────────────────────────────────────
    I'll publish a velocity command on /cmd_vel at
    0.2 m/s for 10 seconds.

    publish_twist(linear_x=0.2, duration=10s)

    Done. The robot moved forward 2 meters.

  > _
```

---

## Quick Start

No install required:

```bash
npx helm-robotics
```

Or install globally:

```bash
# npm
npm install -g helm-robotics

# pnpm
pnpm add -g helm-robotics
```

Then just run:

```bash
helm
```

Helm walks you through a one-time setup wizard on first launch.

---

## Prerequisites

| Requirement | Notes |
|---|---|
| **Node.js 22+** | Required. [Download](https://nodejs.org) |
| **LLM API key** | Anthropic (recommended), OpenAI, Google Gemini, or a local Ollama/vLLM instance |
| **ROS2** (optional) | Humble, Jazzy, or Kilted — only needed for Embody mode. Must be sourced before launch |

---

## Installation

### One-time run with npx

```bash
npx helm-robotics
```

### Global install

```bash
npm install -g helm-robotics
helm
```

### From source

```bash
git clone https://github.com/your-org/helm-robotics
cd helm-robotics
pnpm install
pnpm --filter helm-robotics run dev
```

---

## First Run — Onboarding

The first time you run `helm`, it walks you through five setup screens:

```
  Helm  ○ LLM Provider  ›  ○ API Key  ›  ○ Mode  ›  ○ Ready
```

1. **Welcome** — Quick intro. Choose to set up now or skip.
2. **LLM Provider** — Pick Anthropic, OpenAI, Google Gemini, or a local model.
3. **API Key** — Paste your key. Helm validates it against the provider before saving.
4. **Mode** — Choose your default: Build (develop robot software) or Embody (control a robot).
5. **Done** — Key bindings summary. You land in the main shell.

Config is stored at `~/.helm/config.toml` with file permissions `0600`.

To redo onboarding:

```bash
helm --reset
```

---

## Two Modes

### Embody Mode — Control a connected robot

Helm acts as a co-pilot for your live robot. It understands natural language commands and translates them into ROS2 messages via `rclnodejs`.

```
helm
> /mode embody
> Move in a 1-meter square
> List all active topics
> What does the lidar scan look like right now?
```

**Before starting Embody mode**, source your ROS2 workspace:

```bash
source /opt/ros/jazzy/setup.bash
export ROS_DOMAIN_ID=0
helm
```

Available tools (Phase 2):
- **Sensing** — `get_camera_frame`, `get_lidar_scan`, `get_imu`, `get_pose`, `get_joint_states`
- **Actuation** — `publish_twist`, `send_nav_goal`, `call_service`, `send_action_goal`
- **Introspection** — `list_topics`, `list_nodes`, `list_services`, `inspect_message_type`
- **Lifecycle** — `launch`, `stop`, `list_running`
- **Skills** — `start_slam`, `start_navigation`, `start_exploration`, `follow_object`, `pick_object`

> **Safety:** `Ctrl+C` in Embody mode publishes zero velocity on all `/cmd_vel` topics and cancels running action goals before exiting.

### Build Mode — Build robot software

Helm works like Claude Code, but inside a ROS2 project. It reads your files, writes nodes, runs `colcon build`, and iterates until the software works.

```
helm
> Create a Nav2-ready package for a 4-wheeled robot
> Add a lidar odometry node to the localization package
> Generate the URDF for a 6-DOF arm
> Run colcon build and tell me what broke
```

Available tools (Phase 4):
- `view`, `create_file`, `str_replace`, `bash` — same semantics as Claude Code
- `create_ros2_package`, `add_node`, `add_launch_file`, `add_msg`
- `colcon_build`, `colcon_test`
- `create_urdf`, `launch_gazebo`, `validate_urdf`

---

## Commands

Type `/` to open the command palette (arrow keys + Enter to pick):

| Command | Description |
|---|---|
| `/help` | Show all commands |
| `/clear` | Clear conversation history |
| `/mode embody` | Switch to Embody mode |
| `/mode build` | Switch to Build mode |
| `/model` | Show current model and provider |
| `/config` | Show current configuration |
| `/quit` | Exit |

Prefix a line with `!` to run a shell command inline:

```
> !ros2 topic list
> !colcon build --packages-select my_robot_bringup
```

---

## Keybindings

| Key | Action |
|---|---|
| `Enter` | Submit message |
| `Tab` | Autocomplete slash command |
| `↑ / ↓` | Navigate command palette |
| `Esc` | Dismiss command palette |
| `Ctrl+C` | Exit (E-stop in Embody mode) |

---

## Configuration

Config file: `~/.helm/config.toml`

```toml
version = "1"
provider = "anthropic"
api_key = "sk-ant-..."
model = "claude-3-5-sonnet-20241022"
default_mode = "build"
confirm_before_act = true
ros_domain_id = 0
theme = "auto"
```

### Supported providers

| Provider | Models | Notes |
|---|---|---|
| `anthropic` | claude-3-5-sonnet, claude-3-haiku | Recommended |
| `openai` | gpt-4o, gpt-4o-mini | |
| `google` | gemini-1.5-pro, gemini-1.5-flash | Phase 5 |
| `local` | Any OpenAI-compatible | Ollama, vLLM |

### Environment variable overrides

```bash
HELM_THEME=light helm        # Force light theme
HELM_MODEL=claude-3-haiku    # Override model for session
```

---

## Architecture

```
helm-robotics/
├── packages/
│   ├── cli/         # Entry point — bin: helm
│   ├── tui/         # Ink (React-in-terminal) UI
│   │   ├── onboarding/    # 5-screen setup wizard
│   │   └── components/    # StatusBar, Conversation, InputBox,
│   │                      # CommandPalette, Markdown renderer
│   ├── agent/       # LLM agent loop + mode-aware system prompts
│   ├── llm/         # Provider abstraction (Anthropic, OpenAI, local)
│   └── config/      # ~/.helm/config.toml manager (Zod + TOML)
```

**Key design decisions:**
- **Ink over OpenTUI** — Ink (React-in-terminal, what Claude Code uses) is the default for stability. OpenTUI can be adopted when its Zig build step is reliable across all contributor machines.
- **rclnodejs** — The ROS2 Node.js binding. Ships prebuilt binaries for Ubuntu 22.04/24.04, supports RxJS observables since v1.8.0, and integrates cleanly with Node's event loop — no separate thread needed.
- **Direct function calls, no MCP** — Tools are TypeScript functions called directly. No bridge, no protocol overhead.

---

## Roadmap

| Phase | Status | Description |
|---|---|---|
| 1 — Foundation | ✅ Done | TUI shell, onboarding wizard, Anthropic provider, agent loop |
| 2 — Embody core | 🔜 Next | rclnodejs bridge, sensing/actuation tools, e-stop, telemetry panel |
| 3 — Skills registry | 📋 Planned | SLAM, Nav2, frontier exploration, object following |
| 4 — Build mode | 📋 Planned | File tools, ROS2 scaffolding, colcon, URDF, Gazebo |
| 5 — Polish | 📋 Planned | Multi-provider, community plugins, docs site, public launch |

---

## Contributing

```bash
git clone https://github.com/your-org/helm-robotics
cd helm-robotics
pnpm install
pnpm --filter helm-robotics run dev   # run in dev mode
pnpm run typecheck                    # check all packages
```

Packages are in `packages/`. Each has its own `package.json` and `tsconfig.json`. They're linked via pnpm workspace references.

---

## License

MIT — see [LICENSE](LICENSE).

---

<div align="center">
  Built for the ROS2 community.
</div>
