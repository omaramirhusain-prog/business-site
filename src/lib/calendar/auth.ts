import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/calendar"];

function oauthConfigured() {
  return Boolean(
    process.env.GOOGLE_CALENDAR_ID &&
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REFRESH_TOKEN
  );
}

function serviceAccountConfigured() {
  return Boolean(
    process.env.GOOGLE_CALENDAR_ID &&
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
  );
}

/** OAuth (recommended) or service account — either is enough. */
export function isGoogleCalendarConfigured() {
  return oauthConfigured() || serviceAccountConfigured();
}

export function getCalendarAuthMode(): "oauth" | "service_account" | null {
  if (oauthConfigured()) return "oauth";
  if (serviceAccountConfigured()) return "service_account";
  return null;
}

export async function getCalendarClient() {
  if (oauthConfigured()) {
    const oauth2 = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });
    return google.calendar({ version: "v3", auth: oauth2 });
  }

  if (serviceAccountConfigured()) {
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ?? "").replace(
        /\\n/g,
        "\n"
      ),
      scopes: SCOPES,
    });
    return google.calendar({ version: "v3", auth });
  }

  throw new Error("Google Calendar is not configured");
}
