import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { auth, signIn, DRIVE_AUTH_PARAMS } from "@/auth";
import { hostedConfigured, storageMode, STORAGE_COOKIE } from "@/lib/store";
import TopBar from "../TopBar";
import BackupButton from "./BackupButton";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/");

  const mode = await storageMode();
  const hosted = hostedConfigured();

  async function setMode(formData: FormData) {
    "use server";
    const next = formData.get("mode");
    if (next !== "hosted" && next !== "drive") return;
    (await cookies()).set(STORAGE_COOKIE, next, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
    redirect("/library");
  }

  return (
    <>
      <TopBar />
      <main className="page">
        <h1>Settings</h1>

        <section className="card">
          <h2>Where your stories are kept</h2>

          {!hosted ? (
            <p className="notice">
              This deployment has no database configured, so stories can only be
              kept in your own Google Drive.
            </p>
          ) : null}

          <form action={setMode}>
            <label className="check">
              <input
                type="radio"
                name="mode"
                value="hosted"
                defaultChecked={mode === "hosted"}
                disabled={!hosted}
              />
              <span>
                <strong>In my account on this site</strong>
                <br />
                <span className="muted">
                  Nothing else to set up. Your stories are kept here, visible
                  only to you.
                </span>
              </span>
            </label>

            <label className="check">
              <input
                type="radio"
                name="mode"
                value="drive"
                defaultChecked={mode === "drive"}
                disabled={!session.driveConnected}
              />
              <span>
                <strong>In my own Google Drive</strong>
                <br />
                <span className="muted">
                  Stories are plain files in a &ldquo;Social Stories&rdquo;
                  folder in your Drive. We keep no copy.
                  {!session.driveConnected ? " Connect Drive first." : ""}
                </span>
              </span>
            </label>

            <button className="btn" type="submit" style={{ marginTop: 16 }}>
              Save
            </button>
          </form>

          <p className="muted" style={{ marginTop: 20 }}>
            Switching does not move anything. Stories stay where they were
            written; you will see the ones kept in whichever place is selected.
          </p>
        </section>

        <section className="card">
          <h2>Google Drive</h2>
          {session.driveConnected ? (
            <>
              <p>
                <span className="tag good">Connected</span>
              </p>
              <p className="muted">
                We can see only the files this app created — never the rest of
                your Drive.
              </p>
              {hosted ? <BackupButton /> : null}
            </>
          ) : (
            <>
              <p className="muted">
                Connecting Drive lets you keep stories in your own Drive instead
                of here, back up the ones kept here, and sync them to the
                Android app. We ask for the narrowest permission Google offers:
                access to files this app creates, and nothing else.
              </p>
              <form
                action={async () => {
                  "use server";
                  await signIn("google", { redirectTo: "/settings" }, DRIVE_AUTH_PARAMS);
                }}
              >
                <button className="btn" type="submit">
                  Connect Google Drive
                </button>
              </form>
            </>
          )}
        </section>

        <section className="card">
          <h2>Your account</h2>
          <p className="muted">
            Signed in as {session.user.email}. Deleting a story deletes it
            wherever it was kept; there is no separate copy held here.
          </p>
        </section>
      </main>
    </>
  );
}
