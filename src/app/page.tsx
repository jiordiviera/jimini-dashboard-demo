import { AppShell } from "@/components/app-shell";
import { ChatRunnerProvider } from "@/components/chat-runner-provider";

export default function Page() {
  return (
    <ChatRunnerProvider>
      <AppShell />
    </ChatRunnerProvider>
  );
}
