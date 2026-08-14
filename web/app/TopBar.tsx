import Link from "next/link";
import { auth, signOut } from "@/auth";

export default async function TopBar() {
  const session = await auth();
  return (
    <header className="topbar">
      <Link className="brand" href="/library">
        Social Stories
      </Link>
      <span className="spacer" />
      {session?.user ? (
        <>
          <Link className="btn secondary" href="/settings">
            Settings
          </Link>
          <span className="muted">{session.user.email}</span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button className="btn secondary" type="submit">
              Sign out
            </button>
          </form>
        </>
      ) : null}
    </header>
  );
}
