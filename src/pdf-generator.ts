/**
 * pdf-generator.ts -- Cookbook-style PDF recipe generator
 *
 * Takes a recipe markdown file and generates a beautiful PDF that looks
 * like a page from a professional cookbook, with:
 * - Two-column layout (ingredients left, instructions right)
 * - Warm, inviting color scheme (cream background, warm browns, accent red)
 * - Metadata bar (prep time, cook time, servings)
 * - Tags section
 * - Chef's Notes in italic
 * - Serif-style typography (Roboto via pdfmake defaults) with generous white space
 * - Professional footer
 *
 * Usage:
 *     npx tsx src/pdf-generator.ts <input.md> <output.pdf>
 *
 * Dependencies:
 *     pdfmake
 */

import * as fs from "fs";
import * as path from "path";
import PdfPrinter from "pdfmake";
import QRCode from "qrcode";

// ── Color Palette ──────────────────────────────────────────────────────────
const CREAM_BG = "#FAF6F1";
const TITLE_COLOR = "#2C1810";
const HEADING_COLOR = "#5C3A21";
const TEXT_COLOR = "#3D3532";
const MUTED_TEXT = "#8C7E76";
const ACCENT_COLOR = "#C0392B";
const ACCENT_LIGHT = "#E8D5C4";
const ACCENT_WARM = "#D4886B";
const BORDER_COLOR = "#E0D5CA";

const PAGE_W = 612; // LETTER width in points
const PAGE_H = 792; // LETTER height in points
const MARGIN_SIDE = 54; // 0.75 inch
const MARGIN_TB = 47; // ~0.65 inch

// ── Fonts ──────────────────────────────────────────────────────────────────
// Try to use system serif fonts (Times New Roman). Fall back to Roboto.

function findSystemFont(names: string[]): string | null {
  for (const name of names) {
    if (fs.existsSync(name)) return name;
  }
  return null;
}

const TIMES_REGULAR = findSystemFont([
  "/System/Library/Fonts/Supplemental/Times New Roman.ttf",       // macOS
  "/usr/share/fonts/truetype/msttcorefonts/Times_New_Roman.ttf",  // Linux (msttcorefonts)
  "/usr/share/fonts/TTF/times.ttf",                               // Linux (alt)
  "C:\\Windows\\Fonts\\times.ttf",                                 // Windows
]);
const TIMES_BOLD = findSystemFont([
  "/System/Library/Fonts/Supplemental/Times New Roman Bold.ttf",
  "/usr/share/fonts/truetype/msttcorefonts/Times_New_Roman_Bold.ttf",
  "/usr/share/fonts/TTF/timesbd.ttf",
  "C:\\Windows\\Fonts\\timesbd.ttf",
]);
const TIMES_ITALIC = findSystemFont([
  "/System/Library/Fonts/Supplemental/Times New Roman Italic.ttf",
  "/usr/share/fonts/truetype/msttcorefonts/Times_New_Roman_Italic.ttf",
  "/usr/share/fonts/TTF/timesi.ttf",
  "C:\\Windows\\Fonts\\timesi.ttf",
]);
const TIMES_BOLD_ITALIC = findSystemFont([
  "/System/Library/Fonts/Supplemental/Times New Roman Bold Italic.ttf",
  "/usr/share/fonts/truetype/msttcorefonts/Times_New_Roman_Bold_Italic.ttf",
  "/usr/share/fonts/TTF/timesbi.ttf",
  "C:\\Windows\\Fonts\\timesbi.ttf",
]);

const USE_SERIF = !!(TIMES_REGULAR && TIMES_BOLD && TIMES_ITALIC && TIMES_BOLD_ITALIC);

function loadVfsFonts(): Record<string, Buffer> {
  const vfsPath = require.resolve("pdfmake/build/vfs_fonts.js");
  const vfsSource = fs.readFileSync(vfsPath, "utf-8");
  const sandbox: Record<string, any> = {};
  const wrapped = vfsSource.replace("var vfs =", "sandbox.vfs =");
  new Function("sandbox", wrapped)(sandbox);
  const buffers: Record<string, Buffer> = {};
  for (const [name, data] of Object.entries(sandbox.vfs)) {
    buffers[name] = Buffer.from(data as string, "base64");
  }
  return buffers;
}

const vfsFonts = USE_SERIF ? null : loadVfsFonts();
const FONT_NAME = USE_SERIF ? "TimesNewRoman" : "Roboto";

