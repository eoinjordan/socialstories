import { NextResponse } from "next/server";
import { DriveError } from "./drive";

/**
 * Turns a thrown error into a response. Drive failures carry their own status
 * so the client can tell "signed out" (401) apart from "something broke".
 */
export function errorResponse(e: unknown) {
  if (e instanceof DriveError) {
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
  console.error("Unhandled API error", e);
  return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
}
