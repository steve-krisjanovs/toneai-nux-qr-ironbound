# ToneAI

Tell ToneAI what song you want to sound like. It searches the web for the original recording gear, builds a NUX MightyAmp preset, and saves a QR code you scan straight into the NUX app.

It runs inside your existing AI account — Claude, Gemini, or OpenAI. No API keys. No extra subscription. Download, open, and play.

---

## Getting started

**Claude Code, Gemini CLI, Codex, or OpenCode:**

1. Download the latest ZIP from [Releases](../../releases)
2. Extract it and open a terminal in that folder
3. Run your agent CLI: `claude`, `gemini`, `codex`, or `opencode`
4. Say hello — ToneAI handles the rest

**Claude.ai or ChatGPT web (upload method):**

1. Download the ZIP on your phone or computer
2. Upload it to [claude.ai](https://claude.ai) or [ChatGPT](https://chat.openai.com)
3. Prompt: *"Extract this ZIP. Read CLAUDE.md and follow its instructions. Say hello."* (use AGENTS.md for ChatGPT)

On first launch ToneAI asks which NUX device you have, where to save QR images, and whether you play guitar or bass. After that it goes straight to work each session.

> Gemini web is not supported — Gemini CLI only.

---

## How it works

You give ToneAI a song, an album, or just an artist name. It searches for the original recording gear — which amp, which guitar, which effects — then maps that to the closest available models on your device. The preset comes out as a decorated PNG QR code saved to your output folder.

Scan it in the NUX app and you're playing.

```
ToneAI: What song or artist are we dialling in?

You: Comfortably Numb

ToneAI: Gilmour used a Hiwatt DR103 into a Hi Watt 4x12 for the solos,
        with a Colorsound Power Boost and CE-2 chorus. On the Plug Pro
        I'm mapping that to the Brit 100 amp, a touch of chorus in the
        efx slot, and a long plate reverb. Generating...

        Saved to ~/Documents/ToneAI/PinkFloyd-ComfortablyNumb.png
        Scan it in the NUX app. How does it sound?
```

For albums, one request generates a full set — one preset per track, researched individually.

---

## Supported devices

**Pro format** (full effect chain, preset name embedded in QR):
`Plug Pro` · `Space` · `Lite MK2` · `8BT MK2`

**Standard format** (device-specific effect IDs):
`Plug Air V1/V2` · `Mighty Air V1/V2` · `Lite` · `8BT` · `2040BT`

Bass players: BassMate amp, TR212Pro cab, compressor always on.

---

## Requirements

- An AI agent CLI with an active account ([Claude Code](https://claude.ai/download), [Gemini CLI](https://github.com/google-gemini/gemini-cli), [Codex](https://platform.openai.com/codex), or [OpenCode](https://opencode.ai))
- Node.js — or let ToneAI install a portable copy if you don't have it
- A NUX MightyAmp device and the NUX app to scan QR codes

---

<sub>Built on [IronBound](https://github.com/cordfuse/ironbound)</sub>
