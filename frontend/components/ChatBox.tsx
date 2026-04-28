"use client";

import { useEffect, useRef, useState } from "react";
import { UserProfile } from "@/types";

type Props = {
  profile: UserProfile;
};

type Message = {
  role: "user" | "assistant";
  content: string;
};

function cleanReply(text: string) {
  return text
    .replace(/^###\s?/gm, "")
    .replace(/^##\s?/gm, "")
    .replace(/^#\s?/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .trim();
}

const initialMessage: Message = {
  role: "assistant",
  content:
    "Hi, I’m TrainWise. Ask me about workouts, meals, muscle gain, fat loss, or recovery.",
};

const quickPrompts = [
  "Give me a high-protein breakfast idea",
  "Suggest a home dumbbell workout",
  "How can I gain muscle faster?",
  "Give me fat loss tips",
];

function getInitialMessages(): Message[] {
  if (typeof window === "undefined") {
    return [initialMessage];
  }

  try {
    const savedMessages = localStorage.getItem("trainwise_chat_messages");

    if (savedMessages) {
      const parsed = JSON.parse(savedMessages) as Message[];

      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }

    return [initialMessage];
  } catch {
    localStorage.removeItem("trainwise_chat_messages");
    return [initialMessage];
  }
}

export default function ChatBox({ profile }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>(getInitialMessages);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    localStorage.setItem("trainwise_chat_messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, isOpen]);

  const clearChat = () => {
    setMessages([initialMessage]);
    setMessage("");
    localStorage.removeItem("trainwise_chat_messages");
  };

  const sendChatMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage = text.trim();
    const historyToSend = [...messages];

    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/chat/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile,
          user_message: userMessage,
          history: historyToSend,
        }),
      });

      const data = await res.json();

      const reply =
        typeof data.reply === "string"
          ? cleanReply(data.reply)
          : "Sorry, I could not generate a response.";

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I couldn’t connect to TrainWise right now.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    await sendChatMessage(message);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="fixed bottom-5 right-5 z-[60] flex h-16 w-16 items-center justify-center rounded-full bg-slate-950 text-white shadow-[0_20px_45px_rgba(15,23,42,0.35)] ring-4 ring-white transition duration-200 hover:scale-105 hover:bg-slate-800 dark:ring-slate-800"
        aria-label={isOpen ? "Close TrainWise chat" : "Open TrainWise chat"}
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 10h8M8 14h5m-9 6l2.2-2.2a2 2 0 011.4-.6H17a3 3 0 003-3V7a3 3 0 00-3-3H7a3 3 0 00-3 3v7a3 3 0 003 3h.4a2 2 0 011.4.6L11 20z"
            />
          </svg>
        )}

        {!isOpen && (
          <span className="absolute right-1.5 top-1.5 h-3 w-3 rounded-full bg-emerald-400 ring-4 ring-white dark:ring-slate-800" />
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-28 right-5 z-50 flex h-[640px] max-h-[calc(100vh-8rem)] w-[calc(100vw-2rem)] max-w-[390px] flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.24)] dark:border-slate-700 dark:bg-slate-950">
          <div className="flex shrink-0 items-center justify-between bg-gradient-to-r from-slate-950 to-slate-800 px-5 py-4 text-white dark:from-slate-900 dark:to-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white ring-2 ring-white/20">
                AI
              </div>

              <div>
                <h3 className="font-semibold">TrainWise Coach</h3>
                <p className="text-xs text-slate-300">
                  Fitness and nutrition chat
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={clearChat}
              className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20"
            >
              Clear
            </button>
          </div>

          <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendChatMessage(prompt)}
                  disabled={loading}
                  className="rounded-full bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-blue-300"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-gradient-to-b from-slate-50 to-white p-4 dark:from-slate-950 dark:to-slate-900">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={
                    msg.role === "user"
                      ? "max-w-[82%] rounded-2xl rounded-br-md bg-blue-600 px-4 py-3 text-sm leading-relaxed text-white shadow-sm"
                      : "max-w-[82%] whitespace-pre-wrap rounded-2xl rounded-bl-md bg-white px-4 py-3 text-sm leading-relaxed text-slate-700 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700"
                  }
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[82%] rounded-2xl rounded-bl-md bg-white px-4 py-3 text-sm text-slate-500 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">
                  TrainWise is typing...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="shrink-0 border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex gap-3">
              <textarea
                className="min-h-[54px] flex-1 resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                placeholder="Ask TrainWise something..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />

              <button
                type="button"
                onClick={sendMessage}
                disabled={loading || !message.trim()}
                className="self-end rounded-2xl bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}