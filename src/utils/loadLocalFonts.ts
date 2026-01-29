import fs from "node:fs/promises";
import path from "node:path";

const FONTS_DIR = path.resolve("node_modules/@fontsource/ibm-plex-mono/files");

async function getFontBuffer(filename: string): Promise<ArrayBuffer> {
  const fontPath = path.join(FONTS_DIR, filename);
  const buffer = await fs.readFile(fontPath);
  return buffer.buffer as ArrayBuffer;
}

export async function loadLocalFonts() {
  return [
    {
      name: "IBM Plex Mono",
      data: await getFontBuffer("ibm-plex-mono-latin-400-normal.woff"),
      weight: 400,
      style: "normal",
    },
    {
      name: "IBM Plex Mono",
      data: await getFontBuffer("ibm-plex-mono-latin-700-normal.woff"),
      weight: 700,
      style: "normal",
    },
  ];
}

export default loadLocalFonts;
