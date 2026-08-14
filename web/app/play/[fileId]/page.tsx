import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Player from "../Player";

export default async function PlayPage({
  params,
}: {
  params: Promise<{ fileId: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.error) redirect("/");
  const { fileId } = await params;
  // No TopBar here on purpose: play mode owns the whole screen.
  return <Player fileId={fileId} />;
}
