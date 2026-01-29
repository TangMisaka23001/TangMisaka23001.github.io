import fs from "node:fs/promises";
import path from "node:path";

const FONTS_DIR = path.resolve("public/fonts");

async function getFontBuffer(filename: string): Promise<ArrayBuffer> {
  const fontPath = path.join(FONTS_DIR, filename);
  const buffer = await fs.readFile(fontPath);
  return buffer.buffer as ArrayBuffer;
}

export async function loadLocalFonts() {
  return [
    {
      name: "Inter",
      data: await getFontBuffer("Inter-VariableFont_opsz,wght.ttf"),
      weight: 400,
      style: "normal",
    },
    {
      name: "Inter",
      data: await getFontBuffer("Inter-VariableFont_opsz,wght.ttf"),
      weight: 700,
      style: "normal",
    },
  ];
}

export default loadLocalFonts;
