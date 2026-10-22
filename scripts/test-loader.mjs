import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = fileURLToPath(new URL("../", import.meta.url));
const modules = new Map();
export function load(relative) {
  const filename = path.join(root, relative);
  if (filename.endsWith(".json")) return JSON.parse(readFileSync(filename, "utf8"));
  if (modules.has(filename)) return modules.get(filename).exports;
  const compiledModule = { exports: {} };
  modules.set(filename, compiledModule);
  const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  });
  new Function("require", "module", "exports", outputText)((specifier) => {
    assert.ok(specifier.startsWith("@/"));
    const file = specifier.slice(2);
    return load(path.extname(file) ? file : file + ".ts");
  }, compiledModule, compiledModule.exports);
  return compiledModule.exports;
}