// ── Markdown Parsing ───────────────────────────────────────────────────────

interface RecipeData {
  title: string;
  description: string;
  sections: Record<string, string>;
}

interface RecipeDetails {
  prep: string;
  cook: string;
  servings: string;
  tags: string[];
}

function parseMarkdown(filepath: string): RecipeData {
  const content = fs.readFileSync(filepath, "utf-8");
  let title = "";
  let description = "";
  const sections: Record<string, string> = {};
  let currentSection: string | null = null;
  const currentContent: string[] = [];

  for (const line of content.split("\n")) {
    if (line.startsWith("# ") && !title) {
      title = line.slice(2).trim();
    } else if (line.startsWith("## ")) {
      if (currentSection) {
        sections[currentSection] = currentContent.splice(0).join("\n");
      } else if (currentContent.length > 0) {
        description = currentContent.splice(0).join("\n").trim();
      } else {
        currentContent.splice(0);
      }
      currentSection = line.slice(3).trim();
    } else if (line.startsWith("### ")) {
      currentContent.push(`**${line.slice(4).trim()}**`);
    } else {
      if (!currentSection && title && line.trim()) {
        description = description || line.trim();
      }
      currentContent.push(line);
    }
  }

  if (currentSection) {
    sections[currentSection] = currentContent.join("\n");
  }

  return { title, description, sections };
}

function parseDetails(detailsText: string): RecipeDetails {
  const info: RecipeDetails = { prep: "", cook: "", servings: "", tags: [] };
  for (const line of detailsText.trim().split("\n")) {
    const l = line.trim();
    if (l.includes("Prep time")) {
      info.prep = stripMarkdown(l.replace(/^-\s*\*\*Prep time:\*\*\s*/, "").trim());
    } else if (l.includes("Cook time")) {
      info.cook = stripMarkdown(l.replace(/^-\s*\*\*Cook time:\*\*\s*/, "").trim());
    } else if (l.includes("Servings")) {
      info.servings = stripMarkdown(l.replace(/^-\s*\*\*Servings:\*\*\s*/, "").trim());
    } else if (l.includes("Tags")) {
      const raw = stripMarkdown(l.replace(/^-\s*\*\*Tags:\*\*\s*/, "").trim());
      info.tags = raw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }
  }
  return info;
}

function stripMarkdown(text: string): string {
  return text.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\*([^*]+)\*/g, "$1");
}

function parseIngredients(text: string): string[] {
  return text
    .trim()
    .split("\n")
    .filter((line) => line.trim().startsWith("- "))
    .map((line) => stripMarkdown(line.trim().slice(2).trim()));
}

function parseSteps(text: string): string[] {
  return text
    .trim()
    .split("\n")
    .filter((line) => /^\d+\.\s/.test(line.trim()))
    .map((line) => stripMarkdown(line.trim().replace(/^\d+\.\s*/, "")));
}

// ── PDF Construction ───────────────────────────────────────────────────────

function buildMetaBar(
  info: RecipeDetails
): import("pdfmake/interfaces").Content | null {
  const items: { label: string; value: string }[] = [];
  if (info.prep) items.push({ label: "PREP TIME", value: info.prep });
  if (info.cook) items.push({ label: "COOK TIME", value: info.cook });
  if (info.servings) items.push({ label: "SERVINGS", value: info.servings });

  if (items.length === 0) return null;

  const contentWidth = PAGE_W - 2 * MARGIN_SIDE;

  return {
    table: {
      widths: items.map(() => contentWidth / items.length),
      body: [
        items.map((item) => ({
          stack: [
            {
              text: item.value,
              bold: true,
              fontSize: 11,
              color: HEADING_COLOR,
              alignment: "center" as const,
            },
            {
              text: item.label,
              fontSize: 8,
              color: MUTED_TEXT,
              alignment: "center" as const,
              margin: [0, 2, 0, 0] as [number, number, number, number],
            },
          ],
          alignment: "center" as const,
        })),
      ],
    },
    layout: {
      hLineWidth: (i: number, node: any) =>
        i === 0 || i === node.table.body.length ? 0.5 : 0,
      vLineWidth: () => 0,
      hLineColor: () => BORDER_COLOR,
      paddingTop: () => 6,
      paddingBottom: () => 6,
      paddingLeft: () => 4,
      paddingRight: () => 4,
    },
    margin: [0, 0, 0, 10] as [number, number, number, number],
  };
}

