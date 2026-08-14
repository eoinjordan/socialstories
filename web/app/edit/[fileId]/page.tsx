import { redirect } from "next/navigation";
import { auth } from "@/auth";
import TopBar from "../../TopBar";
import Editor from "../Editor";

export default async function EditPage({
  params,
}: {
  params: Promise<{ fileId: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.error) redirect("/");
  const { fileId } = await params;
  return (
    <>
      <TopBar />
      <Editor fileId={fileId} />
    </>
  );
}
