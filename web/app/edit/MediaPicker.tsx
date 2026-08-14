"use client";

import { useEffect, useRef, useState } from "react";
import { mediaImageUrl, type Media } from "@/lib/types";

interface Props {
  value: Media;
  onChange: (media: Media) => void;
  label: string;
}

/**
 * One picture slot: search the ARASAAC symbol library, or upload a photo of the
 * real person/place — familiar photos work far better than generic symbols for
 * some users, so both routes are first-class.
 */
export default function MediaPicker({ value, onChange, label }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<
    Array<{ id: number; label: string; bundled?: boolean }>
  >([]);
  const [searching, setSearching] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const src = mediaImageUrl(value);

  useEffect(() => {
    if (!open || query.trim().length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/pictograms?q=${encodeURIComponent(query)}`);
        setResults((await res.json()).results ?? []);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [query, open]);

  async function upload(file: File) {
    setUploadError(null);
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/media", { method: "POST", body });
    if (!res.ok) {
      setUploadError((await res.json()).error ?? "Upload failed");
      return;
    }
    const { fileId } = await res.json();
    onChange({ kind: "drive", fileId, label: file.name });
    setOpen(false);
  }

  return (
    <div>
      <div className="media-slot">
        {src ? (
          <img alt={value.kind === "none" ? "" : value.label} src={src} />
        ) : (
          <span className="muted">No picture</span>
        )}
      </div>
      <div className="row" style={{ marginTop: 10 }}>
        <button
          className="btn secondary"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          {open ? "Close" : "Choose picture"}
        </button>
        {value.kind !== "none" ? (
          <button
            className="btn danger"
            onClick={() => onChange({ kind: "none" })}
            aria-label={`Remove picture for ${label}`}
          >
            Remove
          </button>
        ) : null}
      </div>

      {open ? (
        <div className="card" style={{ marginTop: 12 }}>
          <div className="field">
            <label htmlFor={`sym-${label}`}>Search symbols</label>
            <input
              id={`sym-${label}`}
              type="text"
              value={query}
              placeholder="e.g. brush teeth"
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {searching ? <p className="muted">Searching…</p> : null}
          {!searching && query.trim().length >= 2 && results.length === 0 ? (
            <p className="muted">No symbols found. Try a simpler word.</p>
          ) : null}

          {results.length > 0 ? (
            <div className="picker-grid">
              {results.map((r) => (
                <button
                  key={r.id}
                  title={r.label}
                  onClick={() => {
                    onChange({ kind: "pictogram", id: r.id, label: r.label });
                    setOpen(false);
                  }}
                >
                  <img
                    alt={r.label}
                    src={
                      r.bundled
                        ? `/symbols/${r.id}.png`
                        : `/api/pictograms/image/${r.id}`
                    }
                  />
                </button>
              ))}
            </div>
          ) : null}

          <hr style={{ margin: "20px 0", border: 0, borderTop: "2px solid var(--line)" }} />

          <button className="btn secondary" onClick={() => fileInput.current?.click()}>
            Upload a photo instead
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void upload(f);
              e.target.value = "";
            }}
          />
          {uploadError ? <p className="notice error">{uploadError}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
