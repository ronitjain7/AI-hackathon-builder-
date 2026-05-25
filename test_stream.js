const apiKey = process.env.GEMINI_API_KEY || "";
const fs = require('fs');

async function test() {
  if (!apiKey) {
    throw new Error("Set GEMINI_API_KEY in your environment before running test_stream.js");
  }
  const payload = JSON.parse(fs.readFileSync('payload.json', 'utf8'));
  
  // Add system instruction matching what index.html does
  payload.system_instruction = {
    parts: [{
      text: "You are an expert SRE AI. Analyze the provided logs and incident metadata to identify the root cause and recommend fixes.\nOutput MUST be valid JSON matching this exact schema:\n\n{\n  \"confidence\": <number 0-100>,\n  \"causes\": [\n    { \"rank\": 1, \"confidence\": <number>, \"title\": \"<max 6 words>\", \"description\": \"<max 20 words>\", \"evidence\": \"<specific log line>\" },\n    { \"rank\": 2, \"confidence\": <number>, \"title\": \"<max 6 words>\", \"description\": \"<max 20 words>\", \"evidence\": \"<specific log line>\" },\n    { \"rank\": 3, \"confidence\": <number>, \"title\": \"<max 6 words>\", \"description\": \"<max 20 words>\", \"evidence\": \"<specific log line>\" }\n  ],\n  \"fixes\": [\n    { \"step\": 1, \"action\": \"<imperative, max 6 words>\", \"command\": \"<exact kubectl/bash/SQL>\", \"rationale\": \"<one sentence>\" },\n    { \"step\": 2, \"action\": \"<action>\", \"command\": \"<command>\", \"rationale\": \"<rationale>\" },\n    { \"step\": 3, \"action\": \"<action>\", \"command\": \"<command>\", \"rationale\": \"<rationale>\" }\n  ],\n  \"impact\": {\n    \"affected_services\": <number>,\n    \"error_rate_peak\": \"<e.g. 94%>\",\n    \"time_to_detect\": \"<e.g. 47s>\",\n    \"estimated_mttr_reduction\": \"<e.g. -68%>\"\n  },\n  \"summary\": \"<2-3 sentence plain English explanation>\"\n}\n\nRules: Respond ONLY with the JSON object. No text before or after. Base analysis strictly on provided log data. Rank causes by likelihood. Commands must be real executable kubectl/bash/SQL. Always provide exactly 3 causes and 3 fixes."
    }]
  };
  payload.generationConfig = { temperature: 0.2, maxOutputTokens: 1024, responseMimeType: "application/json" };
  
  const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:streamGenerateContent?alt=sse&key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  const text = await resp.text();
  console.log("STATUS:", resp.status);
  console.log("RESPONSE:", text);
}
test();
