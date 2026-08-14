import { redirect } from "next/navigation";
import { auth } from "@/auth";
import TopBar from "../TopBar";
import LibraryClient from "./LibraryClient";

export default async function LibraryPage() {
  const session = await auth();
  if (!session?.user || session.error) redirect("/");
  return (
    <>
      <TopBar />
      <LibraryClient />
    </>
  );
}
