import { copyFile, writeFile } from "node:fs/promises";

const entry = new URL("../dist/server/index.js", import.meta.url);
const implementation = new URL("../dist/server/app.js", import.meta.url);

await copyFile(entry, implementation);
await writeFile(
  entry,
  `import handleRequest from "./app.js";\n\nexport default {\n  fetch(request, env, context) {\n    return handleRequest(request, env, context);\n  },\n};\n`,
);
