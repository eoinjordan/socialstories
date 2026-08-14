import { redirect } from "next/navigation";
import { auth } from "@/auth";
import TopBar from "../TopBar";
import TemplateBrowser from "./TemplateBrowser";
import { CATEGORIES, TEMPLATES } from "@/lib/catalog";

export default async function TemplatesPage() {
  const session = await auth();
  if (!session?.user || session.error) redirect("/");
  return (
    <>
      <TopBar />
      <TemplateBrowser templates={TEMPLATES} categories={CATEGORIES} />
    </>
  );
}
