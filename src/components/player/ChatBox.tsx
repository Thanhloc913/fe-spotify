import React, { useState, useEffect, useRef } from 'react';
import { sendPrompt } from '../../api/chatApi';

interface ChatBoxProps {
  open: boolean;
  onClose: () => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({ open, onClose }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ text: string; from: 'user' | 'bot' }[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Khi mở chatbox, nếu chưa có tin nhắn thì gửi lời chào
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ text: 'Xin chào! Tôi có thể giúp gì cho bạn?', from: 'bot' }]);
    }
  }, [open]);

  // Tự động cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  if (!open) return null;

  const handleSend = async () => {
    if (message.trim()) {
      const userMsg = { text: message, from: 'user' } as const;
      setMessages(prev => [...prev, userMsg]);
      setMessage('');
      setLoading(true);
      try {
        const botReply = await sendPrompt(message);
        setMessages(prev => [...prev, { text: botReply, from: 'bot' }]);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed bottom-24 right-8 z-50 bg-gray-900 rounded-lg shadow-lg w-80 max-w-full flex flex-col border border-gray-700">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-gray-800 rounded-t-lg">
        <span className="font-semibold text-white">Chatbot</span>
        <button onClick={onClose} className="text-gray-400 hover:text-red-400 text-xl">×</button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-72">
        {messages.length === 0 && <div className="text-gray-400 text-sm text-center">Chưa có tin nhắn</div>}
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`px-3 py-2 rounded-lg text-sm break-words max-w-[80%] ${msg.from === 'user' ? 'bg-green-500 text-white' : 'bg-gray-700 text-white'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="px-3 py-2 rounded-lg text-sm bg-gray-700 text-white max-w-[80%] italic opacity-80">Đang trả lời...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex items-center border-t border-gray-800 p-2 bg-gray-800 rounded-b-lg">
        <input
          type="text"
          className="flex-1 px-3 py-2 rounded border border-gray-700 bg-gray-900 text-white focus:outline-none focus:ring focus:border-green-400 text-sm"
          placeholder="Nhập tin nhắn..."
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !loading) handleSend(); }}
          disabled={loading}
        />
        <button
          onClick={handleSend}
          className="ml-2 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm disabled:opacity-60"
          disabled={loading}
        >
          Gửi
        </button>
      </div>
    </div>
  );
};

export default ChatBox; 