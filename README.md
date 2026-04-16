# ToneAI

An AI guitar tone assistant that generates NUX MightyAmp QR code presets for any song, album, artist, or vibe — using web search to research the original recording gear before generating each preset.

ToneAI runs inside your existing AI account — Claude, Gemini, or OpenAI. No API keys to set up. No extra costs. Just download, open, and play.

---

## Quick Start

### CLI (any platform)

1. Download the latest ZIP from [Releases](../../releases)
2. Extract and open the folder in Claude Code, Gemini CLI, Codex, or OpenCode
3. Say hello

### Claude.ai or ChatGPT web

1. Download the ZIP from [Releases](../../releases) on your device
2. Upload it to [claude.ai](https://claude.ai) or [ChatGPT](https://chat.openai.com)
3. Prompt: *"Extract this ZIP. Read CLAUDE.md and follow its instructions. Say hello."*
   (Use AGENTS.md for ChatGPT)

> Gemini web is not supported — use Gemini CLI instead.

---

## What it does

- **Single tone generation** — give it a song or artist, get a QR preset
- **Album-scale generation** — full album in one request, one preset per track
- **Artist vibe mode** — signature tone from just a name
- **Gear research** — web searches per-recording details before generating
- **All NUX devices** — Pro (plugpro, space, litemk2, 8btmk2) and Standard formats
- **Bass tone support** — BassMate amp, correct bass signal chain
- **Tone explanation** — explains every choice so you know what to tweak
- **Desktop shortcut** — one-click launch (macOS .app, Linux .desktop, Windows .lnk)

---

## Requirements

- An AI agent CLI: [Claude Code](https://claude.ai/download), [Gemini CLI](https://github.com/google-gemini/gemini-cli), [Codex](https://developers.openai.com/codex/cli), or [OpenCode](https://opencode.ai) — uses your existing account, no API keys needed
- Node.js (ToneAI installs a portable copy if you don't have it)
- A NUX MightyAmp device and the NUX app to scan QR codes

---

## Project structure

```
IRONBOUND-USER.md      # Engine — loads ./ironbound/, stripped in release builds
IRONBOUND-DEV.md       # Dev workflow — build, test, spawn agent CLI
CLAUDE.md              # One-liner → IRONBOUND-DEV.md (dev) or IRONBOUND.md (release)
GEMINI.md              # Same
AGENTS.md              # Same
ironbound/
  IDENTITY.md          # ToneAI identity, personality, capabilities
  PERMISSIONS.md       # Scoped permissions and execution policy
  CONSTRAINTS.md       # Full blacklist
  WELCOME.md           # Welcome flow — shortcut, device check, greeting
  REDIRECT.md          # Out-of-scope redirect
  SESSION.md           # mode: multi, cwd: fixed
  MEMORY.md            # IronBound memory (~/.ironbound/toneai-nux-qr/)
  icon.svg             # App icon
  agents/              # Per-agent permission configs
src/
  build.js             # Builds dist/ for testing and release
  qr-generator.ts      # NUX MightyAmp QR payload encoder
output/                # Generated QR codes
package.json
version.txt
```

---

<sub>Built on [IronBound](https://github.com/cordfuse/ironbound)</sub>
