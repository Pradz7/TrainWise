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

export default function ChatBox({ profile }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const savedMessages = localStorage.getItem("trainwise_chat_messages");
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages) as Message[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      } catch {
        localStorage.removeItem("trainwise_chat_messages");
      }
    }
  }, []);

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
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
          <button
            type="button"
            onClick={clearChat}
            className="rounded-full border border-slate-300 bg-white px-4 py-3 text-slate-700 shadow-lg hover:bg-slate-50"
          >
            Reset Chat
          </button>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="rounded-full bg-slate-900 px-5 py-4 text-white shadow-lg hover:bg-slate-800"
          >
            Chat with TrainWise
          </button>
        </div>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl md:w-[420px]">
          <div className="flex items-center justify-between bg-slate-900 px-5 py-4 text-white">
            <div>
              <h3 className="font-semibold">TrainWise Coach</h3>
              <p className="text-xs text-slate-300">Fitness and nutrition chat</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearChat}
                className="rounded-full bg-slate-800 px-3 py-1 text-xs hover:bg-slate-700"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full bg-slate-800 px-3 py-1 text-sm hover:bg-slate-700"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="border-b border-slate-200 bg-white px-4 py-3">
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendChatMessage(prompt)}
                  disabled={loading}
                  className="rounded-full border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[420px] space-y-4 overflow-y-auto bg-slate-50 p-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={
                    msg.role === "user"
                      ? "max-w-[80%] rounded-2xl rounded-br-md bg-blue-600 px-4 py-3 text-white shadow-sm"
                      : "max-w-[80%] rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-slate-700 shadow-sm whitespace-pre-wrap leading-relaxed"
                  }
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-slate-500 shadow-sm">
                  TrainWise is typing...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-slate-200 bg-white p-4">
            <div className="flex gap-3">
              <textarea
                className="min-h-[54px] flex-1"
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
                className="self-end rounded-2xl bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700"
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