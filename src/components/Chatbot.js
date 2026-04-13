'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Chatbot.module.css';

const KNOWLEDGE_BASE = [
  {
    patterns: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'sup'],
    response: "Hey there! 👋 I'm HiveBot, your campus assistant. I can help you navigate StudentHive, find resources, or answer questions. What would you like to do?",
    suggestions: ['Book a lab', 'Browse marketplace', 'Report lost item'],
  },
  {
    patterns: ['book', 'booking', 'reserve', 'lab', 'auditorium', 'hall', 'room', 'schedule'],
    response: "📅 **Resource Booking**\n\nYou can book labs, auditoriums, and conference rooms from our Booking page. We have:\n\n• 5 Computer/Science Labs\n• Main & Mini Auditoriums\n• Conference Hall\n\n→ [Go to Booking](/booking)",
    suggestions: ['What labs are available?', 'How to cancel booking?', 'Dashboard'],
    link: '/booking',
  },
  {
    patterns: ['marketplace', 'buy', 'sell', 'list', 'item', 'textbook', 'product', 'shop', 'trade'],
    response: "🛒 **Marketplace**\n\nOur peer-to-peer marketplace lets you buy and sell items with fellow students. You can list textbooks, electronics, supplies and more!\n\n→ [Go to Marketplace](/marketplace)",
    suggestions: ['How to list an item?', 'Book a lab', 'Lost & Found'],
    link: '/marketplace',
  },
  {
    patterns: ['lost', 'found', 'missing', 'recover', 'lost and found', 'lost item'],
    response: "🔍 **Lost & Found**\n\nLost something on campus? Our Lost & Found system helps you report missing items and find recovered ones. Browse current listings or submit a report.\n\n→ [Go to Lost & Found](/lost-found)",
    suggestions: ['Report lost item', 'Dashboard', 'Marketplace'],
    link: '/lost-found',
  },
  {
    patterns: ['dashboard', 'overview', 'my page', 'home page', 'status'],
    response: "📊 **Dashboard**\n\nYour dashboard shows:\n• Resource availability in real-time\n• Your upcoming bookings\n• Recent activity across the platform\n• Quick action shortcuts\n\n→ [Go to Dashboard](/dashboard)",
    suggestions: ['Book a lab', 'Marketplace', 'About StudentHive'],
    link: '/dashboard',
  },
  {
    patterns: ['about', 'what is', 'info', 'information', 'learn more', 'studenthive', 'platform'],
    response: "ℹ️ **About StudentHive**\n\nStudentHive is a unified campus ecosystem that brings together resource booking, a student marketplace, and lost & found — all in one beautiful platform.\n\n→ [Learn More](/about)",
    suggestions: ['Dashboard', 'Book a lab', 'Marketplace'],
    link: '/about',
  },
  {
    patterns: ['login', 'sign in', 'sign up', 'register', 'account', 'otp'],
    response: "🔐 **Sign In**\n\nTo sign in, enter your full name and university email. We'll send you a 6-digit OTP code to verify your identity — no password needed!\n\n→ [Go to Sign In](/login)",
    suggestions: ['Dashboard', 'About StudentHive'],
    link: '/login',
  },
  {
    patterns: ['available', 'open', 'free', 'which lab', 'what lab'],
    response: "🧪 **Currently Available:**\n\n• Computer Lab A (40 seats)\n• Physics Lab (30 seats)\n• Electronics Lab (30 seats)\n• Mini Auditorium (150 seats)\n• Conference Hall (80 seats)\n\nBook any of these from the Booking page!\n\n→ [Book Now](/booking)",
    suggestions: ['Book a lab', 'Dashboard'],
    link: '/booking',
  },
  {
    patterns: ['cancel', 'cancel booking', 'remove booking'],
    response: "❌ **Cancel a Booking**\n\nYou can manage and cancel your bookings from the Dashboard. Go to 'Your Bookings' section and you'll find options for each reservation.\n\n→ [Go to Dashboard](/dashboard)",
    suggestions: ['Dashboard', 'Book a lab'],
    link: '/dashboard',
  },
  {
    patterns: ['list item', 'sell item', 'how to list', 'post item', 'sell something'],
    response: "📦 **List an Item**\n\nTo sell an item on the marketplace:\n1. Go to the Marketplace page\n2. Click 'List New Item'\n3. Add a title, description, price, and condition\n4. Submit and wait for buyers!\n\n→ [Go to Marketplace](/marketplace)",
    suggestions: ['Marketplace', 'Dashboard'],
    link: '/marketplace',
  },
  {
    patterns: ['report', 'report lost', 'lost something', 'i lost'],
    response: "📝 **Report a Lost Item**\n\nTo report a lost item:\n1. Go to the Lost & Found page\n2. Click 'Report Lost Item'\n3. Describe the item, location last seen, and date\n4. We'll notify you if someone finds it!\n\n→ [Go to Lost & Found](/lost-found)",
    suggestions: ['Lost & Found', 'Dashboard'],
    link: '/lost-found',
  },
  {
    patterns: ['help', 'support', 'what can you do', 'features', 'guide', 'how to use'],
    response: "🤖 **Here's what I can help with:**\n\n📅 **Booking** — Reserve labs, auditoriums & halls\n🛒 **Marketplace** — Buy & sell student items\n🔍 **Lost & Found** — Report or find lost items\n📊 **Dashboard** — View your activity & stats\nℹ️ **About** — Learn about the platform\n\nJust ask me anything!",
    suggestions: ['Book a lab', 'Marketplace', 'Lost & Found'],
  },
  {
    patterns: ['thank', 'thanks', 'awesome', 'great', 'perfect', 'cool'],
    response: "You're welcome! 😊 Happy to help. Let me know if there's anything else you need!",
    suggestions: ['Dashboard', 'Book a lab', 'Marketplace'],
  },
  {
    patterns: ['navigate', 'go to', 'take me', 'open', 'show me', 'where', 'direction'],
    response: "🧭 **Navigation Help**\n\nHere are the main sections:\n\n• [🏠 Home](/)\n• [📊 Dashboard](/dashboard)\n• [📅 Booking](/booking)\n• [🛒 Marketplace](/marketplace)\n• [🔍 Lost & Found](/lost-found)\n• [ℹ️ About](/about)\n\nTell me where you'd like to go!",
    suggestions: ['Dashboard', 'Booking', 'Marketplace'],
  },
];

