/* global window */
(function attachIncidentIQUtils(globalObj) {
  "use strict";

  function asString(value) {
    if (value === null || value === undefined) {
      return "";
    }
    return String(value);
  }

  function clampNumber(value, min, max, fallback) {
    var num = Number(value);
    if (!Number.isFinite(num)) {
      return fallback;
    }
    return Math.max(min, Math.min(max, num));
  }

  function normalizeLevel(level) {
    var upper = asString(level).toUpperCase();
    if (upper === "WARNING") {
      return "WARN";
    }
    return upper;
  }

  function sortLogsByTimestamp(logs) {
    return logs.sort(function sortLog(a, b) {
      var aDate = Date.parse(a.ts);
      var bDate = Date.parse(b.ts);

      if (!Number.isNaN(aDate) && !Number.isNaN(bDate)) {
        return aDate - bDate;
      }

      return asString(a.ts).localeCompare(asString(b.ts));
    });
  }

  function parseLogs(rawText) {
    var lines = asString(rawText).split("\n");
    var logs = [];
    var parseErrors = 0;

    var isoRegex = /^(\d{4}-\d{2}-\d{2}T[\d:.Z+-]+)\s+(ERROR|WARN|WARNING|INFO|DEBUG|CRITICAL|FATAL)\s+(\S+)\s+(.+)$/i;
    var shortRegex = /^(\d{2}:\d{2}:\d{2}\.\d+)\s+(ERROR|WARN|WARNING|INFO|DEBUG|CRITICAL|FATAL)\s+(\S+)\s+(.+)$/i;

    lines.forEach(function parseLine(originalLine) {
      var line = asString(originalLine).trim();
      if (!line) {
        return;
      }

      var ts;
      var lvl;
      var svc;
      var msg;

      if (line.startsWith("{") && line.endsWith("}")) {
        try {
          var obj = JSON.parse(line);
          ts = obj.timestamp || obj.time || obj.ts;
          lvl = obj.level || obj.lvl || obj.severity;
          svc = obj.service || obj.svc || obj.source;
          msg = obj.message || obj.msg || obj.text;
        } catch (_error) {
          // Keep parsing against other formats.
        }
      }

      if (!ts) {
        var isoMatch = line.match(isoRegex);
        if (isoMatch) {
          ts = isoMatch[1];
          lvl = isoMatch[2];
          svc = isoMatch[3];
          msg = isoMatch[4];
        }
      }

      if (!ts) {
        var shortMatch = line.match(shortRegex);
        if (shortMatch) {
          ts = shortMatch[1];
          lvl = shortMatch[2];
          svc = shortMatch[3];
          msg = shortMatch[4];
        }
      }

      if (!ts && line.includes("=")) {
        var kvMatch = function kvMatch(key) {
          var pattern = new RegExp(
            "(?:^|\\s)" + key + "=(\"([^\"]+)\"|(\\S+))",
            "i"
          );
          var match = line.match(pattern);
          return match ? match[2] || match[3] : null;
        };

        ts = kvMatch("timestamp") || kvMatch("time") || kvMatch("ts");
        lvl = kvMatch("level") || kvMatch("lvl") || kvMatch("severity");
        svc = kvMatch("service") || kvMatch("svc") || kvMatch("source");
        msg = kvMatch("message") || kvMatch("msg") || kvMatch("text");
      }

      if (ts && lvl && svc && msg) {
        logs.push({
          ts: asString(ts),
          lvl: normalizeLevel(lvl),
          svc: asString(svc),
          msg: asString(msg),
        });
      } else {
        parseErrors += 1;
      }
    });

    sortLogsByTimestamp(logs);

    var serviceSet = new Set();
    logs.forEach(function collectServices(log) {
      serviceSet.add(log.svc);
    });

    return {
      logs: logs,
      services: Array.from(serviceSet),
      parseErrors: parseErrors,
    };
  }

  function normalizeCause(cause, index) {
    var conf = clampNumber(cause && cause.confidence, 0, 100, 0);
    return {
      rank: index + 1,
      confidence: conf,
      title: asString(cause && cause.title).slice(0, 80) || "Unknown cause",
      description:
        asString(cause && (cause.description || cause.desc)).slice(0, 220) ||
        "No description provided.",
      evidence: asString(cause && cause.evidence).slice(0, 300) || "N/A",
    };
  }

  function normalizeFix(fix, index) {
    return {
      step: index + 1,
      action: asString(fix && fix.action).slice(0, 120) || "No action provided",
      command:
        asString(fix && (fix.command || fix.cmd)).slice(0, 500) || "echo \"N/A\"",
      rationale:
        asString(fix && fix.rationale).slice(0, 280) || "No rationale provided.",
    };
  }

  function normalizeImpact(impact) {
    var affectedServices = Number(
      impact && (impact.affected_services || impact.affectedServices)
    );

    return {
      affected_services: Number.isFinite(affectedServices)
        ? Math.max(0, Math.round(affectedServices))
        : "?",
      error_rate_peak: asString(impact && impact.error_rate_peak) || "?",
      time_to_detect: asString(impact && impact.time_to_detect) || "?",
      estimated_mttr_reduction:
        asString(impact && impact.estimated_mttr_reduction) || "?",
    };
  }

  function validateRcaData(input) {
    var warnings = [];
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      return {
        ok: false,
        warnings: ["Model output is not a JSON object."],
        data: null,
      };
    }

    var causes = Array.isArray(input.causes) ? input.causes.slice(0, 3) : [];
    var fixes = Array.isArray(input.fixes) ? input.fixes.slice(0, 3) : [];

    while (causes.length < 3) {
      causes.push({});
      warnings.push("Missing cause entry filled with fallback.");
    }

    while (fixes.length < 3) {
      fixes.push({});
      warnings.push("Missing fix entry filled with fallback.");
    }

    var normalized = {
      confidence: clampNumber(input.confidence, 0, 100, 0),
      causes: causes.map(normalizeCause),
      fixes: fixes.map(normalizeFix),
      impact: normalizeImpact(input.impact || {}),
      summary: asString(input.summary).slice(0, 800) || "Analysis complete.",
    };

    return {
      ok: true,
      warnings: warnings,
      data: normalized,
    };
  }

  function escapeHtml(value) {
    return asString(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalizeMockCauses(causes) {
    if (!Array.isArray(causes)) {
      return [];
    }
    return causes.map(function mapCause(cause, index) {
      return {
        rank: cause.rank || "#" + String(index + 1),
        conf: clampNumber(
          cause.conf !== undefined ? cause.conf : cause.confidence,
          0,
          100,
          0
        ),
        title: asString(cause.title),
        desc: asString(cause.desc || cause.description),
        evidence: asString(cause.evidence),
      };
    });
  }

  globalObj.IncidentIQUtils = {
    parseLogs: parseLogs,
    validateRcaData: validateRcaData,
    escapeHtml: escapeHtml,
    normalizeMockCauses: normalizeMockCauses,
  };
})(typeof window !== "undefined" ? window : globalThis);
