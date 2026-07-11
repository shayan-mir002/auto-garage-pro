import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { getAll, insert } from '../lib/supabase';


function getSessionId() {
  let id = localStorage.getItem('chat_session_id');
  if (!id) {
    id = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem('chat_session_id', id);
  }
  return id;
}

export default function ChatWidget() {
  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText]       = useState('');
  const [name, setName]       = useState(localStorage.getItem('chat_name') || '');
  const [nameSet, setNameSet] = useState(!!localStorage.getItem('chat_name'));
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const sessionId = getSessionId();

  useEffect(() => {
    if (!open) return;
    fetchMessages();
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    const all = await getAll('chat_messages');
    const filtered = all.filter(m => m.session_id === sessionId);
    const sorted = filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    setMessages(sorted);
  };

  const handleSetName = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    localStorage.setItem('chat_name', name.trim());
    setNameSet(true);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    await insert('chat_messages', {
      session_id:    sessionId,
      customer_name: name,
      sender:        'customer',
      message:       text.trim(),
    });
    setText('');
    setSending(false);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-accent-gradient shadow-glow-orange flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
        aria-label="Open chat"
      >
        {open ? <X size={22} className="text-dark-900" /> : <MessageCircle size={22} className="text-dark-900" />}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 h-[480px] bg-dark-800 border border-dark-300/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="bg-brand-gradient px-4 py-3 flex items-center gap-2">
            <MessageCircle size={16} className="text-white" />
            <span className="text-white font-semibold text-sm">Live Chat</span>
            <span className="ml-auto flex items-center gap-1.5 text-blue-200 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Online
            </span>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="flex justify-start">
              <div className="bg-dark-600 text-slate-300 text-sm px-4 py-2.5 rounded-2xl rounded-tl-sm max-w-[80%]">
                👋 Hi! How can we help you today?
              </div>
            </div>

            {!nameSet ? (
              <form onSubmit={handleSetName} className="mt-4">
                <p className="text-slate-400 text-xs mb-2">Please enter your name to start chatting:</p>
                <div className="flex gap-2">
                  <input
                    className="input text-sm py-2 flex-1"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name..."
                    required
                  />
                  <button type="submit" className="btn-accent text-sm px-3 py-2">Go</button>
                </div>
              </form>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={`flex ${m.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`text-sm px-4 py-2.5 rounded-2xl max-w-[80%] ${
                    m.sender === 'customer'
                      ? 'bg-brand-gradient text-white rounded-tr-sm'
                      : 'bg-dark-600 text-slate-300 rounded-tl-sm'
                  }`}>
                    {m.message}
                  </div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          {nameSet && (
            <form onSubmit={handleSend} className="p-3 border-t border-dark-300/40 flex gap-2">
              <input
                className="input text-sm py-2 flex-1"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message..."
                disabled={sending}
              />
              <button type="submit" disabled={sending || !text.trim()} className="p-2.5 rounded-lg bg-brand-gradient text-white disabled:opacity-40 transition-opacity">
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
}
