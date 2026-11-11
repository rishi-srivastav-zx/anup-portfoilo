/**
 * Status Page HTML Renderer
 * Generates dark-themed status pages for browser visits to the Express backend root and error handlers.
 */

const formatUptime = (seconds) => {
    const s = Math.floor(seconds % 60);
    const m = Math.floor((seconds / 60) % 60);
    const h = Math.floor((seconds / (60 * 60)) % 24);
    const d = Math.floor(seconds / (60 * 60 * 24));
    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    parts.push(`${s}s`);
    return parts.join(" ");
};

export const renderLiveStatusPage = ({
    uptime = process.uptime(),
    timestamp = new Date().toISOString(),
    dbStatus = "Connected",
    dbLatencyMs = null,
    environment = process.env.NODE_ENV || "production",
    frontendUrl = "https://anuprawatstudio.vercel.app",
}) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Anup Rawat Studio — Backend Service Active</title>
  <link rel="icon" href="${frontendUrl}/favicon.ico" sizes="any">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #0c0a08;
      color: #f4efe6;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      position: relative;
      overflow-x: hidden;
    }
    body::before {
      content: "";
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 50% 30%, rgba(34, 197, 94, 0.08) 0%, rgba(12, 10, 8, 0) 70%);
      pointer-events: none;
    }
    .card {
      background: rgba(26, 22, 18, 0.75);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      max-width: 580px;
      width: 100%;
      padding: 36px 32px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05);
      position: relative;
      z-index: 1;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
      padding-bottom: 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .badge-live {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(34, 197, 94, 0.12);
      color: #4ade80;
      border: 1px solid rgba(34, 197, 94, 0.3);
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .pulse-dot {
      width: 8px;
      height: 8px;
      background: #22c55e;
      border-radius: 50%;
      box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(34, 197, 94, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
    }
    .title {
      font-size: 24px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: -0.02em;
      margin-bottom: 8px;
    }
    .subtitle {
      font-size: 14px;
      color: #a8a29e;
      line-height: 1.5;
      margin-bottom: 24px;
    }
    .metrics {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-bottom: 28px;
    }
    .metric-box {
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 10px;
      padding: 14px 16px;
    }
    .metric-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #78716c;
      margin-bottom: 6px;
    }
    .metric-value {
      font-size: 14px;
      font-weight: 600;
      color: #f5f5f4;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    .metric-value.status-ok {
      color: #4ade80;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 8px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 10px 18px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer;
    }
    .btn-primary {
      background: #f4efe6;
      color: #0c0a08;
      border: none;
    }
    .btn-primary:hover {
      background: #ffffff;
      transform: translateY(-1px);
    }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.06);
      color: #d6d3d1;
      border: 1px solid rgba(255, 255, 255, 0.12);
    }
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
    }
    .footer {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      font-size: 11px;
      color: #57534e;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    @media (max-width: 520px) {
      .metrics { grid-template-columns: 1fr; }
      .card { padding: 24px 20px; }
      .actions { flex-direction: column; }
      .btn { width: 100%; }
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div>
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #a8a29e; margin-bottom: 2px;">Anup Rawat Studio</div>
        <div style="font-size: 16px; font-weight: 600; color: #e7e5e4;">Express API Service</div>
      </div>
      <div class="badge-live">
        <span class="pulse-dot"></span>
        System Live
      </div>
    </div>

    <h1 class="title">Backend is Operational</h1>
    <p class="subtitle">The cinematography portfolio Express engine is running normally and actively serving frontend client requests.</p>

    <div class="metrics">
      <div class="metric-box">
        <div class="metric-label">Database Status</div>
        <div class="metric-value status-ok">● ${dbStatus}${dbLatencyMs ? ` (${dbLatencyMs}ms)` : ""}</div>
      </div>
      <div class="metric-box">
        <div class="metric-label">Service Uptime</div>
        <div class="metric-value">${formatUptime(uptime)}</div>
      </div>
      <div class="metric-box">
        <div class="metric-label">Environment</div>
        <div class="metric-value">${environment}</div>
      </div>
      <div class="metric-box">
        <div class="metric-label">Timestamp (UTC)</div>
        <div class="metric-value">${timestamp.replace("T", " ").replace(/\.\d+Z$/, "Z")}</div>
      </div>
    </div>

    <div class="actions">
      <a href="${frontendUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">Visit Portfolio Frontend ↗</a>
      <a href="/api/health" class="btn btn-secondary">JSON Health Check</a>
      <button onclick="window.location.reload()" class="btn btn-secondary">Refresh Status</button>
    </div>

    <div class="footer">
      <span>cinematographer-portfolio API</span>
      <span>Node ${process.version}</span>
    </div>
  </div>
</body>
</html>`;

export const renderErrorStatusPage = ({
    statusCode = 500,
    title = "Backend Service Alert",
    message = "An error was encountered while processing your request or connecting to the database.",
    errorDetails = null,
    timestamp = new Date().toISOString(),
    frontendUrl = "https://anuprawatstudio.vercel.app",
}) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Service Error (${statusCode}) — Anup Rawat Studio</title>
  <link rel="icon" href="${frontendUrl}/favicon.ico" sizes="any">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #0c0a08;
      color: #f4efe6;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      position: relative;
      overflow-x: hidden;
    }
    body::before {
      content: "";
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 50% 30%, rgba(239, 68, 68, 0.12) 0%, rgba(12, 10, 8, 0) 70%);
      pointer-events: none;
    }
    .card {
      background: rgba(26, 20, 20, 0.8);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 16px;
      max-width: 580px;
      width: 100%;
      padding: 36px 32px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.7), 0 0 20px rgba(239, 68, 68, 0.1);
      position: relative;
      z-index: 1;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
      padding-bottom: 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .badge-error {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(239, 68, 68, 0.15);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.4);
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .pulse-dot-error {
      width: 8px;
      height: 8px;
      background: #ef4444;
      border-radius: 50%;
      box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
      animation: pulse-red 1.8s infinite;
    }
    @keyframes pulse-red {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
    }
    .title {
      font-size: 24px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: -0.02em;
      margin-bottom: 8px;
    }
    .subtitle {
      font-size: 14px;
      color: #d6d3d1;
      line-height: 1.5;
      margin-bottom: 20px;
    }
    .error-box {
      background: rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: 10px;
      padding: 14px 16px;
      margin-bottom: 24px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 13px;
      color: #fca5a5;
      word-break: break-word;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 8px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 10px 18px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer;
    }
    .btn-retry {
      background: #ef4444;
      color: #ffffff;
      border: none;
    }
    .btn-retry:hover {
      background: #dc2626;
      transform: translateY(-1px);
    }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.06);
      color: #d6d3d1;
      border: 1px solid rgba(255, 255, 255, 0.12);
    }
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
    }
    .footer {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      font-size: 11px;
      color: #78716c;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    @media (max-width: 520px) {
      .card { padding: 24px 20px; }
      .actions { flex-direction: column; }
      .btn { width: 100%; }
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div>
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #a8a29e; margin-bottom: 2px;">Anup Rawat Studio</div>
        <div style="font-size: 16px; font-weight: 600; color: #e7e5e4;">Express API Service</div>
      </div>
      <div class="badge-error">
        <span class="pulse-dot-error"></span>
        HTTP ${statusCode}
      </div>
    </div>

    <h1 class="title">${title}</h1>
    <p class="subtitle">${message}</p>

    ${errorDetails ? `<div class="error-box"><strong>Error Detail:</strong> ${errorDetails}</div>` : ""}

    <div class="actions">
      <button onclick="window.location.reload()" class="btn btn-retry">Retry Connection ⟳</button>
      <a href="/api/health" class="btn btn-secondary">Check Health Endpoint</a>
      <a href="${frontendUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">Visit Frontend ↗</a>
    </div>

    <div class="footer">
      <span>Timestamp: ${timestamp.replace("T", " ").replace(/\.\d+Z$/, "Z")}</span>
      <span>Node ${process.version}</span>
    </div>
  </div>
</body>
</html>`;