function buildTags(tags: string[]): import("pdfmake/interfaces").Content | null {
  if (tags.length === 0) return null;

  const parts: any[] = [];
  for (let i = 0; i < tags.length; i++) {
    if (i > 0) {
      parts.push({ text: "    ", color: MUTED_TEXT });
    }
    parts.push({ text: "\u25C6 ", color: ACCENT_WARM, fontSize: 10 });
    parts.push({ text: tags[i], color: HEADING_COLOR, fontSize: 10 });
  }

  return {
    text: parts,
    alignment: "center" as const,
    margin: [0, 4, 0, 16] as [number, number, number, number],
  };
}

function buildDecorativeDivider(): import("pdfmake/interfaces").Content {
  return {
    canvas: [
      {
        type: "line",
        x1: (PAGE_W - 2 * MARGIN_SIDE) * 0.3,
        y1: 0,
        x2: (PAGE_W - 2 * MARGIN_SIDE) * 0.7,
        y2: 0,
        lineWidth: 1.5,
        lineColor: ACCENT_COLOR,
      },
    ],
    alignment: "center" as const,
    margin: [0, 0, 0, 10] as [number, number, number, number],
  };
}

function buildTwoColumn(
  ingredients: string[],
  steps: string[]
): import("pdfmake/interfaces").Content {
  const contentWidth = PAGE_W - 2 * MARGIN_SIDE;
  const leftWidth = contentWidth * 0.35;
  const rightWidth = contentWidth * 0.65;

  // Build left column (ingredients)
  const leftContent: any[] = [
    {
      text: "Ingredients",
      bold: true,
      fontSize: 14,
      color: HEADING_COLOR,
      margin: [0, 4, 0, 10] as [number, number, number, number],
    },
  ];
  for (const item of ingredients) {
    leftContent.push({
      text: [
        { text: "\u2022 ", color: ACCENT_WARM, bold: true },
        { text: item, color: TEXT_COLOR },
      ],
      fontSize: 10,
      lineHeight: 1.5,
      margin: [10, 0, 0, 4] as [number, number, number, number],
    });
  }

  // Build right column (instructions)
  const rightContent: any[] = [
    {
      text: "Instructions",
      bold: true,
      fontSize: 14,
      color: HEADING_COLOR,
      margin: [0, 4, 0, 10] as [number, number, number, number],
    },
  ];
  for (let i = 0; i < steps.length; i++) {
    rightContent.push({
      text: [
        {
          text: `${i + 1}. `,
          color: ACCENT_COLOR,
          bold: true,
          fontSize: 13,
        },
        { text: steps[i], color: TEXT_COLOR },
      ],
      fontSize: 10.5,
      lineHeight: 1.5,
      margin: [10, 0, 0, 10] as [number, number, number, number],
    });
  }

  return {
    columns: [
      {
        width: leftWidth,
        stack: leftContent,
      },
      {
        canvas: [
          {
            type: "line",
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 500,
            lineWidth: 0.75,
            lineColor: BORDER_COLOR,
          },
        ],
        width: 1,
      },
      {
        width: rightWidth - 15,
        stack: rightContent,
        margin: [14, 0, 0, 0] as [number, number, number, number],
      },
    ],
  };
}

function buildNotes(
  notesText: string
): import("pdfmake/interfaces").Content[] {
  const elements: any[] = [];

  // Divider
  elements.push({
    canvas: [
      {
        type: "line",
        x1: 0,
        y1: 0,
        x2: PAGE_W - 2 * MARGIN_SIDE,
        y2: 0,
        lineWidth: 0.5,
        lineColor: BORDER_COLOR,
      },
    ],
    margin: [0, 16, 0, 6] as [number, number, number, number],
  });

  elements.push({
    text: "Chef's Notes",
    bold: true,
    fontSize: 14,
    color: HEADING_COLOR,
    margin: [0, 0, 0, 6] as [number, number, number, number],
  });

  for (let sentence of notesText.split(". ")) {
    sentence = sentence.trim();
    if (sentence && !sentence.endsWith(".")) {
      sentence += ".";
    }
    if (sentence) {
      elements.push({
        text: `\u2014 ${stripMarkdown(sentence)}`,
        italics: true,
        fontSize: 10,
        color: MUTED_TEXT,
        lineHeight: 1.3,
        margin: [10, 0, 10, 2] as [number, number, number, number],
      });
    }
  }

  return elements;
}

