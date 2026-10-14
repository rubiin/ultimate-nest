/**
 * Per-file coverage gate.
 *
 * Vitest's own `perFile` threshold also fails on files with zero coverage, which are out of
 * scope here. This enforces the actual rule: every source file that already has *some*
 * coverage must keep statements and lines at or above the threshold. Files still at 0% are
 * reported as informational so they stay visible without failing the run.
 *
 * Usage: pnpm test:cov:check
 */
import { readFileSync } from "node:fs";
import { argv, exit } from "node:process";

const thresholdIndex = argv.indexOf("--threshold");
const threshold = thresholdIndex === -1 ? 90 : Number(argv[thresholdIndex + 1]);
const summary = JSON.parse(readFileSync("coverage/coverage-summary.json", "utf8"));

const failing = [];
const untested = [];

for (const [file, metrics] of Object.entries(summary)) {
  if (file === "total") continue;

  const { statements, lines } = metrics;
  const relative = file.replace(`${process.cwd()}/`, "");

  if (statements.total === 0) continue;

  if (statements.covered === 0 && lines.covered === 0) {
    untested.push(relative);
    continue;
  }

  if (statements.pct < threshold || lines.pct < threshold)
    failing.push({ relative, statements: statements.pct, lines: lines.pct });
}

failing.sort((a, b) => a.statements - b.statements);

for (const { relative, statements, lines } of failing)
  console.error(`  ${relative}: statements ${statements}%, lines ${lines}%`);

if (untested.length)
  console.warn(
    `note: ${untested.length} file(s) still have no coverage and are excluded: ${untested.join(", ")}`,
  );

if (failing.length) {
  console.error(`\n${failing.length} file(s) below the ${threshold}% statements/lines threshold.`);
  exit(1);
}

console.log(`All covered files meet the ${threshold}% statements/lines threshold.`);
