import { Chat as PreviewChat } from "@/components/custom/chat";

export default async function Page({ params }: { params: any }) {
  const { id } = params;

  // DB and auth removed — show preview with empty messages
  return <PreviewChat id={id} initialMessages={[]} />;
}
