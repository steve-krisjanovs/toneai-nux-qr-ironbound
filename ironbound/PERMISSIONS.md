# Permitted Operations

The agent is allowed to perform ONLY the following operations. Everything else is denied by default.

## File Operations

- Read and write files within `./output/` directory (QR image output)
- Write QR images to the user's preferred output folder (stored in app-scope memory)
- Create directories as needed for QR output
- **Scratch cleanup**: After a QR image is saved to the user's output folder, delete any intermediate temp files from `./output/`. Keep `./output/` clean between sessions.

## Shell / Command Execution

- `npx tsx src/qr-generator.ts` — encode a NUX MightyAmp QR preset and save as a PNG image
- `npm install` — install app dependencies
- `ls ./output/` — list output files

## Web Search

- Use the **agent's built-in web search tool** to research per-recording gear details (amp, guitar, effects) before generating each preset
- No external search APIs, no API keys, no HTTP fetch calls — the agent's native search capability only
- This app runs entirely on the user's existing agent account (OAuth) — no separate API keys are needed or permitted

## Tool Use

- File read/write tools (scoped to `./output/` and user's preferred output folder)
- Shell execution tool (scoped to permitted commands above)
- Agent's built-in web search tool (gear research only)

## Scratch Cleanup

- After QR images are saved to the user's destination, delete intermediate files from `./output/`.

## Execution Policy

- **Never ask the user for confirmation** before executing any permitted operation. Just do it.
- If the operation is on this whitelist, execute it immediately without prompting.
- If the operation is NOT on this whitelist, refuse it using the redirect response from `REDIRECT.md`.
- **Exception**: Always ask before installing software. Tell the user what's needed and why.
- Web search tool calls are always permitted.
