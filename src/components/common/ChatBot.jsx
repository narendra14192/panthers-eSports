import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTournaments } from '../../context/TournamentContext';
import { useAuth } from '../../context/AuthContext';
import { generateResponse, generateAIResponse, INITIAL_BOT_MESSAGE } from '../../lib/chatbotEngine';
import {
  MessageCircle,
  X,
  Send,
  Minimize2,
  Bot,
  Sparkles,
  ChevronDown,
  Zap,
} from 'lucide-react';

const AI_AVAILABLE = !!import.meta.env.VITE_NVIDIA_API_KEY;

// ─── Simple Markdown Renderer ────────────────────────────────────────────────
function MessageText({ text }) {
  // Convert **bold**, `code`, and \n to styled elements
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\n)/g);
  return (
    <span className="whitespace-pre-wrap leading-relaxed">
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-bold text-white">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code key={i} className="bg-panther-950 text-cyan-300 font-mono text-xs px-1.5 py-0.5 rounded">
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part === '\n') {
          return <br key={i} />;
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

// ─── Typing Indicator ────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-flame-400 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

// ─── Message Bubble ──────────────────────────────────────────────────────────
function MessageBubble({ msg }) {
  const isBot = msg.from === 'bot';
  return (
    <div className={`flex items-end gap-2 mb-3 ${isBot ? 'justify-start' : 'justify-end'}`}>
      {isBot && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-flame-500 to-amber-500 flex items-center justify-center flex-shrink-0 shadow-flame-sm mb-0.5">
          <Bot className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      <div
        className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-md ${
          isBot
            ? 'bg-panther-800 border border-panther-700/80 text-gray-200 rounded-bl-none'
            : 'bg-gradient-to-br from-flame-600 to-flame-700 text-white rounded-br-none'
        }`}
      >
        <MessageText text={msg.text} />
        <div className={`text-[10px] mt-1 opacity-50 ${isBot ? 'text-gray-400' : 'text-white'}`}>
          {new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

// ─── Quick Reply Chip ─────────────────────────────────────────────────────────
function QuickReplyChip({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(label)}
      className="px-3 py-1.5 rounded-full text-[11px] font-rajdhani font-bold bg-panther-800 hover:bg-panther-700 border border-panther-600 hover:border-flame-500/60 text-gray-200 hover:text-white transition-all whitespace-nowrap shadow-sm"
    >
      {label}
    </button>
  );
}

// ─── Main ChatBot Component ───────────────────────────────────────────────────
export function ChatBot() {
  const { tournaments, slots, leaderboard } = useTournaments();
  const { user } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([INITIAL_BOT_MESSAGE]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false);
  const [isAIMode, setIsAIMode] = useState(AI_AVAILABLE);
  // Conversation history for AI context (OpenAI format)
  const conversationHistoryRef = useRef([]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to latest message
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen, scrollToBottom]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, isMinimized]);

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setUnreadCount(0);
    setHasOpenedOnce(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const handleMinimize = () => {
    setIsMinimized(true);
    setIsOpen(false);
  };

  const buildContext = () => {
    const tournament = tournaments?.[0] || null;
    // slots is a flat array with tournament_id on each slot
    const tournamentSlots = tournament
      ? (Array.isArray(slots) ? slots.filter(s => s.tournament_id === tournament.id) : [])
      : [];
    const tournamentLeaderboard = tournament
      ? (leaderboard?.filter(l => l.tournament_id === tournament.id) || [])
      : [];

    return {
      tournament,
      slots: tournamentSlots,
      leaderboard: tournamentLeaderboard.sort((a, b) => b.points - a.points),
      user,
    };
  };

  const sendMessage = useCallback(async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Add user message
    const userMsg = {
      id: `user-${Date.now()}`,
      from: 'user',
      text: trimmed,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Track in conversation history for AI
    conversationHistoryRef.current = [
      ...conversationHistoryRef.current,
      { role: 'user', content: trimmed },
    ];

    let response;

    if (isAIMode) {
      try {
        const context = buildContext();
        response = await generateAIResponse(trimmed, context, conversationHistoryRef.current);
        // Append assistant reply to history
        conversationHistoryRef.current = [
          ...conversationHistoryRef.current,
          { role: 'assistant', content: response.text },
        ];
        // Keep history within a reasonable window (last 16 entries)
        if (conversationHistoryRef.current.length > 16) {
          conversationHistoryRef.current = conversationHistoryRef.current.slice(-16);
        }
      } catch (err) {
        console.warn('[PantherBot] AI API failed, falling back to rule-based engine:', err.message);
        setIsAIMode(false);
        const context = buildContext();
        response = generateResponse(trimmed, context);
      }
    } else {
      // Simulate slight thinking delay for rule-based
      await new Promise(r => setTimeout(r, 600 + Math.random() * 600));
      const context = buildContext();
      response = generateResponse(trimmed, context);
    }

    const botMsg = {
      id: `bot-${Date.now()}`,
      from: 'bot',
      text: response.text,
      quickReplies: response.quickReplies || [],
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, botMsg]);
    setIsTyping(false);

    if (!isOpen) {
      setUnreadCount(prev => prev + 1);
    }
  }, [tournaments, slots, leaderboard, user, isOpen, isAIMode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickReply = (label) => {
    // Strip emoji prefix for cleaner intent matching
    const cleaned = label.replace(/^[^\w\s]+\s?/, '').trim();
    sendMessage(cleaned);
  };

  const latestBotMsg = [...messages].reverse().find(m => m.from === 'bot');
  const lastQuickReplies = latestBotMsg?.quickReplies || [];

  return (
    <>
      {/* ── Floating Chat Window ─────────────────────────────────────── */}
      {isOpen && !isMinimized && (
        <div
          className="fixed bottom-20 right-4 sm:right-6 z-50 w-[340px] sm:w-[380px] flex flex-col shadow-2xl rounded-2xl overflow-hidden border border-panther-700/80 animate-in slide-in-from-bottom-4 duration-300"
          style={{ maxHeight: '80vh' }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-panther-900 via-panther-850 to-panther-900 border-b border-panther-700 p-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-flame-500 via-orange-500 to-amber-500 flex items-center justify-center shadow-flame-sm">
                  <Bot className="w-4.5 h-4.5 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-panther-900" />
              </div>
              <div>
                <p className="font-orbitron font-black text-sm text-white leading-none">Panther Bot</p>
                <p className="text-[10px] font-rajdhani font-bold flex items-center gap-1 mt-0.5">
                  {isAIMode ? (
                    <>
                      <Zap className="w-2.5 h-2.5 text-amber-400" />
                      <span className="text-amber-400">AI Powered</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                      <span className="text-emerald-400">Panthers Esports Assistant</span>
                    </>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleMinimize}
                className="w-7 h-7 rounded-full bg-panther-800 hover:bg-panther-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                title="Minimize"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleClose}
                className="w-7 h-7 rounded-full bg-panther-800 hover:bg-red-800 flex items-center justify-center text-gray-400 hover:text-red-300 transition-colors"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto bg-panther-950/95 backdrop-blur-xl p-4 space-y-1 scrollbar-thin scrollbar-thumb-panther-700 scrollbar-track-transparent" style={{ minHeight: 0 }}>
            {messages.map(msg => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}

            {isTyping && (
              <div className="flex items-end gap-2 mb-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-flame-500 to-amber-500 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-panther-800 border border-panther-700/80 rounded-2xl rounded-bl-none px-2 py-1 shadow-md">
                  <TypingDots />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {lastQuickReplies.length > 0 && !isTyping && (
            <div className="bg-panther-900/95 border-t border-panther-800 px-3 py-2 flex gap-1.5 overflow-x-auto scrollbar-none flex-shrink-0">
              {lastQuickReplies.map((label, i) => (
                <QuickReplyChip key={i} label={label} onClick={handleQuickReply} />
              ))}
            </div>
          )}

          {/* Input Bar */}
          <form
            onSubmit={handleSubmit}
            className="bg-panther-900 border-t border-panther-800 p-3 flex items-center gap-2 flex-shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask me anything... 🔥"
              maxLength={300}
              className="flex-1 bg-panther-950 border border-panther-700 rounded-full px-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-flame-500 font-rajdhani font-semibold"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-flame-500 to-flame-600 hover:from-flame-400 hover:to-flame-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-white transition-all shadow-flame-sm flex-shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* ── Floating Action Button ───────────────────────────────────── */}
      <button
        onClick={isOpen && !isMinimized ? handleClose : handleOpen}
        className="fixed bottom-4 right-4 sm:right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 group"
        style={{
          background: isOpen && !isMinimized
            ? 'linear-gradient(135deg, #ef4444, #b91c1c)'
            : 'linear-gradient(135deg, #FF4D00, #FF8C00)',
          boxShadow: isOpen && !isMinimized
            ? '0 0 24px rgba(239,68,68,0.5)'
            : '0 0 24px rgba(255,77,0,0.6)',
        }}
        title="Panther Bot — Your Esports Assistant"
        aria-label="Open chat assistant"
      >
        {/* Pulsing ring when closed */}
        {(!isOpen || isMinimized) && (
          <span className="absolute inset-0 rounded-full bg-flame-500/40 animate-ping" />
        )}

        {/* Icon */}
        {isOpen && !isMinimized ? (
          <ChevronDown className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
        )}

        {/* Unread Badge */}
        {(!isOpen || isMinimized) && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-panther-950 flex items-center justify-center text-[10px] font-black text-panther-950">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    </>
  );
}
