// client/src/pages/patient-view/chatbot.jsx
import React, { useEffect, useRef, useState } from "react";
import api from "@/lib/api"; // your axios instance
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Trash2 } from "lucide-react";
import { useSelector } from "react-redux";

const STORAGE_KEY = "patient_chat_history_v1";

function ChatBubble({ msg }) {
  const classes =
    msg.sender === "user"
      ? "bg-black text-white self-end rounded-2xl px-4 py-2 max-w-[75%] rounded-br-none"
      : "bg-gray-100 text-gray-900 self-start rounded-2xl px-4 py-2 max-w-[75%] rounded-bl-none dark:bg-muted/60 dark:text-foreground";

  return (
    <div className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
      <div className={classes}>
        <div className="text-sm">{msg.text}</div>
        <div className="text-[10px] text-muted-foreground mt-1 text-right">{new Date(msg.createdAt || msg.ts).toLocaleTimeString()}</div>
      </div>
    </div>
  );
}

export default function PatientChatbot() {
  const { user } = useSelector((state) => state.auth || {});
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get('/api/chatbot/history'); // uses axios instance
        if (!mounted) return;
        if (res?.data?.success) {
          setMessages(res.data.messages || []);
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(res.data.messages || [])); } catch {}
        } else {
          const raw = localStorage.getItem(STORAGE_KEY);
          setMessages(raw ? JSON.parse(raw) : [{ sender: 'bot', text: "Hello — I'm your health assistant. Ask me anything.", ts: Date.now() }]);
        }
      } catch (err) {
        // fallback local
        const raw = localStorage.getItem(STORAGE_KEY);
        setMessages(raw ? JSON.parse(raw) : [{ sender: 'bot', text: "Hello — I'm your health assistant. Ask me anything.", ts: Date.now() }]);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch {}
    if (containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [messages]);

  const postMessage = async (text) => {
    setLoading(true);
    // optimistic user message
    setMessages((m) => [...m, { sender: 'user', text, ts: Date.now() }]);
    try {
      const res = await api.post('/api/chatbot/message', { message: text });
      if (res?.data?.success) {
        const botMsg = res.data.botMessage ?? { sender: 'bot', text: res.data.reply };
        setMessages((m) => [...m, { sender: 'bot', text: botMsg.text, createdAt: botMsg.createdAt }]);
      } else {
        setMessages((m) => [...m, { sender: 'bot', text: res?.data?.message || 'Server error', ts: Date.now() }]);
      }
    } catch (err) {
      console.error('Chatbot error:', err);
      const reason = err.response?.data?.message || err.message || 'Network error';
      setMessages((m) => [...m, { sender: 'bot', text: `⚠️ Error: ${reason}`, ts: Date.now() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    postMessage(trimmed);
    setInput('');
  };

  const handleClear = async () => {
    try {
      await api.delete('/api/chatbot/history');
      setMessages([{ sender: 'bot', text: 'Conversation cleared. Hello — ask me anything.', ts: Date.now() }]);
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
    } catch (err) {
      console.error('Clear history failed', err);
      setMessages([{ sender: 'bot', text: 'Conversation cleared locally (server clear failed).', ts: Date.now() }]);
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
    }
  };

  return (
    <div className="flex flex-col w-full h-full max-h-[75vh] bg-transparent">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">AI Health Chatbot</h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="p-1 bg-slate-500" onClick={() => { window.scrollTo(0,0); }}>↑</Button>
          <Button variant="ghost" size="icon" className="p-1 bg-slate-500" onClick={handleClear} title="Clear conversation">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 overflow-y-auto space-y-3 p-3 border rounded-md bg-white dark:bg-background">
        {messages.map((m, i) => <ChatBubble key={m._id ?? `${i}-${m.createdAt ?? m.ts}`} msg={m} />)}
        {loading && <div className="text-sm italic text-muted-foreground">Bot is typing...</div>}
      </div>

      <div className="flex items-center gap-2 mt-3">
        <Input
          placeholder="Describe symptoms or ask a question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
        />
        <Button onClick={handleSend} disabled={loading || !input.trim()}>
          <Send className="w-4 h-4 mr-1" />
          Send
        </Button>
      </div>
    </div>
  );
}
