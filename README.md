# claude-session-status

Lightweight statusline for [Claude Code](https://claude.ai/code) CLI.

Shows current path, model, token usage, context percentage, and remaining capacity at a glance.

```
📁 ~/WebstormProjects  🤖 Opus 4.6  📊 ↑8.5K ↓1.2K  ██████░░░░ 62%  🔋 38%
```

## Features

| Segment | Description |
|---------|-------------|
| 📁 Path | Current working directory (home abbreviated to `~`) |
| 🤖 Model | Active Claude model name |
| 📊 Tokens | Input (↑) and output (↓) token counts with K/M units |
| Progress bar | Context window usage with color coding (green/yellow/red) |
| 🔋 Remaining | Remaining context window percentage |

## Install

```bash
npm install -g claude-session-status
```

## Setup

Add to `~/.claude/settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "claude-session-status"
  }
}
```

Or use without installing:

```json
{
  "statusLine": {
    "type": "command",
    "command": "npx -y claude-session-status@latest"
  }
}
```

## How It Works

Claude Code pipes session data as JSON to the statusline command's stdin. This tool parses the JSON and outputs a single formatted line with ANSI colors.

### Color Coding

The progress bar changes color based on context usage:

- **Green** (0-50%) — plenty of room
- **Yellow** (51-75%) — getting full
- **Red** (76-100%) — running low

## Requirements

- Node.js 18+
- Claude Code CLI

## License

MIT
