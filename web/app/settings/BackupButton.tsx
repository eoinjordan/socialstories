"use client";

import { useState } from "react";

export default function BackupButton() {
  const [state, setState] = useState<"idle" | "running" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function run() {
    setState("running");
    try {
      const res = await fetch("/api/backup", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Backup failed");
      setState("done");
      setMessage(
        `Copied ${data.copied} of ${data.total} stories to your Drive.` +
          (data.failed?.length ? ` Could not copy: ${data.failed.join(", ")}.` : ""),
      );
    } catch (e) {
      setState("error");
      setMessage(e instanceof Error ? e.message : "Backup failed");
    }
  }

  return (
    <div style={{ marginTop: 16 }}>
      <button className="btn secondary" onClick={run} disabled={state === "running"}>
        {state === "running" ? "Copying…" : "Back up my stories to Drive"}
      </button>
      {message ? (
        <p className={state === "error" ? "notice error" : "notice"} style={{ marginTop: 12 }}>
          {message}
        </p>
      ) : null}
      <p className="muted" style={{ marginTop: 8 }}>
        Each backup writes fresh copies rather than overwriting the last one, so
        an accidental change here can never destroy an earlier backup.
      </p>
    </div>
  );
}