const FALLBACK = {
  response: "🤔 I'm not sure about that one. Try asking me about **booking**, **marketplace**, **lost & found**, or say **help** to see everything I can do!",
  suggestions: ['Help', 'Book a lab', 'Marketplace', 'Lost & Found'],
};

function findBestResponse(input) {
  const normalized = input.toLowerCase().trim();
  let bestMatch = null;
  let bestScore = 0;

  for (const entry of KNOWLEDGE_BASE) {
    for (const pattern of entry.patterns) {
      if (normalized.includes(pattern)) {
        const score = pattern.length;
        if (score > bestScore) {
          bestScore = score;
          bestMatch = entry;
        }
      }
    }
  }

  return bestMatch || FALLBACK;
}

export default function Chatbot() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'bot',
      text: "Hi! 👋 I'm **HiveBot**, your campus assistant. Ask me anything about StudentHive or use the quick options below!",
      suggestions: ['Help', 'Book a lab', 'Marketplace', 'Lost & Found'],
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSend = useCallback((text) => {
    const trimmed = (text || input).trim();
    if (!trimmed) return;

    const userMsg = { id: Date.now(), role: 'user', text: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const match = findBestResponse(trimmed);
      const botMsg = {
        id: Date.now() + 1,
        role: 'bot',
        text: match.response,
        suggestions: match.suggestions,
        link: match.link,
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 600 + Math.random() * 400);
  }, [input]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleLinkClick = (href) => {
    router.push(href);
    setIsOpen(false);
  };

  // Render markdown-like text (bold + links)
  const renderText = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|\n)/g);
    return parts.map((part, i) => {
      if (part === '\n') return <br key={i} />;
      const boldMatch = part.match(/^\*\*(.+)\*\*$/);
      if (boldMatch) return <strong key={i}>{boldMatch[1]}</strong>;
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        return (
          <button key={i} className={styles.inlineLink} onClick={() => handleLinkClick(linkMatch[2])}>
            {linkMatch[1]}
          </button>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        className={`${styles.fab} ${isOpen ? styles.fabOpen : ''}`}
        onClick={() => setIsOpen(prev => !prev)}
        aria-label={isOpen ? 'Close chat' : 'Open chat assistant'}
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
        )}
        {!isOpen && <span className={styles.fabPulse} />}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelHeaderLeft}>
              <div className={styles.botAvatar}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8" /><rect x="2" y="8" width="20" height="12" rx="2" /><path d="M6 12h.01" /><path d="M18 12h.01" /><path d="M9 16h6" /></svg>
              </div>
              <div>
                <span className={styles.botName}>HiveBot</span>
                <span className={styles.botStatus}>
                  <span className={styles.statusDot} />
                  Online
                </span>
              </div>
            </div>
            <button className={styles.closeBtn} onClick={() => setIsOpen(false)} aria-label="Close chat">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>

          <div className={styles.messages}>
            {messages.map(msg => (
              <div key={msg.id} className={`${styles.message} ${styles[msg.role]}`}>
                {msg.role === 'bot' && (
                  <div className={styles.msgAvatar}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8" /><rect x="2" y="8" width="20" height="12" rx="2" /><path d="M6 12h.01" /><path d="M18 12h.01" /><path d="M9 16h6" /></svg>
                  </div>
                )}
                <div className={styles.msgBubble}>
                  <div className={styles.msgText}>{renderText(msg.text)}</div>
                  {msg.suggestions && (
                    <div className={styles.suggestions}>
                      {msg.suggestions.map((s, i) => (
                        <button key={i} className={styles.suggestionChip} onClick={() => handleSend(s)}>
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className={`${styles.message} ${styles.bot}`}>
                <div className={styles.msgAvatar}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8" /><rect x="2" y="8" width="20" height="12" rx="2" /><path d="M6 12h.01" /><path d="M18 12h.01" /><path d="M9 16h6" /></svg>
                </div>
                <div className={`${styles.msgBubble} ${styles.typingBubble}`}>
                  <div className={styles.typingDots}>
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.inputArea}>
            <input
              ref={inputRef}
              type="text"
              className={styles.chatInput}
              placeholder="Ask me anything..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              className={styles.sendBtn}
              onClick={() => handleSend()}
              disabled={!input.trim()}
              aria-label="Send message"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
