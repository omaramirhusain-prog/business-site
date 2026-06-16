/**
 * One-time OAuth setup — gets a refresh token without service account keys.
 *
 * 1. Google Cloud → enable Calendar API
 * 2. OAuth consent screen (External) → add your Gmail as a test user
 * 3. Credentials → OAuth client ID → Desktop app
 * 4. Put GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET in .env.local
 * 5. Run: npm run gcal:auth
 */

import { google } from "googleapis";
import http from "node:http";
import { exec } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");

function loadEnvFile() {
  if (!existsSync(envPath)) return;
  const text = readFileSync(envPath, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:3456/oauth2callback";
const SCOPES = ["https://www.googleapis.com/auth/calendar"];

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(
    "\nMissing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in business-site/.env.local\n"
  );
  process.exit(1);
}

const oauth2 = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const authUrl = oauth2.generateAuthUrl({
  access_type: "offline",
  scope: SCOPES,
  prompt: "consent",
});

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", `http://localhost:3456`);
    if (url.pathname !== "/oauth2callback") {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");

    if (error || !code) {
      res.writeHead(400, { "Content-Type": "text/html" });
      res.end(`<h1>Authorization failed</h1><p>${error ?? "No code"}</p>`);
      server.close();
      process.exit(1);
    }

    const { tokens } = await oauth2.getToken(code);

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(
      "<h1>Success</h1><p>Check your terminal for the refresh token. You can close this tab.</p>"
    );

    console.log("\n--- Add these to business-site/.env.local ---\n");
    if (tokens.refresh_token) {
      console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
    } else {
      console.log(
        "No refresh_token returned. Revoke app access at https://myaccount.google.com/permissions and run again with prompt=consent."
      );
    }
    console.log(`GOOGLE_CALENDAR_ID=your@gmail.com`);
    console.log("\nThen restart: npm run dev\n");

    server.close();
    process.exit(0);
  } catch (err) {
    console.error(err);
    res.writeHead(500);
    res.end("Server error");
    server.close();
    process.exit(1);
  }
});

server.listen(3456, () => {
  console.log("\nOpening browser for Google Calendar authorization...\n");
  console.log("If it does not open, visit:\n");
  console.log(authUrl);
  console.log("");
  const openCmd =
    process.platform === "darwin"
      ? "open"
      : process.platform === "win32"
        ? "start"
        : "xdg-open";
  exec(`${openCmd} "${authUrl}"`);
});
