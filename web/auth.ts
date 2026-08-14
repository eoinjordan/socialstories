import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

/**
 * `drive.file` is the narrowest Drive scope that still lets us do the job: the
 * app can only ever see files it created itself, so signing in does not hand us
 * access to the rest of the user's Drive.
 */
export const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    error?: "RefreshFailed";
  }
}

async function refresh(token: Record<string, unknown>) {
  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.AUTH_GOOGLE_ID!,
        client_secret: process.env.AUTH_GOOGLE_SECRET!,
        grant_type: "refresh_token",
        refresh_token: String(token.refreshToken ?? ""),
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
      authorization: {
        params: {
          scope: `openid email profile ${DRIVE_SCOPE}`,
          // Needed to be issued a refresh token at all.
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          expiresAt: (account.expires_at ?? 0) * 1000,
        };
      }
      const expiresAt = Number(token.expiresAt ?? 0);
      // Refresh a minute early so an in-flight Drive call cannot straddle expiry.
      if (Date.now() < expiresAt - 60_000) return token;
      return refresh(token as Record<string, unknown>);
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
      session.error = token.error as "RefreshFailed" | undefined;
      return session;
    },
  },
  pages: { signIn: "/" },
});
