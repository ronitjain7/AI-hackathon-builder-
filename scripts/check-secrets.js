const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");

const includeExtensions = new Set([
  ".js",
  ".json",
  ".html",
  ".txt",
  ".md",
  ".yml",
  ".yaml",
  ".env",
]);

const ignoreDirs = new Set([".git", "node_modules"]);

const patterns = [
  {
    name: "Google API key",
    regex: /AIza[0-9A-Za-z\-_]{35}/g,
  },
  {
    name: "Slack webhook",
    regex: /https:\/\/hooks\.slack\.com\/services\/[A-Za-z0-9]{5,}\/[A-Za-z0-9]{5,}\/[A-Za-z0-9_-]{10,}/g,
  },
];

function walk(dirPath, files) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (!ignoreDirs.has(entry.name)) {
        walk(fullPath, files);
      }
      continue;
    }

    const ext = path.extname(entry.name);
    if (includeExtensions.has(ext) || entry.name === ".env.example") {
      files.push(fullPath);
    }
  }
}

function scanFile(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const findings = [];

  for (const pattern of patterns) {
    const matches = text.match(pattern.regex);
    if (matches && matches.length > 0) {
      findings.push({ pattern: pattern.name, count: matches.length });
    }
  }

  return findings;
}

const files = [];
walk(repoRoot, files);

const issues = [];
for (const file of files) {
  const findings = scanFile(file);
  if (findings.length > 0) {
    issues.push({ file, findings });
  }
}

if (issues.length > 0) {
  console.error("Secret scan failed. Potential credentials found:\n");
  for (const issue of issues) {
    const relative = path.relative(repoRoot, issue.file);
    const summary = issue.findings
      .map((f) => `${f.pattern} x${f.count}`)
      .join(", ");
    console.error(`- ${relative}: ${summary}`);
  }
  process.exit(1);
}

console.log("Secret scan passed.");
