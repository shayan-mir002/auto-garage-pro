import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Loader2, Inbox } from 'lucide-react';
import { getAll, query, insert } from '../../lib/supabase';
import toast from 'react-hot-toast';

export default function ManageChat() {
  const [sessions, setSessions]     = useState([]);
  const [activeSession, setActive]  = useState(null);
  const [messages, setMessages]     = useState([]);
  const [reply, setReply]           = useState('');
  const [sending, setSending]       = useState(false);
  const [loading, setLoading]       = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => { fetchSessions(); }, []);

  useEffect(() => {
    if (!activeSession) return;
    fetchMessages(activeSession);
  }, [activeSession]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchSessions = async () => {
    setLoading(true);
    const data = await getAll('chat_messages');
    data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const map = {};
    data.forEach((m) => {
      if (!map[m.session_id]) map[m.session_id] = m;
    });
    setSessions(Object.values(map));
    setLoading(false);
  };

  const fetchMessages = async (sessionId) => {
    const data = await query('chat_messages', (m) => m.session_id === sessionId);
    data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    setMessages(data);
  };

  const sendReply = async (e) => {
    e.preventDefault();
    if (!reply.trim() || !activeSession) return;
    setSending(true);
    await insert('chat_messages', {
      session_id:    activeSession,
      customer_name: 'Admin',
      sender:        'admin',
      message:       reply.trim(),
    });
    setReply('');
    setSending(false);
  };

  const unreadCount = sessions.filter(s => !s.is_read && s.sender === 'customer').length;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-display font-bold text-white flex items-center gap-2">
        <MessageCircle size={20} className="text-brand-400" /> Live Chat
        {unreadCount > 0 && <span className="bg-accent-orange text-dark-900 text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount} new</span>}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ height: '60vh' }}>
        {/* Session List */}
        <div className="card overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full"><Loader2 size={24} className="animate-spin text-brand-400" /></div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <Inbox size={32} className="text-dark-300 mb-2" />
              <p className="text-slate-500 text-sm">No chat sessions yet.</p>
            </div>
          ) : sessions.map((s) => (
            <button
              key={s.session_id}
              onClick={() => setActive(s.session_id)}
              className={`w-full text-left px-4 py-3 border-b border-dark-300/30 transition-colors ${activeSession === s.session_id ? 'bg-brand-900/30' : 'hover:bg-dark-700'}`}
            >
              <p className="text-white text-sm font-medium">{s.customer_name || 'Guest'}</p>
              <p className="text-slate-500 text-xs mt-0.5 truncate">{s.session_id}</p>
              <p className="text-slate-600 text-xs">{new Date(s.created_at).toLocaleString()}</p>
            </button>
          ))}
        </div>

        {/* Chat Window */}
        <div className="lg:col-span-2 card flex flex-col">
          {!activeSession ? (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <MessageCircle size={40} className="text-dark-300 mx-auto mb-3" />
                <p className="text-slate-500">Select a session to view messages</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div>
                      <p className={`text-xs mb-1 ${m.sender === 'admin' ? 'text-right text-slate-500' : 'text-slate-500'}`}>
                        {m.sender === 'admin' ? 'You (Admin)' : m.customer_name || 'Customer'}
                      </p>
                      <div className={`text-sm px-4 py-2.5 rounded-2xl max-w-xs ${
                        m.sender === 'admin' ? 'bg-brand-gradient text-white' : 'bg-dark-600 text-slate-300'
                      }`}>
                        {m.message}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <form onSubmit={sendReply} className="p-3 border-t border-dark-300/40 flex gap-2">
                <input
                  className="input text-sm py-2 flex-1"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type a reply..."
                  disabled={sending}
                />
                <button type="submit" disabled={sending || !reply.trim()} className="btn-primary text-sm py-2 px-4">
                  {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
