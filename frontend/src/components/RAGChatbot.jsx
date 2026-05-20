import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, FileText } from 'lucide-react';

export default function RAGChatbot({ isOpen, onClose, externalQuery, triggerSend, onQueryTriggered }) {
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I am your RAG AI Assistant. Ask me any technical maintenance questions based on your embedded knowledge base.' }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const quickChips = [
    { label: "🛠️ Safety Protocols", query: "Suggest standard safety protocols and lock-out tag-out checklist for heavy machinery servicing." },
    { label: "⚡ Electrical Standards", query: "What are the standard safety practices for inspecting electrical components and control panels?" },
    { label: "📋 General Checklist", query: "Show a standard preventive maintenance operation guide and checklist for rotating industrial equipment." }
  ];

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if(scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Handle external query triggers
  useEffect(() => {
    if (triggerSend && externalQuery) {
      const runExternalQuery = async () => {
        const queryText = externalQuery;
        // Reset triggers in parent first to avoid infinite re-run loops
        onQueryTriggered();
        
        setMessages(prev => [...prev, { role: 'user', content: queryText }]);
        setLoading(true);

        try {
          const res = await fetch("http://127.0.0.1:8001/ask", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: queryText })
          });
          const data = await res.json();
          
          setMessages(prev => [...prev, { 
            role: 'ai', 
            content: data.answer || "No text was returned by the LLM.",
            sources: data.retrieved_chunks || []
          }]);
        } catch (e) {
          setMessages(prev => [...prev, { role: 'ai', content: "Network error connecting to the RAG backend on port 8001. Please ensure the Python server is actively running." }]);
        }
        setLoading(false);
      };

      runExternalQuery();
    }
  }, [triggerSend, externalQuery, onQueryTriggered]);

  const handleSend = async () => {
    if(!input.trim()) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8001/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMsg })
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: data.answer || "No text was returned by the LLM.",
        sources: data.retrieved_chunks || []
      }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', content: "Network error connecting to the RAG backend on port 8001. Please ensure the Python server is actively running." }]);
    }
    setLoading(false);
  };

  return (
    <div className={`chatbot-overlay glass-panel ${isOpen ? 'open' : ''}`}>
      {/* Header */}
      <div className="chat-header" style={{ background: 'transparent' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'var(--chatbot-blue-light)', padding: '0.6rem', borderRadius: '50%', color: 'var(--chatbot-blue)' }}>
            <Bot size={24} />
          </div>
          <div>
            <h3 className="title" style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>RAG AI Assistant</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-green)' }}>
              <div className="pulse-status"></div> Online
            </div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
          <X size={22} />
        </button>
      </div>

      {/* Message History */}
      <div className="chat-body" ref={scrollRef}>
        {messages.map((msg, i) => (
          <div key={i} className={`bubble-row ${msg.role}`}>
            <div className={`bubble ${msg.role}`}>
              <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
              {msg.sources && msg.sources.length > 0 && (
                <div className="source-container">
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    Sources (Top {msg.sources.length}):
                  </div>
                  {msg.sources.map((src, idx) => (
                    <div key={idx} className="source-item">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <FileText size={12} color="var(--chatbot-blue)" /> 
                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{src.source}</span>
                      </div>
                      <span style={{ color: 'var(--brand-green)', fontWeight: 600 }}>{(src.score * 100).toFixed(1)}% match</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="bubble-row ai">
            <div className="bubble ai glass-panel" style={{ padding: '0.75rem 1rem' }}>
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggestion Chips */}
      <div className="chips-container" style={{ padding: '0 1.5rem', marginBottom: '0.5rem' }}>
        {quickChips.map((chip, idx) => (
          <button 
            key={idx} 
            className="chip"
            onClick={() => setInput(chip.query)}
            disabled={loading}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="chat-footer" style={{ background: 'transparent' }}>
        <textarea 
          className="chat-input"
          placeholder="Ask anything about maintenance..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
        />
        <button className="send-btn" onClick={handleSend} disabled={loading || !input.trim()}>
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