function buildFooterDivider(): import("pdfmake/interfaces").Content {
  return {
    canvas: [
      {
        type: "line",
        x1: (PAGE_W - 2 * MARGIN_SIDE) * 0.2,
        y1: 0,
        x2: (PAGE_W - 2 * MARGIN_SIDE) * 0.8,
        y2: 0,
        lineWidth: 0.5,
        lineColor: ACCENT_LIGHT,
      },
    ],
    margin: [0, 24, 0, 6] as [number, number, number, number],
  };
}

async function buildPdf(
  title: string,
  description: string,
  sections: Record<string, string>,
  outputPath: string
): Promise<void> {
  const info = parseDetails(sections["Details"] || "");
  // Try common section names for ingredients
  const ingredientSection = sections["Ingredients"]
    || Object.entries(sections).find(([k]) => k.toLowerCase().includes("ingredient"))?.[1]
    || Object.entries(sections).find(([k]) => k.toLowerCase().includes("marinade"))?.[1]
    || Object.entries(sections).find(([k]) => k.toLowerCase().includes("what you need"))?.[1]
    || "";
  const ingredients = parseIngredients(ingredientSection);
  // Try known section names, then fall back to any section containing numbered steps
  let stepsText = sections["Instructions"] || sections["Method"] || sections["Steps"] || sections["Directions"] || "";
  if (!stepsText.trim()) {
    for (const [, content] of Object.entries(sections)) {
      if (/^\d+\.\s/m.test(content)) {
        stepsText = content;
        break;
      }
    }
  }
  const steps = parseSteps(stepsText);
  const notes = (sections["Notes"] || "").trim();

  const content: any[] = [];

  // Title
  content.push({
    text: stripMarkdown(title),
    bold: true,
    fontSize: 28,
    color: TITLE_COLOR,
    alignment: "center" as const,
    margin: [0, 6, 0, 10] as [number, number, number, number],
  });

  // Description — strip markdown bold markers
  if (description) {
    content.push({
      text: stripMarkdown(description),
      italics: true,
      fontSize: 11,
      color: MUTED_TEXT,
      alignment: "center" as const,
      margin: [0, 0, 0, 14] as [number, number, number, number],
    });
  }

  // Decorative divider
  content.push(buildDecorativeDivider());

  // Metadata bar
  const metaBar = buildMetaBar(info);
  if (metaBar) content.push(metaBar);

  // Tags
  const tagsContent = buildTags(info.tags);
  if (tagsContent) content.push(tagsContent);

  // Two-column layout
  content.push(buildTwoColumn(ingredients, steps));

  // Chef's Notes
  if (notes) {
    content.push(...buildNotes(notes));
  }

  // Footer divider
  content.push(buildFooterDivider());

  // Footer text
  content.push({
    text: [
      { text: "Generated by " },
      { text: "Chef Remy", bold: true },
      { text: " \u2022 Powered by IronBound" },
    ],
    fontSize: 7,
    color: MUTED_TEXT,
    alignment: "center" as const,
    margin: [0, 0, 0, 0] as [number, number, number, number],
  });

  // ── Last page: About + QR code ──
  const qrRemyUrl = await QRCode.toDataURL(
    "https://github.com/cordfuse/ironbound-chefremy",
    { width: 200, margin: 1, color: { dark: TITLE_COLOR, light: CREAM_BG } }
  );
  const qrIronboundUrl = await QRCode.toDataURL(
    "https://github.com/cordfuse/ironbound",
    { width: 200, margin: 1, color: { dark: HEADING_COLOR, light: CREAM_BG } }
  );

  content.push({ text: "", pageBreak: "after" as const });

  content.push({ text: "", margin: [0, 60, 0, 0] as [number, number, number, number] });

  content.push({
    text: "Chef Remy",
    bold: true,
    fontSize: 24,
    color: TITLE_COLOR,
    alignment: "center" as const,
    margin: [0, 0, 0, 6] as [number, number, number, number],
  });

  content.push({
    text: "AI recipe assistant",
    italics: true,
    fontSize: 12,
    color: MUTED_TEXT,
    alignment: "center" as const,
    margin: [0, 0, 0, 4] as [number, number, number, number],
  });

  content.push({
    text: "github.com/cordfuse/ironbound-chefremy",
    fontSize: 10,
    color: ACCENT_COLOR,
    alignment: "center" as const,
    margin: [0, 0, 0, 30] as [number, number, number, number],
  });

  content.push({
    image: qrRemyUrl,
    width: 100,
    alignment: "center" as const,
    margin: [0, 0, 0, 24] as [number, number, number, number],
  });

  content.push({
    canvas: [
      {
        type: "line",
        x1: (PAGE_W - 2 * MARGIN_SIDE) * 0.3,
        y1: 0,
        x2: (PAGE_W - 2 * MARGIN_SIDE) * 0.7,
        y2: 0,
        lineWidth: 0.5,
        lineColor: BORDER_COLOR,
      },
    ],
    margin: [0, 0, 0, 20] as [number, number, number, number],
  });

  content.push({
    text: "Built on IronBound",
    bold: true,
    fontSize: 14,
    color: HEADING_COLOR,
    alignment: "center" as const,
    margin: [0, 0, 0, 8] as [number, number, number, number],
  });

  content.push({
    text: "The open-source framework for building AI apps that run on your existing Claude, Gemini, or OpenAI account. No API keys. No extra costs.",
    fontSize: 10,
    color: TEXT_COLOR,
    alignment: "center" as const,
    margin: [40, 0, 40, 6] as [number, number, number, number],
    lineHeight: 1.4,
  });

  content.push({
    text: "github.com/cordfuse/ironbound",
    fontSize: 10,
    color: ACCENT_COLOR,
    alignment: "center" as const,
    margin: [0, 0, 0, 10] as [number, number, number, number],
  });

  content.push({
    image: qrIronboundUrl,
    width: 80,
    alignment: "center" as const,
    margin: [0, 0, 0, 0] as [number, number, number, number],
  });

  // Build the document definition
  const docDefinition: import("pdfmake/interfaces").TDocumentDefinitions = {
    pageSize: "LETTER",
    pageMargins: [MARGIN_SIDE, MARGIN_TB, MARGIN_SIDE, MARGIN_TB],
    background: [
      // Cream background
      {
        canvas: [
          {
            type: "rect",
            x: 0,
            y: 0,
            w: PAGE_W,
            h: PAGE_H,
            color: CREAM_BG,
          },
        ],
      },
      // Top accent bar
      {
        canvas: [
          {
            type: "rect",
            x: 0,
            y: 0,
            w: PAGE_W,
            h: 4,
            color: ACCENT_COLOR,
          },
        ],
      },
      // Bottom accent line
      {
        canvas: [
          {
            type: "line",
            x1: MARGIN_SIDE,
            y1: PAGE_H - MARGIN_TB,
            x2: PAGE_W - MARGIN_SIDE,
            y2: PAGE_H - MARGIN_TB,
            lineWidth: 0.5,
            lineColor: ACCENT_LIGHT,
          },
        ],
      },
    ],
    content,
    defaultStyle: {
      font: FONT_NAME,
    },
  };

  const fonts: Record<string, any> = USE_SERIF
    ? {
        TimesNewRoman: {
          normal: TIMES_REGULAR!,
          bold: TIMES_BOLD!,
          italics: TIMES_ITALIC!,
          bolditalics: TIMES_BOLD_ITALIC!,
        },
      }
    : {
        Roboto: {
          normal: vfsFonts!["Roboto-Regular.ttf"],
          bold: vfsFonts!["Roboto-Medium.ttf"],
          italics: vfsFonts!["Roboto-Italic.ttf"],
          bolditalics: vfsFonts!["Roboto-MediumItalic.ttf"],
        },
      };

  const printer = new PdfPrinter(fonts);

  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  const outDir = path.dirname(path.resolve(outputPath));
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const writeStream = fs.createWriteStream(outputPath);
  pdfDoc.pipe(writeStream);
  pdfDoc.end();

  writeStream.on("finish", () => {
    console.log(`PDF saved to: ${outputPath}`);
  });

  writeStream.on("error", (err) => {
    console.error(`Error writing PDF: ${err.message}`);
    process.exit(1);
  });
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  if (process.argv.length < 4) {
    console.log("Usage: npx tsx src/pdf-generator.ts <input.md> <output.pdf>");
    process.exit(1);
  }

  const inputPath = process.argv[2];
  const outputPath = process.argv[3];

  if (!fs.existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    process.exit(1);
  }

  const { title, description, sections } = parseMarkdown(inputPath);
  await buildPdf(title, description, sections, outputPath);
}

main();
