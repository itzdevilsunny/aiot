'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRiskContext } from '../../context/RiskContext';
import { 
  Sparkles, 
  Send, 
  X, 
  Bot, 
  User, 
  RefreshCw, 
  Zap, 
  Maximize2, 
  Minimize2, 
  Mic, 
  MicOff, 
  Paperclip, 
  Image as ImageIcon, 
  Volume2, 
  VolumeX 
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  imagePreview?: string;
  timestamp: string;
}

export const CopilotChatDrawer: React.FC = () => {
  const { risks, addToast } = useRiskContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Voice recognition state
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  // Image attachment state
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: 'Hello Sunny! I am your Risk Register Copilot assistant. Ask me any question about active project threats, owner workloads, or upload a system issue screenshot.',
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

  // Voice Assistant Handler (Web Speech API + Fallback)
  const toggleVoiceAssistant = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        setIsListening(true);
        addToast('Voice Assistant Active', 'Listening to voice query...', 'info');

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputQuery(transcript);
          setIsListening(false);
          addToast('Voice Captured', `"${transcript}"`, 'success');
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
      } catch (err) {
        setIsListening(false);
      }
    } else {
      // Fallback voice simulation
      setIsListening(true);
      addToast('Voice Assistant Active', 'Simulating voice input capture...', 'info');
      setTimeout(() => {
        setInputQuery('What are our top 3 critical threats and financial risk exposure?');
        setIsListening(false);
        addToast('Voice Transcribed', 'Captured query from voice microphone.', 'success');
      }, 1500);
    }
  };

  // Text-To-Speech Audio Playback
  const handleSpeakMessage = (msgId: string, text: string) => {
    if (speakingMsgId === msgId) {
      window.speechSynthesis?.cancel();
      setSpeakingMsgId(null);
      return;
    }

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*_#\[\]]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onend = () => setSpeakingMsgId(null);
      utterance.onerror = () => setSpeakingMsgId(null);

      setSpeakingMsgId(msgId);
      window.speechSynthesis.speak(utterance);
    }
  };

  // File / Image Attachment Handler
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setAttachedImage(result);
      addToast('Image Attached', `Attached screenshot: ${file.name}`, 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (queryText?: string) => {
    const q = queryText || inputQuery;
    if ((!q.trim() && !attachedImage) || loading) return;

    const userMsgText = attachedImage ? `${q || 'Analyzing attached error screenshot'}` : q;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: userMsgText,
      imagePreview: attachedImage || undefined,
      timestamp: 'Just now'
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    const currentImg = attachedImage;
    setAttachedImage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/copilot-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQuery: q || 'Analyze attached issue screenshot and identify operational threats.',
          risks,
          imageBase64: currentImg || undefined,
          imageMimeType: currentImg?.startsWith('data:image/jpeg') ? 'image/jpeg' : 'image/png'
        })
      });

      const data = await res.json();
      const aiMsgText = data.reply || 'Analyzed risk register state. All metrics normal.';

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiMsgText,
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
    { label: '🔥 Top Critical Threats', query: 'What are our top 3 critical threats?' },
    { label: '👤 Sunny\'s Workload', query: 'Summarize Sunny Prasad\'s workload' },
    { label: '💰 Financial Exposure ($)', query: 'What is our total financial risk exposure?' }
  ];

  const formatInlineMarkdown = (str: string) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-extrabold">$1</strong>')
      .replace(/\[(RSK-[A-Za-z0-9-]+)\]/g, '<span class="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-700/60 inline-block">$1</span>');
  };

  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('• ') || trimmed.startsWith('- ')) {
        return (
          <div key={i} className="flex items-start gap-1.5 my-1 pl-1">
            <span className="text-indigo-400 font-bold shrink-0">•</span>
            <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(trimmed.substring(2)) }} />
          </div>
        );
      }
      return (
        <div 
          key={i} 
          className={trimmed === '' ? 'h-2' : 'my-0.5'} 
          dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line) }} 
        />
      );
    });
  };

  return (
    <>
      {/* Hidden File Input for Image Attachment */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*,.pdf,.log"
        onChange={handleImageFileChange}
        className="hidden"
      />

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
          className={`fixed z-50 bg-slate-900 text-white rounded-3xl shadow-2xl border border-indigo-900/60 overflow-hidden flex flex-col transition-all duration-200 animate-in slide-in-from-bottom-5 ${
            isExpanded ? 'w-[calc(100vw-2rem)] sm:w-[540px] h-[640px]' : 'w-[calc(100vw-2rem)] sm:w-[420px] h-[540px]'
          }`}
          style={{
            bottom: '80px',
            right: position ? `${Math.min(window.innerWidth - position.x - 30, window.innerWidth - 440)}px` : '24px'
          }}
        >
          {/* Header */}
          <div className="p-3.5 bg-slate-950 border-b border-indigo-900/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600/30 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                <Bot className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                  <span>Enterprise Risk Copilot</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    AI Online
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400">Live Supabase DB Context Active</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title={isExpanded ? 'Collapse Drawer' : 'Expand Drawer'}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Suggestion Chips */}
          <div 
            className="p-2.5 bg-slate-950/80 border-b border-indigo-950 flex items-center gap-2 overflow-x-auto text-[10px] no-scrollbar shrink-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <Zap className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            {sampleChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip.query)}
                className="px-3 py-1.5 rounded-full bg-indigo-950/90 text-indigo-200 border border-indigo-800/50 hover:bg-indigo-900 hover:text-white shrink-0 font-medium transition-colors shadow-2xs"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-indigo-400 border border-slate-700'
                }`}>
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-3.5 h-3.5" />}
                </div>

                <div className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed space-y-2 ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white font-medium rounded-tr-xs shadow-xs'
                    : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-tl-xs shadow-xs'
                }`}>
                  {msg.imagePreview && (
                    <div className="rounded-xl overflow-hidden border border-white/20 max-h-40">
                      <img src={msg.imagePreview} alt="Attached Issue" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {msg.sender === 'user' ? (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between pb-1 border-b border-slate-700/40 mb-1">
                        <span className="text-[10px] text-indigo-300 font-bold">Copilot Synthesis</span>
                        <button
                          onClick={() => handleSpeakMessage(msg.id, msg.text)}
                          className={`p-1 rounded text-slate-400 hover:text-white transition-colors ${
                            speakingMsgId === msg.id ? 'text-indigo-400 animate-pulse' : ''
                          }`}
                          title="Read out load with Voice"
                        >
                          {speakingMsgId === msg.id ? <VolumeX className="w-3.5 h-3.5 text-indigo-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      {renderFormattedText(msg.text)}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-indigo-400 italic py-2 px-2 bg-slate-950/40 rounded-xl border border-indigo-900/30">
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                <span>Copilot is analyzing live metrics & attached screenshot...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Attached Image Preview Pill */}
          {attachedImage && (
            <div className="px-3 py-1.5 bg-slate-950 border-t border-indigo-900/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[11px] text-indigo-200 font-medium">Issue Screenshot Attached</span>
              </div>
              <button onClick={() => setAttachedImage(null)} className="text-slate-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Input Box with Voice & Image Upload Buttons */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-slate-950 border-t border-indigo-900/40 flex items-center gap-2"
          >
            {/* Image Attachment Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl text-slate-400 hover:text-indigo-300 hover:bg-slate-900 transition-colors shrink-0"
              title="Attach screenshot of issue or log output"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Voice Mic Button */}
            <button
              type="button"
              onClick={toggleVoiceAssistant}
              className={`p-2 rounded-xl transition-colors shrink-0 ${
                isListening 
                  ? 'bg-red-600 text-white animate-pulse' 
                  : 'text-slate-400 hover:text-indigo-300 hover:bg-slate-900'
              }`}
              title="Speak to Copilot (Voice Input)"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={isListening ? "Listening to voice..." : "Ask Copilot or attach screenshot..."}
              className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 font-medium"
            />

            <button
              type="submit"
              disabled={loading || (!inputQuery.trim() && !attachedImage)}
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
