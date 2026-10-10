'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Sparkles, 
  Bot, 
  ChevronDown, 
  ChevronUp, 
  Pause, 
  Play, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Gauge, 
  Radio, 
  Terminal, 
  Zap 
} from 'lucide-react';
import { useRiskContext } from '../../context/RiskContext';

export interface TelemetryEvent {
  id: string;
  timestamp: string;
  category: 'KRI' | 'HEALTH' | 'CONTROL' | 'THREAT' | 'AUDIT' | 'AI_QWEN' | 'SLA';
  title: string;
  message: string;
  metric: string;
  severity: 'normal' | 'warning' | 'critical' | 'success';
}

export const LiveMonitoringTicker: React.FC = () => {
  const { openCopilot } = useRiskContext();
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [currentEvent, setCurrentEvent] = useState<TelemetryEvent | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const eventSourceRef = useRef<EventSource | null>(null);
  const seenIdsRef = useRef<Set<string>>(new Set());

  // Connect to live SSE stream
  useEffect(() => {
    let active = true;

    // Initial fetch to populate immediately
    fetch('/api/live-monitoring?limit=3')
      .then(res => res.json())
      .then(data => {
        if (!active) return;
        if (data.events && Array.isArray(data.events)) {
          data.events.forEach((ev: TelemetryEvent) => seenIdsRef.current.add(ev.id));
          setEvents(data.events);
          if (data.events.length > 0) {
            setCurrentEvent(data.events[0]);
          }
        }
      })
      .catch(() => {});

    // Establish EventSource connection for non-repeating real-time updates
    try {
      const es = new EventSource('/api/live-monitoring?sse=true');
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        if (!active || isPaused) return;
        try {
          const newEvent: TelemetryEvent = JSON.parse(event.data);
          if (newEvent && !seenIdsRef.current.has(newEvent.id)) {
            seenIdsRef.current.add(newEvent.id);
            setCurrentEvent(newEvent);
            setEvents(prev => [newEvent, ...prev.slice(0, 19)]);
            setIsConnected(true);
          }
        } catch (e) {}
      };

      es.onerror = () => {
        setIsConnected(false);
        es.close();
      };
    } catch (e) {
      setIsConnected(false);
    }

    return () => {
      active = false;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [isPaused]);

  // Periodic polling fallback if SSE is disconnected
  useEffect(() => {
    if (isConnected || isPaused) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/live-monitoring?limit=1');
        const data = await res.json();
        if (data.events?.[0]) {
          const ev: TelemetryEvent = data.events[0];
          if (!seenIdsRef.current.has(ev.id)) {
            seenIdsRef.current.add(ev.id);
            setCurrentEvent(ev);
            setEvents(prev => [ev, ...prev.slice(0, 19)]);
          }
        }
      } catch {}
    }, 5000);

    return () => clearInterval(interval);
  }, [isConnected, isPaused]);

  const getCategoryBadge = (cat: TelemetryEvent['category']) => {
    switch (cat) {
      case 'AI_QWEN':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center gap-1"><Zap className="w-2.5 h-2.5" /> QWEN 27B</span>;
      case 'KRI':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1"><Gauge className="w-2.5 h-2.5" /> KRI</span>;
      case 'HEALTH':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1"><Activity className="w-2.5 h-2.5" /> SRE HEALTH</span>;
      case 'CONTROL':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1"><CheckCircle2 className="w-2.5 h-2.5" /> CONTROLS</span>;
      case 'SLA':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> SLA BREACH</span>;
      case 'AUDIT':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center gap-1"><Terminal className="w-2.5 h-2.5" /> SOC 2 AUDIT</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-slate-500/20 text-slate-400 border border-slate-500/30">TELEMETRY</span>;
    }
  };

  const handleAskQwen = (event: TelemetryEvent) => {
    openCopilot(`Diagnose this real-time telemetry event and its impact on our risk register: [${event.category}] ${event.title} — ${event.message} (Metric: ${event.metric})`);
  };

  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800 text-white shadow-xs overflow-hidden transition-all">
      {/* Main Stream Ticker Row */}
      <div className="p-2.5 px-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Live Pulsing Beacon */}
          <div className="flex items-center gap-1.5 shrink-0 px-2 py-1 rounded-md bg-slate-950 border border-slate-800">
            <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-amber-400' : 'bg-emerald-400 animate-ping'}`} />
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
              <Radio className="w-2.5 h-2.5 text-emerald-400" />
              {isPaused ? 'Paused' : 'Live Stream'}
            </span>
          </div>

          {currentEvent && (
            <div className="flex items-center gap-2 min-w-0 truncate">
              {getCategoryBadge(currentEvent.category)}
              
              <span className="font-bold text-slate-200 text-[11px] shrink-0">
                {currentEvent.title}:
              </span>

              <span className="text-slate-400 text-[11px] truncate hidden md:inline">
                {currentEvent.message}
              </span>

              {/* Metric Chip */}
              <span className="px-1.5 py-0.2 rounded font-mono text-[10px] font-bold bg-slate-800 text-emerald-300 border border-slate-700 shrink-0">
                {currentEvent.metric}
              </span>
            </div>
          )}

          {!currentEvent && (
            <span className="text-slate-400 text-[11px] italic">
              Initializing live non-repeating telemetry stream...
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          {currentEvent && (
            <button
              onClick={() => handleAskQwen(currentEvent)}
              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
              title="Send this live event to Groq Qwen Chatbot for diagnosis"
            >
              <Bot className="w-3 h-3 text-indigo-200" />
              <span>Ask Qwen</span>
            </button>
          )}

          {/* Pause / Resume Stream */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isPaused ? "Resume Live Stream" : "Pause Live Stream"}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5" />}
          </button>

          {/* Toggle Stream History Log */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-0.5 text-[10px]"
            title="View Non-Repeating Stream History"
          >
            <span>Log</span>
            {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expandable Non-Repeating History Log Drawer */}
      {showHistory && (
        <div className="p-3 bg-slate-950/90 border-t border-slate-800/80 space-y-2 max-h-56 overflow-y-auto no-scrollbar text-xs">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <span>Non-Repeating Telemetry Event Buffer (Latest {events.length})</span>
            <span>WebSocket / SSE Feed Active</span>
          </div>

          {events.map((ev) => (
            <div 
              key={ev.id}
              className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/60 flex items-start justify-between gap-2.5 hover:bg-slate-850 transition-colors"
            >
              <div className="flex items-start gap-2 min-w-0">
                <span className="font-mono text-[9px] text-slate-500 pt-0.5 shrink-0">{ev.timestamp}</span>
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5">
                    {getCategoryBadge(ev.category)}
                    <span className="font-bold text-slate-200 text-[11px]">{ev.title}</span>
                  </div>
                  <p className="text-slate-400 text-[10px] leading-relaxed">{ev.message}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="px-1.5 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-800 text-emerald-300 border border-slate-700">
                  {ev.metric}
                </span>
                <button
                  onClick={() => handleAskQwen(ev)}
                  className="p-1 rounded text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/60"
                  title="Ask Qwen about this event"
                >
                  <Bot className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
