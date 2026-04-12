import { Hono } from "hono";
import crypto from "node:crypto";
import {
  createSessionCookie,
  clearSessionCookie,
} from "../middleware/auth.js";

type Env = {
  Variables: {
    isAdmin: boolean;
    userEmail: string;
  };
};

const app = new Hono<Env>();

function base64url(buffer: Buffer): string {
  return buffer.toString("base64url");
}

function sha256(input: string): Buffer {
  return crypto.createHash("sha256").update(input).digest();
}

app.get("/login", async (c) => {
  const codeVerifier = base64url(crypto.randomBytes(32));
  const codeChallenge = base64url(sha256(codeVerifier));

  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  c.header(
    "Set-Cookie",
    `pkce_verifier=${codeVerifier}; HttpOnly; SameSite=Lax; Path=/; Max-Age=600${secure}`
  );

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
    response_type: "code",
    scope: "openid email profile",
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    access_type: "online",
  });

  return c.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

app.get("/callback", async (c) => {
  const code = c.req.query("code");
  if (!code) return c.json({ error: "Missing code" }, 400);

  const cookieHeader = c.req.header("Cookie") ?? "";
  const verifierMatch = cookieHeader
    .split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith("pkce_verifier="));
  const codeVerifier = verifierMatch?.split("=")[1];
  if (!codeVerifier) return c.json({ error: "Missing PKCE verifier" }, 400);

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      grant_type: "authorization_code",
      code_verifier: codeVerifier,
    }),
  });

  if (!tokenRes.ok) {
    return c.json({ error: "Token exchange failed" }, 502);
  }

  const tokens = (await tokenRes.json()) as { access_token: string };

  const profileRes = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    { headers: { Authorization: `Bearer ${tokens.access_token}` } }
  );
  if (!profileRes.ok) {
    return c.json({ error: "Failed to fetch profile" }, 502);
  }

  const profile = (await profileRes.json()) as { email: string };
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase());
  const isAdmin = adminEmails.includes(profile.email.toLowerCase());

  const sessionCookie = createSessionCookie(profile.email, isAdmin);

  c.header("Set-Cookie", sessionCookie);
  c.header(
    "Set-Cookie",
    "pkce_verifier=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0",
    { append: true }
  );

  return c.redirect(process.env.PUBLIC_URL!);
});

app.get("/me", (c) => {
  const isAdmin = c.get("isAdmin");
  const email = c.get("userEmail");
  if (!email) {
    return c.json({ admin: false });
  }
  return c.json({ admin: isAdmin, email });
});

app.post("/logout", (c) => {
  c.header("Set-Cookie", clearSessionCookie());
  return c.json({ ok: true });
});

export default app;
