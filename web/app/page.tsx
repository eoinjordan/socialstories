import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (session?.user && !session.error) redirect("/library");

  return (
    <main className="page">
      <h1>Social Stories &amp; Care Pathways</h1>
      <p style={{ fontSize: "1.15rem", maxWidth: "60ch" }}>
        Build picture-led stories and step-by-step care pathways for people with
        literacy or communication differences. Everything you make is saved to
        your own Google Drive — we keep no copy.
      </p>

      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/library" });
        }}
      >
        <button className="btn big" type="submit">
          Sign in with Google
        </button>
      </form>

      {session?.error ? (
        <p className="notice error" style={{ marginTop: 24 }}>
          Your Google session expired. Please sign in again.
        </p>
      ) : null}

      <div className="grid" style={{ marginTop: 48 }}>
        <div className="card">
          <h2>Picture first</h2>
          <p className="muted">
            Every step pairs one short sentence with one clear symbol or photo,
            so a story can be followed without reading.
          </p>
        </div>
        <div className="card">
          <h2>Stays open</h2>
          <p className="muted">
            Play mode fills the screen, keeps the device awake and hides the exit
            behind a long press, so it can be left running as a status radiator.
          </p>
        </div>
        <div className="card">
          <h2>Your Drive, your data</h2>
          <p className="muted">
            Stories live as plain JSON files in a &ldquo;Social Stories&rdquo;
            folder in your Drive. The Android app caches the same files for
            offline use.
          </p>
        </div>
      </div>

      <p className="muted" style={{ marginTop: 40 }}>
        Symbols come from{" "}
        <a href="https://arasaac.org" rel="noreferrer noopener" target="_blank">
          ARASAAC
        </a>
        , used under CC BY-NC-SA. Author: Sergio Palao. Origin: ARASAAC
        (http://www.arasaac.org). Owner: Government of Aragón (Spain).
      </p>
    </main>
  );
}
