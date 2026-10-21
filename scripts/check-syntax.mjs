#!/usr/bin/env node
/** 배포 전 JS 문법 확인 (ESM + classic) */
import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const jsDir = join(root, "public", "js");
const classic = [join(root, "public", "sw.js")];
const moduleFiles = readdirSync(jsDir)
  .filter((name) => name.endsWith(".js"))
  .map((name) => join(jsDir, name));

let failed = 0;

function checkClassic(file) {
  const r = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  if (r.status !== 0) {
    failed += 1;
    console.error("FAIL classic", file);
    console.error(r.stderr || r.stdout);
  } else {
    console.log("OK  classic", file.replace(root + "/", ""));
  }
}

function checkModule(file) {
  const code = readFileSync(file, "utf8");
  const r = spawnSync(process.execPath, ["--input-type=module", "--check"], {
    input: code,
    encoding: "utf8"
  });
  if (r.status !== 0) {
    failed += 1;
    console.error("FAIL module", file);
    console.error(r.stderr || r.stdout);
  } else {
    console.log("OK  module", file.replace(root + "/", ""));
  }
}

for (const file of classic) {
  if (statSync(file).isFile()) checkClassic(file);
}
for (const file of moduleFiles) {
  checkModule(file);
}

if (failed) {
  console.error(`\n문법 오류 ${failed}개`);
  process.exit(1);
}
console.log("\n문법 확인 통과");
