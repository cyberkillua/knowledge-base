import { indexFiles, indexUrl } from "./src/commands/index";
import { search } from "./src/commands/search";

async function main() {
  const command = process.argv[2];

  if (command === "index") {
    await indexFiles();
  } else if (command === "add-url") {
    const url = process.argv[3];
    if (!url) {
      console.log("Usage: bun run main.ts add-url <url>");
      return;
    }
    await indexUrl(url);
  } else if (command === "search") {
    const query = process.argv[3];
    if (!query) {
      console.log(
        "Usage: bun run main.ts search <query> [--source=markdown|pdf|url] [--tag=tagname]",
      );
      return;
    }

    // Parse filters
    const filters: { source?: string; tags?: string[] } = {};

    for (let i = 4; i < process.argv.length; i++) {
      const arg = process.argv[i];
      if (arg.startsWith("--source=")) {
        filters.source = arg.split("=")[1];
      }
      if (arg.startsWith("--tag=")) {
        const tag = arg.split("=")[1];
        filters.tags = filters.tags || [];
        filters.tags.push(tag);
      }
    }

    await search(query, Object.keys(filters).length > 0 ? filters : undefined);
  } else {
    console.log("Usage:");
    console.log("  bun run main.ts index");
    console.log("  bun run main.ts add-url <url>");
    console.log(
      "  bun run main.ts search <query> [--source=markdown|pdf|url] [--tag=tagname]",
    );
  }
}

main();
