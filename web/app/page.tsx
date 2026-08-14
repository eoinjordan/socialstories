import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import { BUNDLED_COUNT } from "@/lib/symbols";

export default async function Home() {
  const session = await auth();
  if (session?.user && !session.error) redirect("/library");

  return (
    <main className="page">
      <h1>Social Stories &amp; Care Pathways</h1>
      <p style={{ fontSize: "1.15rem", maxWidth: "60ch" }}>
        Build picture-led stories and step-by-step care pathways for people with
        literacy or communication differences. Sign in and start writing —
        stories are kept in your account, and you can keep them in your own
        Google Drive instead, or back them up there, whenever you want.
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
          <h2>Your data, your choice</h2>
          <p className="muted">
            Keep stories in your account here, or in a plain folder in your own
            Google Drive — or keep them here and back them up to Drive. Signing
            in asks for no access to your Drive at all until you choose to
            connect it.
          </p>
        </div>
      </div>

      <p className="muted" style={{ marginTop: 40 }}>
        {BUNDLED_COUNT} symbols ship with the app and work offline; the rest of
        the library is searched live. Symbols come from{" "}
        <a href="https://arasaac.org" rel="noreferrer noopener" target="_blank">
          ARASAAC
        </a>
        , used under CC BY-NC-SA. Author: Sergio Palao. Origin: ARASAAC
        (http://www.arasaac.org). Owner: Government of Aragón (Spain).
      </p>
    </main>
  );
}
