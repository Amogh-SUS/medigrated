import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import axios from "axios";

function PatientChatbot() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello 👋 I'm your health assistant. How can I help you?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const newMessage = { sender: "user", text: input };

    // Add user message to chat
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/chatbot/message", {
        message: input,
      });

      const botReply = res.data.reply || "Sorry, I didn’t quite catch that.";
      setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Something went wrong. Please try again later." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-white border rounded-lg shadow-md">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`px-4 py-2 rounded-2xl max-w-[75%] ${
                msg.sender === "user"
                  ? "bg-black text-white rounded-br-none"
                  : "bg-gray-100 text-gray-900 rounded-bl-none"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-gray-500 text-sm italic">Bot is typing...</div>
        )}
      </div>

      {/* Input Area */}
      <div className="flex items-center gap-2 border-t p-3">
        <Input
          placeholder="Ask me anything about your health..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <Button onClick={handleSend} disabled={loading}>
          <Send className="w-4 h-4 mr-1" />
          Send
        </Button>
      </div>
    </div>
  );
}

export default PatientChatbot;
