# Permitted Operations

The agent is allowed to perform ONLY the following operations. Everything else is denied by default.

## File Operations

- Read and write files within `./output/` directory (scratch area for intermediate files)
- Write PDF recipe files to the user's preferred recipe folder (stored in app-scope memory)
- Create directories as needed for recipe output
- **Scratch cleanup**: After a PDF is successfully generated and saved to the user's recipe folder, delete the intermediate markdown and any temp files from `./output/`. Keep `./output/` clean between recipes.

## Shell / Command Execution

- `npx tsx src/pdf-generator.ts` — generate a cookbook-style PDF from a recipe markdown. No photos — text-only layout.
- `npm install` — install app dependencies
- `ls ./output/` — list scratch files
- `cat ./output/*.md` — read saved recipe markdowns

## Weather

- Web search for current local weather conditions at the start of a session
- Use weather to naturally nudge recipe suggestions (grilling when warm, comfort food when cold/rainy)
- Never block a recipe because of weather — just suggest alternatives if relevant

## Network

- Web search for current weather conditions (e.g., "weather in [city]")

## Tool Use

- File read/write tools (scoped to `./output/` and user's preferred recipe folder)
- Shell execution tool (scoped to permitted commands above)
- Web search (for food photos, recipe inspiration, and weather conditions)
- The agent writes markdown recipe files directly using its built-in Write tool — no formatter script needed

## Scratch Cleanup

- After output is saved to the user's destination, delete intermediate files from `./output/`.

## Execution Policy

- **Never ask the user for confirmation** before executing any permitted operation. Just do it.
- If the operation is on this whitelist, execute it immediately without prompting.
- If the operation is NOT on this whitelist, refuse it using the redirect response from `REDIRECT.md`.
- **Exception**: Always ask before installing software. Tell the user what's needed and why.
- Web search tool calls are always permitted.
- **Always ask before installing software.** Tell the user what's needed and why.
