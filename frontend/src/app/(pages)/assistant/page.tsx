"use client";

import { useRouter } from "next/navigation";
import { useAssistantChat } from "@/app/hooks/useAssistantChat";
import { InitialView } from "@/app/components/assistant/InitialView";
import { ChatView } from "@/app/components/assistant/ChatView";
import type { MikeMessage } from "@/app/components/shared/types";

export default function AssistantPage() {
    const router = useRouter();
    const { messages, isResponseLoading, handleChat, handleNewChat, cancel } =
        useAssistantChat();

    async function handleInitialSubmit(message: MikeMessage) {
        const chatId = await handleNewChat(message);
        if (chatId) router.push(`/assistant/chat/${chatId}`);
    }

    const content = messages.length === 0 ? (
        <InitialView onSubmit={(message) => void handleInitialSubmit(message)} />
    ) : (
        <ChatView
            messages={messages}
            isResponseLoading={isResponseLoading}
            handleChat={handleChat}
            cancel={cancel}
        />
    );

    return <div className="bg-[#0F1426] h-full w-full">{content}</div>;
}