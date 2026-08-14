import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

/**
 * `drive.file` is the narrowest Drive scope that does the job: the app can only
 * ever see files it created itself, so granting it does not hand us access to
 * the rest of the user's Drive.
 *
 * It is NOT requested at sign-in. Most people just want an account on the site,
 * and asking for access to someone's Drive before they have seen what the app
 * does is both a poor first impression and more permission than they need. It
 * is requested separately, when they choose to connect Drive.
 */
export const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";
const BASE_SCOPE = "openid email profile";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    /** True once the user has granted the Drive scope. */
    driveConnected?: boolean;
    error?: "RefreshFailed";
  }
}

async function refresh(token: Record<string, unknown>) {
  if (!token.refreshToken) {
    // Signed in without offline access, which is the normal case for an
    // account that has never connected Drive. Nothing to refresh, and nothing
    // is broken — hosted storage does not use the access token at all.
    return { ...token, accessToken: undefined };
  }
  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.AUTH_GOOGLE_ID!,
        client_secret: process.env.AUTH_GOOGLE_SECRET!,
        grant_type: "refresh_token",
        refresh_token: String(token.refreshToken),
      }),
    });
    const data = (await res.json()) as {
      access_token?: string;
      expires_in?: number;
      refresh_token?: string;
    };
    if (!res.ok || !data.access_token) throw new Error("refresh rejected");
    return {
      ...token,
      accessToken: data.access_token,
      expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
      // Google only re-issues a refresh token occasionally; keep the old one.
      refreshToken: data.refresh_token ?? token.refreshToken,
      error: undefined,
    };
  } catch {
    return { ...token, error: "RefreshFailed" as const };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      authorization: { params: { scope: BASE_SCOPE } },
      allowDangerousEmailAccountLinking: false,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        const scopes = (account.scope ?? "").split(" ");
        const drive = scopes.includes(DRIVE_SCOPE);
        return {
          ...token,
          accessToken: account.access_token,
          // Only a Drive connection asks for offline access, so only then is
          // there a refresh token to keep.
          refreshToken: account.refresh_token ?? token.refreshToken,
          expiresAt: (account.expires_at ?? 0) * 1000,
          // Re-signing in without the Drive scope should not silently drop a
          // connection the user already made and is still granted upstream.
          driveConnected: drive || Boolean(token.driveConnected),
        };
      }
      const expiresAt = Number(token.expiresAt ?? 0);
      // Refresh a minute early so an in-flight Drive call cannot straddle expiry.
      if (!token.accessToken || Date.now() < expiresAt - 60_000) return token;
      return refresh(token as Record<string, unknown>);
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
      session.driveConnected = Boolean(token.driveConnected);
      session.error = token.error as "RefreshFailed" | undefined;
      // `sub` is Google's stable identifier for the account and is what every
      // hosted story row is keyed on. It must never come from the client, and
      // a session without one is treated as signed out by the store.
      if (token.sub) session.user = { ...session.user, id: token.sub };
      return session;
    },
  },
  pages: { signIn: "/" },
});

/** Authorization parameters for the separate "connect Drive" sign-in. */
export const DRIVE_AUTH_PARAMS = {
  scope: `${BASE_SCOPE} ${DRIVE_SCOPE}`,
  // Needed to be issued a refresh token, so the connection survives an hour.
  access_type: "offline",
  prompt: "consent",
};
