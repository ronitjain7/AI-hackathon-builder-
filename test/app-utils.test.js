const test = require("node:test");
const assert = require("node:assert/strict");

require("../app-utils.js");

const { parseLogs, validateRcaData, escapeHtml } = globalThis.IncidentIQUtils;

test("parseLogs parses ISO log format", () => {
  const raw = [
    "2024-10-27T08:15:02.112Z INFO cart-api-v2 Processing checkout request",
    "2024-10-27T08:15:22.881Z ERROR postgres-primary Max connections reached",
  ].join("\n");

  const parsed = parseLogs(raw);
  assert.equal(parsed.logs.length, 2);
  assert.equal(parsed.logs[0].lvl, "INFO");
  assert.equal(parsed.logs[1].svc, "postgres-primary");
  assert.equal(parsed.parseErrors, 0);
});

test("parseLogs parses key-value format with escaped whitespace pattern", () => {
  const raw =
    'timestamp=2024-01-15T22:01:02.334Z level=ERROR service=notification-svc message="ENV VAR MISSING: SMTP_HOST not set"';
  const parsed = parseLogs(raw);

  assert.equal(parsed.logs.length, 1);
  assert.equal(parsed.logs[0].svc, "notification-svc");
  assert.match(parsed.logs[0].msg, /SMTP_HOST/);
});

test("validateRcaData normalizes incomplete payloads", () => {
  const input = {
    confidence: "94",
    causes: [{ title: "Cause 1", confidence: "80", evidence: "line" }],
    fixes: [{ action: "Restart", command: "kubectl rollout restart" }],
    impact: { affected_services: "3", error_rate_peak: "90%" },
    summary: "summary",
  };

  const result = validateRcaData(input);
  assert.equal(result.ok, true);
  assert.equal(result.data.causes.length, 3);
  assert.equal(result.data.fixes.length, 3);
  assert.equal(result.data.confidence, 94);
  assert.equal(result.data.impact.affected_services, 3);
});

test("escapeHtml escapes unsafe characters", () => {
  const escaped = escapeHtml('<img src=x onerror="alert(1)">');
  assert.equal(escaped, "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
});
