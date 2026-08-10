import React, { useState, useRef, useEffect } from 'react';
import { api, getImageUrl } from '../../utils/api';
import type { Product } from '../../types';
import { useApp } from '../../context/AppContext';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  products?: Product[];
  timestamp: string;
}

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const { whatsappNumber } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: "👋 Hi! I'm your AI Shopping Assistant for **Upanishad Mobiles**. Ask me anything like:\n\n• *\"Show me iPhone 17 Pro Max in Brown\"*\n• *\"Does iPhone 17 Pro Max have Titanium Gray?\"*\n• *\"Phones under ₹80,000\"*",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isThinking]);

  async function handleSend(textToSend?: string) {
    const query = textToSend || inputMsg.trim();
    if (!query || isThinking) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputMsg('');
    setIsThinking(true);

    const res = await api.sendChatMessage(query);
    setIsThinking(false);

    if (res.success && res.data) {
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: res.data.reply || 'Here is what I found for you:',
        products: res.data.products || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMessage]);
    } else {
      const errorMessage: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        sender: 'bot',
        text: 'Sorry, I had trouble connecting to the store catalog. Please try again or message us on WhatsApp!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  }

  function handleOrderWhatsApp(product: Product) {
    const num = whatsappNumber.replace(/[^0-9]/g, '');
    const msg = `Hi Upanishad Mobile Store, I would like to reserve/order: ${product.name} (₹${product.price}). Please confirm takeaway availability!`;
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="fixed bottom-6 left-6 z-50 font-sans">
      {/* Sleek Compact Floating AI Icon Button */}
      {!isOpen && (
        <div className="relative">
          {showTooltip && (
            <div
              className="absolute bottom-full left-0 mb-2 px-3 py-1.5 bg-ink-black text-white font-sans text-label-sm rounded whitespace-nowrap shadow-md"
              role="tooltip"
            >
              Ask AI Assistant
              <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-ink-black" />
            </div>
          )}
          <button
            onClick={() => setIsOpen(true)}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-[#004ac6] via-[#4338ca] to-[#6B46C1] text-white shadow-2xl hover:scale-110 transition-all duration-300 group"
            aria-label="Open AI Shopping Assistant"
          >
            <span className="material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform">auto_awesome</span>
            <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border-2 border-white shadow-xs">
              AI
            </span>
          </button>
        </div>
      )}

      {/* Expanded Chat Drawer */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[390px] h-[520px] max-h-[85vh] bg-white border border-ash/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#004ac6] to-[#4338ca] text-white p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-full bg-white/10 border border-white/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">auto_awesome</span>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-white"></span>
              </div>
              <div>
                <h3 className="font-sans text-body-sm font-bold tracking-wide">Upanishad AI Assistant</h3>
                <p className="text-[10px] text-white/80 font-medium">Instant RAG Product Finder</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              aria-label="Close Chat"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 bg-[#fbf8f6]/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] p-3 rounded-2xl font-sans text-body-sm leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-[#004ac6] text-white rounded-br-none'
                      : 'bg-white border border-ash/80 text-ink-black rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Render Product Cards if available */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-3 space-y-2.5 pt-2 border-t border-ash/40">
                      {msg.products.map((p) => {
                        const imgPath = p.images?.[0]?.image_path || p.main_image || '';
                        const imgUrl = imgPath ? getImageUrl(imgPath) : '';
                        return (
                          <div
                            key={p.id}
                            className="bg-[#fbf8f6] border border-ash rounded-xl p-2.5 flex gap-2.5 items-center hover:border-[#004ac6] transition-colors"
                          >
                            <div className="w-14 h-14 bg-white rounded-lg border border-ash/60 overflow-hidden shrink-0 flex items-center justify-center p-1">
                              {imgUrl ? (
                                <img src={imgUrl} alt={p.name} className="w-full h-full object-contain mix-blend-multiply" />
                              ) : (
                                <span className="material-symbols-outlined text-smoke text-xl">image</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-sans text-caption font-bold text-ink-black line-clamp-1">{p.name}</h4>
                              <p className="font-sans text-caption font-bold text-[#004ac6]">₹{p.price.toLocaleString('en-IN')}</p>
                              {p.models && p.models.length > 0 && (
                                <p className="text-[10px] text-smoke line-clamp-1">📱 {p.models.slice(0, 2).join(', ')}</p>
                              )}
                            </div>
                            <button
                              onClick={() => handleOrderWhatsApp(p)}
                              className="bg-[#25D366] text-white p-2 rounded-lg hover:opacity-90 transition-opacity shrink-0 flex items-center justify-center shadow-xs"
                              title="Order via WhatsApp"
                            >
                              <span className="material-symbols-outlined text-base">chat</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-smoke mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {/* Thinking Indicator */}
            {isThinking && (
              <div className="flex items-start gap-2">
                <div className="bg-white border border-ash/80 p-3 rounded-2xl rounded-bl-none shadow-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#004ac6] animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-[#004ac6] animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-[#004ac6] animate-bounce [animation-delay:0.4s]"></span>
                  <span className="text-[11px] font-sans font-medium text-smoke ml-1">Searching Catalog...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-1.5 bg-white border-t border-ash/40 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            <button
              onClick={() => handleSend('Show me iPhone 17 Pro Max')}
              className="bg-[#f0f4ff] text-[#004ac6] hover:bg-[#e0ecff] font-sans text-[10px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap border border-[#d0e0ff] transition-colors"
            >
              📱 iPhone 17 Pro Max
            </button>
            <button
              onClick={() => handleSend('Does iPhone 17 Pro Max have Titanium Gray?')}
              className="bg-[#f0f4ff] text-[#004ac6] hover:bg-[#e0ecff] font-sans text-[10px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap border border-[#d0e0ff] transition-colors"
            >
              🎨 Titanium Gray Check
            </button>
            <button
              onClick={() => handleSend('Phones under 80000')}
              className="bg-[#f0f4ff] text-[#004ac6] hover:bg-[#e0ecff] font-sans text-[10px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap border border-[#d0e0ff] transition-colors"
            >
              💰 Under ₹80,000
            </button>
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 bg-white border-t border-ash flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Ask anything... e.g. iPhone 17 in Brown"
              className="flex-1 px-3.5 py-2 font-sans text-body-sm text-ink-black bg-cream-paper/50 border border-ash rounded-xl focus:outline-none focus:border-[#004ac6]"
            />
            <button
              type="submit"
              disabled={!inputMsg.trim() || isThinking}
              className="bg-[#004ac6] text-white p-2.5 rounded-xl hover:bg-[#003b9e] transition-colors disabled:opacity-40 shrink-0"
              aria-label="Send message"
            >
              <span className="material-symbols-outlined text-lg block">send</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
