import { NextResponse } from "next/server";
import { DriveError } from "./drive";
import { StoreError } from "./store/types";

/**
 * Turns a thrown error into a response. Storage failures carry their own status
 * so the client can tell "signed out" (401) and "Drive not connected" (428)
 * apart from "something broke".
 */
export function errorResponse(e: unknown) {
  if (e instanceof StoreError || e instanceof DriveError) {
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
  console.error("Unhandled API error", e);
  return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
}
