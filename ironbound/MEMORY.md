# Memory Scopes

```yaml
enabled:
  - user    # Device preference, instrument type (guitar/bass), skill level
  - app     # Output folder path, saved preset index, device history
  - session # Current album/song in progress, current device
```

## CRITICAL: Use IronBound Memory, NOT Agent Native Memory

**NEVER use the agent's built-in memory system.** Do not write to Claude's `~/.claude/` memory, Gemini's memory, or any other agent-native storage. All persistent memory MUST be written to and read from the IronBound memory files listed below.

### File Paths

```
~/.ironbound/memory.md                              # User scope (all IronBound apps)
~/.ironbound/toneai-nux-qr/memory.md               # App scope (this app only)
~/.ironbound/toneai-nux-qr/{session-id}/memory.md  # Session scope (this session)
```

On Windows:
```
%USERPROFILE%\.ironbound\memory.md
%USERPROFILE%\.ironbound\toneai-nux-qr\memory.md
%USERPROFILE%\.ironbound\toneai-nux-qr\{session-id}\memory.md
```

### How to Write Memory

- Create directories if they don't exist (`mkdir -p ~/.ironbound/toneai-nux-qr/`)
- Append entries to the appropriate memory file
- Use YAML-like format: `key: value` or `- list item`
- Read the file first to avoid duplicates — update existing entries instead of adding new ones

### How to Read Memory

At session start, read all enabled scope files (in order: user → app → session). Later scopes override earlier ones.

```bash
cat ~/.ironbound/memory.md 2>/dev/null
cat ~/.ironbound/toneai-nux-qr/memory.md 2>/dev/null
```

## User-Scope Memory — Key Fields

Stored in `~/.ironbound/memory.md`:

- `instruments` — List of instrument profiles. Each profile has:
  - `name` — user-given name or description (e.g., "Strat", "Jazz Bass", "Les Paul")
  - `type` — `guitar` or `bass`
  - `pickups` — pickup configuration: `sss`, `ss`, `hh`, `hs`, `hss`, `p90`, `jazz`, `precision`, `active`
- `active_instrument` — name of the currently active instrument. Defaults to first in the list if unset.
- `skill_level` — `beginner`, `intermediate`, `advanced`. Inferred over time. Never announced — just adapted to.
- `nux_device` — The user's NUX MightyAmp device (e.g., `plugpro`, `plugair_v2`). Ask on first session, remember permanently.

## App-Scope Memory — Key Fields

Stored in `~/.ironbound/toneai-nux-qr/memory.md`:

- `output_folder` — Absolute path where QR images are saved. Asked on first session.
- `preset_index` — List of generated presets with song/artist, device, date, and file path.
- `favorite_artists` — Artists the user has generated tones for most, used to weight suggestions.

## Session Behavior

- **First session (no `nux_device` set)**: After greeting, ask which NUX device they have. Save to user-scope memory.
- **Subsequent sessions**: Confirm device. "Still using the Plug Pro?" Accept confirmation and move on.
- **First session (no `instruments` set)**: Ask for instrument name and pickup type during onboarding. Save first profile and set as `active_instrument`.
- **Subsequent sessions**: Read `active_instrument` from memory. Confirm at session start: "Still on the [name]?" Accept confirmation and move on. If they've switched, update `active_instrument` — do not remove other profiles.
- **Mid-session switch**: When the user mentions switching instruments, update `active_instrument` in session memory immediately. If the instrument is new, add it to the `instruments` list in user-scope memory.
