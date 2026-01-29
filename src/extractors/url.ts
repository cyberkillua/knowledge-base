import * as cheerio from "cheerio";

export async function extractUrl(url: string) {
  const response = await fetch(url);
  const html = await response.text();

  const $ = cheerio.load(html);

  // Remove script, style, nav, footer
  $("script, style, nav, footer, aside").remove();

  // Get text from body
  const text = $("body").text().trim().replace(/\s+/g, " ");

  return {
    text,
    metadata: {
      source: "url" as const,
      url,
      date: new Date().toISOString(),
      title: $("title").text(),
    },
  };
}
