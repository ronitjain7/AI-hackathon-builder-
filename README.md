# IncidentIQ - AI Incident Root Cause Analyzer

IncidentIQ is an advanced AI-powered dashboard designed to help Site Reliability Engineers (SREs) and DevOps teams rapidly identify and resolve production incidents. Leveraging the power of Google's Gemini 3.5 Flash model, IncidentIQ automatically analyzes server logs, visualizes service dependencies, and provides actionable root cause analyses (RCA) and mitigation steps.

## Features

- **AI Log Analysis**: Streams server logs securely to the Gemini API and generates structured RCA data (causes, fixes, confidence metrics) in real-time.
- **Dependency Graph**: Interactive visualization of microservice architectures to pinpoint cascading failures.
- **Comprehensive Dashboard**: View active incidents, historical incident trends, error rates, and system stability metrics at a glance.
- **Export & Reporting**: Generate detailed PDF reports and JSON exports of the RCA data for post-mortem documentation.
- **Secure by Default**: Stores API keys and webhooks locally using `sessionStorage`. Features a robust `check-secrets` scanner to prevent hardcoded credentials from being committed.
- **In-flight Cancellation**: Easily cancel long-running analysis streams without breaking the UI.
- **Robust Data Parsing**: Safely handles model hallucinations, unescaped HTML, and malformed JSON payloads seamlessly.
- **Slack Integration**: Webhook support to broadcast incident summaries directly to your team's Slack channels.

## Project Structure

- `index.html` — The main frontend application dashboard (HTML/CSS/React).
- `server.js` — Minimal, zero-dependency Node.js web server.
- `app-utils.js` — Shared utilities for log parsing, JSON validation, and HTML escaping.
- `test_stream.js` — Utility script for testing the Gemini streaming API directly.
- `scripts/` — Development utilities (`check-secrets.js`, `lint.js`, etc.).
- `test/` — Contains unit tests ensuring the reliability of parser components.
- `.github/workflows/` — Continuous Integration (CI) configuration.

## Getting Started

### Prerequisites
- Node.js (v22 or later recommended)
- A [Google AI Studio Gemini API Key](https://aistudio.google.com/)

### Installation

1. Clone the repository and navigate into it:
   ```bash
   git clone <repo-url>
   cd Ai_Hackathon_Builder_Clone
   ```

2. Copy the example environment file and add your credentials (optional, mainly for CLI tools):
   ```bash
   cp .env.example .env
   # Edit .env and insert your GEMINI_API_KEY
   ```

3. Start the application:
   ```bash
   npm run dev
   # or
   npm start
   ```
   The dashboard will be available at `http://127.0.0.1:3000`.

## Development & Testing

IncidentIQ uses native Node.js testing and simple scripts, avoiding heavy bundlers and dependencies.

- **Run all checks** (linting, tests, secrets scan):
  ```bash
  npm run check
  ```
- **Run tests specifically**:
  ```bash
  npm test
  ```
- **Scan for hardcoded secrets**:
  ```bash
  npm run check-secrets
  ```

## Security

Please do not commit `GEMINI_API_KEY` or `SLACK_WEBHOOK_URL` directly into the source code. Use the provided UI input fields which securely store them in `sessionStorage` during your session, or set them as environment variables when using the CLI tools.
