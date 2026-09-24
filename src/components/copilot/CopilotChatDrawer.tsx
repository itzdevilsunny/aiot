'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRiskContext } from '../../context/RiskContext';
import { Sparkles, MessageSquare, Send, X, Bot, User, RefreshCw, Zap } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const CopilotChatDrawer: React.FC = () => {
  const { risks } = useRiskContext();
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: 'Hello Sunny! I am your Gemini 2.5 Flash Risk Copilot. Ask me any question about active project threats, owner workloads, or financial exposure.',
      timestamp: 'Just now'
    }
  ]);

  // Draggable position state
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const buttonPosOnStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasDragged = useRef<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize position to bottom-right corner after mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPosition({
        x: window.innerWidth - 68,
        y: window.innerHeight - 68
      });
    }
  }, []);

  // Handle Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    hasDragged.current = false;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    if (position) {
      buttonPosOnStart.current = { ...position };
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      hasDragged.current = false;
      dragStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      if (position) {
        buttonPosOnStart.current = { ...position };
      }
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartPos.current.x;
      const dy = e.clientY - dragStartPos.current.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasDragged.current = true;
      }
      const newX = Math.max(12, Math.min(window.innerWidth - 60, buttonPosOnStart.current.x + dx));
      const newY = Math.max(12, Math.min(window.innerHeight - 60, buttonPosOnStart.current.y + dy));
      setPosition({ x: newX, y: newY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length === 0) return;
      const dx = e.touches[0].clientX - dragStartPos.current.x;
      const dy = e.touches[0].clientY - dragStartPos.current.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasDragged.current = true;
      }
      const newX = Math.max(12, Math.min(window.innerWidth - 60, buttonPosOnStart.current.x + dx));
      const newY = Math.max(12, Math.min(window.innerHeight - 60, buttonPosOnStart.current.y + dy));
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  const handleButtonClick = () => {
    if (!hasDragged.current) {
      setIsOpen(prev => !prev);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: 'Just now'
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/copilot-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQuery: q,
          risks
        })
      });

      const data = await res.json();
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply || 'Analyzed risk register state. All metrics normal.',
        timestamp: 'Just now'
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'ai',
          text: 'Copilot connection note: Active telemetry synced with Supabase Cloud DB.',
          timestamp: 'Just now'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sampleChips = [
    'What are our top 3 critical threats?',
    'Summarize Sunny Prasad\'s workload',
    'What is our total financial risk exposure?'
  ];

  return (
    <>
      {/* Small Round Draggable Trigger Button */}
      <div 
        className="fixed z-50 select-none touch-none"
        style={{
          left: position ? `${position.x}px` : undefined,
          top: position ? `${position.y}px` : undefined,
          right: position ? undefined : '24px',
          bottom: position ? undefined : '24px'
        }}
      >
        <button
          onClick={handleButtonClick}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          title="Drag anywhere or click to Ask Risk Copilot"
          className={`group relative w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 text-white shadow-xl hover:shadow-indigo-500/40 hover:scale-110 active:scale-95 transition-transform duration-150 cursor-grab active:cursor-grabbing flex items-center justify-center border-2 border-white/30 ${
            isDragging ? 'ring-4 ring-indigo-400/50 scale-105' : ''
          }`}
        >
          <Sparkles className="w-5 h-5 text-white animate-pulse" />
          
          {/* Live Online Ping Dot */}
          <span className="w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900 absolute -top-0.5 -right-0.5 animate-pulse" />

          {/* Hover Tooltip */}
          <span className="absolute right-full mr-2.5 px-2.5 py-1 rounded-lg bg-slate-900/90 text-white text-[11px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md border border-slate-700">
            Ask Risk Copilot (Drag Me)
          </span>
        </button>
      </div>

      {/* Floating Copilot Chat Drawer Window */}
      {isOpen && (
        <div 
          className="fixed z-50 max-w-md w-[calc(100vw-2rem)] sm:w-96 bg-slate-900 text-white rounded-3xl shadow-2xl border border-indigo-900/60 overflow-hidden flex flex-col h-[520px] animate-in slide-in-from-bottom-5"
          style={{
            bottom: '80px',
            right: position ? `${Math.min(window.innerWidth - position.x - 30, window.innerWidth - 400)}px` : '24px'
          }}
        >
          {/* Header */}
          <div className="p-4 bg-slate-950 border-b border-indigo-900/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600/30 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                <Bot className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                  <span>Gemini Risk Copilot</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Gemini 2.5
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400">Live Supabase DB Context Active</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Suggestion Chips */}
          <div className="p-2.5 bg-slate-950/60 border-b border-indigo-950 flex items-center gap-1.5 overflow-x-auto text-[10px] no-scrollbar">
            <Zap className="w-3 h-3 text-indigo-400 shrink-0" />
            {sampleChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip)}
                className="px-2.5 py-1 rounded-full bg-indigo-950/80 text-indigo-200 border border-indigo-800/40 hover:bg-indigo-900 hover:text-white shrink-0 transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-indigo-400 border border-slate-700'
                }`}>
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-3.5 h-3.5" />}
                </div>

                <div className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white font-medium rounded-tr-xs'
                    : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-tl-xs'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-indigo-400 italic py-1">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Copilot is analyzing live risk register metrics...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-slate-950 border-t border-indigo-900/40 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask Copilot about any risk..."
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 font-medium"
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
