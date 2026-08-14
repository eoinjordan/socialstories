import { NextResponse } from "next/server";
import { TEMPLATES } from "@/lib/catalog";

/** The catalogue is static text; the Android app fetches this to seed itself. */
export async function GET() {
  return NextResponse.json({
    license: "CC0-1.0",
    note: "Wording is original and public domain. Symbols are resolved from ARASAAC (CC BY-NC-SA).",
    templates: TEMPLATES,
  });
}
