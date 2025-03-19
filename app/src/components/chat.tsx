"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

export interface ChatProps {
  convId: string;
  arxivId: string;
  onEndChat: () => void;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export function Chat({ convId, arxivId, onEndChat }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !arxivId) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const processResponse = await fetch(
        `http://localhost:8000/process/${arxivId}/${convId}`,
        { method: "POST" }
      );
      const processData = await processResponse.json();

      if (processData.status === "success") {
        const queryResponse = await fetch(
          `http://localhost:8000/query/${arxivId}/${convId}?query=${encodeURIComponent(
            userMessage
          )}`
        );
        const queryData = await queryResponse.json();

        if (queryData.response) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: queryData.response },
          ]);
        }
      }
    } catch (error) {
      console.error("Error in chat:", error);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-full">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <Card
              key={index}
              className={`p-4 ${
                message.role === "assistant"
                  ? "bg-secondary"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              {message.content}
            </Card>
          ))}
          {loading && (
            <Card className="p-4 bg-secondary">
              <div className="animate-pulse">Thinking...</div>
            </Card>
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the paper..."
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" disabled={loading}>
            Send
          </Button>
        </div>
      </form>

      <Button variant="destructive" className="m-4" onClick={onEndChat}>
        End Chat
      </Button>
    </div>
  );
}