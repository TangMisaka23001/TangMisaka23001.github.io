import { slugifyStr } from "./slugify";

function getFileName(filePath: string): string {
  const fileName = filePath.split("/").pop()?.replace(/\.[^/.]+$/, "") || "";
  return fileName;
}

export function getPath(
  id: string,
  filePath: string | undefined,
  pubDatetime: Date | undefined,
  title: string,
  includeBase = true
) {
  let datePath = "";
  
  if (pubDatetime) {
    const year = pubDatetime.getFullYear().toString();
    const month = (pubDatetime.getMonth() + 1).toString().padStart(2, "0");
    const day = pubDatetime.getDate().toString().padStart(2, "0");
    datePath = `/${year}/${month}/${day}`;
  }

  const fileNameSlug = filePath ? getFileName(filePath) : slugifyStr(title.replace(/\./g, "-"));
  const basePath = includeBase ? "" : "";

  return `${basePath}${datePath}/${fileNameSlug}`;
}
