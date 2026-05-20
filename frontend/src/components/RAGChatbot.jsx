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
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{renderMessageContent(msg.content)}</div>
              {msg.sources && msg.sources.length > 0 && (
                <div className="source-container">
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    Sources (Top {msg.sources.length}):
                  </div>
                  {msg.sources.map((src, idx) => (
                    <details key={idx} style={{ marginBottom: '0.4rem', border: '1px solid var(--border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                      <summary style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0.5rem', background: 'var(--bg-main)', cursor: 'pointer', fontSize: '0.75rem', listStyle: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <FileText size={12} color="var(--chatbot-blue)" /> 
                          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{src.source}</span>
                        </div>
                        <span style={{ color: 'var(--brand-green)', fontWeight: 600 }}>{(src.score * 100).toFixed(1)}% match</span>
                      </summary>
                      <div style={{ padding: '0.5rem', fontSize: '0.7rem', color: 'var(--text-secondary)', background: 'white', lineHeight: '1.4', borderTop: '1px solid var(--border-subtle)', maxHeight: '120px', overflowY: 'auto' }}>
                        {src.content || "No text content available for this chunk."}
                      </div>
                    </details>
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

const parseBoldText = (text) => {
  if (!text) return "";
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, i) => {
    return i % 2 === 1 ? <strong key={i} style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{part}</strong> : part;
  });
};

const parseListItems = (text) => {
  if (!text) return [];
  const lines = text.split('\n');
  const items = [];
  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;
    
    // Is it a numbered list item?
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      items.push({ type: 'number', val: numMatch[1], content: numMatch[2] });
    } else {
      // Is it a bullet list item?
      const bulletMatch = trimmed.match(/^[-*•]\s+(.*)/);
      if (bulletMatch) {
        items.push({ type: 'bullet', val: '•', content: bulletMatch[1] });
      } else {
        // Normal line
        items.push({ type: 'paragraph', val: '', content: trimmed });
      }
    }
  });
  return items;
};

const parseStructuredResponse = (content) => {
  if (!content) return null;
  
  // Look for the exact sections or variants (case-insensitive, emoji-independent)
  const summaryHeader = /###\s*(?:📋)?\s*Summary/i;
  const procedureHeader = /###\s*(?:⚙️)?\s*Technical\s*Troubleshooting\s*Procedure/i;
  const safetyHeader = /###\s*(?:⚠️)?\s*Critical\s*Safety\s*Precautions/i;
  
  const hasSummary = summaryHeader.test(content) || content.includes("Summary");
  const hasProcedure = procedureHeader.test(content) || content.includes("Troubleshooting Procedure");
  const hasSafety = safetyHeader.test(content) || content.includes("Safety Precautions");
  
  if (!hasSummary || !hasProcedure || !hasSafety) {
    return null;
  }
  
  // Extract text between headers using regex matches
  const summaryMatch = content.match(/###\s*(?:📋)?\s*Summary([\s\S]*?)(?=###\s*(?:⚙️)?\s*Technical|###\s*(?:⚠️)?\s*Critical|$)/i);
  const procedureMatch = content.match(/###\s*(?:⚙️)?\s*Technical\s*Troubleshooting\s*Procedure([\s\S]*?)(?=###\s*(?:📋)?\s*Summary|###\s*(?:⚠️)?\s*Critical|$)/i);
  const safetyMatch = content.match(/###\s*(?:⚠️)?\s*Critical\s*Safety\s*Precautions([\s\S]*?)(?=###\s*(?:📋)?\s*Summary|###\s*(?:⚙️)?\s*Technical|$)/i);
  
  return {
    summary: summaryMatch ? summaryMatch[1].trim() : "",
    procedure: procedureMatch ? procedureMatch[1].trim() : "",
    safety: safetyMatch ? safetyMatch[1].trim() : ""
  };
};

const renderProcedureTimeline = (text) => {
  const items = parseListItems(text);
  if (items.length === 0) return <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No procedures specified in context.</p>;

  return (
    <div className="procedure-timeline" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', paddingLeft: '0.25rem', marginTop: '0.4rem' }}>
      {items.map((item, idx) => {
        if (item.type === 'number') {
          return (
            <div key={idx} style={{ display: 'flex', gap: '0.65rem', position: 'relative' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ 
                  width: '18px', 
                  height: '18px', 
                  borderRadius: '50%', 
                  background: 'var(--chatbot-blue)', 
                  color: 'white', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '0.65rem', 
                  fontWeight: 800 
                }}>
                  {item.val}
                </div>
                {idx < items.length - 1 && (
                  <div style={{ width: '1.5px', flex: 1, background: 'rgba(37, 99, 235, 0.15)', margin: '3px 0' }} />
                )}
              </div>
              <div style={{ flex: 1, fontSize: '0.82rem', lineHeight: '1.4', color: 'var(--text-primary)', paddingBottom: '0.2rem' }}>
                {parseBoldText(item.content)}
              </div>
            </div>
          );
        }
        
        return (
          <div key={idx} style={{ display: 'flex', gap: '0.4rem', marginLeft: '1.5rem', fontSize: '0.82rem', lineHeight: '1.4', color: 'var(--text-primary)' }}>
            <span style={{ color: 'var(--chatbot-blue)' }}>•</span>
            <span style={{ flex: 1 }}>{parseBoldText(item.content)}</span>
          </div>
        );
      })}
    </div>
  );
};

const renderSafetyBullets = (text) => {
  const items = parseListItems(text);
  if (items.length === 0) return <p style={{ fontSize: '0.8rem', color: '#991b1b' }}>No safety precautions specified.</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.4rem' }}>
      {items.map((item, idx) => (
        <div key={idx} style={{ display: 'flex', gap: '0.4rem', fontSize: '0.82rem', lineHeight: '1.4', color: '#991b1b' }}>
          <span style={{ color: '#dc2626', fontWeight: 900 }}>•</span>
          <span style={{ flex: 1, fontWeight: 500 }}>{parseBoldText(item.content)}</span>
        </div>
      ))}
    </div>
  );
};

const renderFallbackContent = (content) => {
  const lines = content.split('\n');
  
  return lines.map((line, idx) => {
    const trimmed = line.trim();
    
    // Render H4 headers starting with '###'
    if (trimmed.startsWith('###')) {
      const headerText = trimmed.replace(/^###\s*/, '').trim();
      let color = 'var(--chatbot-blue)'; 
      let border = 'rgba(37, 99, 235, 0.15)';
      
      if (headerText.toLowerCase().includes('safety') || headerText.includes('⚠️')) {
        color = '#dc2626'; // emergency red!
        border = 'rgba(220, 38, 38, 0.15)';
      } else if (headerText.toLowerCase().includes('troubleshooting') || headerText.includes('⚙️')) {
        color = '#111827'; // absolute black/charcoal
        border = '#e5e7eb';
      }
      
      return (
        <h4 
          key={idx} 
          style={{ 
            fontSize: '0.85rem', 
            fontWeight: 700, 
            color: color, 
            marginTop: '1rem', 
            marginBottom: '0.4rem', 
            borderBottom: `1px solid ${border}`,
            paddingBottom: '0.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          {headerText}
        </h4>
      );
    }
    
    // Render bullet points starting with '-' or '*'
    if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
      const bulletText = trimmed.replace(/^[-*]\s*/, '').trim();
      return (
        <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginLeft: '0.5rem', marginBottom: '0.3rem', fontSize: '0.85rem', lineHeight: '1.4', color: 'var(--text-primary)' }}>
          <span style={{ color: 'var(--chatbot-blue)' }}>•</span>
          <span style={{ flex: 1 }}>{parseBoldText(bulletText)}</span>
        </div>
      );
    }
    
    // Render numbered lists starting with digits (e.g. '1. ')
    if (/^\d+\.\s+/.test(trimmed)) {
      const numText = trimmed.replace(/^\d+\.\s+/, '').trim();
      const numMatch = trimmed.match(/^(\d+)\./);
      const num = numMatch ? numMatch[1] : '';
      return (
        <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginLeft: '0.5rem', marginBottom: '0.3rem', fontSize: '0.85rem', lineHeight: '1.4', color: 'var(--text-primary)' }}>
          <span style={{ fontWeight: 700, color: 'var(--chatbot-blue)' }}>{num}.</span>
          <span style={{ flex: 1 }}>{parseBoldText(numText)}</span>
        </div>
      );
    }
    
    // Render empty lines
    if (trimmed === '') {
      return <div key={idx} style={{ height: '0.4rem' }} />;
    }
    
    // Render normal paragraph lines
    return (
      <p key={idx} style={{ fontSize: '0.85rem', lineHeight: '1.4', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
        {parseBoldText(line)}
      </p>
    );
  });
};

const renderMessageContent = (content) => {
  if (!content) return null;

  const structured = parseStructuredResponse(content);
  if (structured) {
    return (
      <div className="structured-rag-response" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', width: '100%' }}>
        {/* Render Action Plan Header */}
        <div className="action-plan-header" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(37, 99, 235, 0.1)',
          paddingBottom: '0.4rem',
          marginBottom: '0.15rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--chatbot-blue)' }}>
            <span style={{ fontSize: '0.9rem' }}>🔧</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Maintenance Action Plan</span>
          </div>
          <span style={{
            fontSize: '0.6rem',
            background: 'rgba(34, 197, 94, 0.1)',
            color: '#16a34a',
            padding: '0.15rem 0.4rem',
            borderRadius: '9999px',
            fontWeight: 700,
            letterSpacing: '0.02em',
            textTransform: 'uppercase'
          }}>
            Grounded RAG
          </span>
        </div>

        {/* 1. Summary Block */}
        {structured.summary && (
          <div className="rag-block summary-block" style={{
            background: 'rgba(37, 99, 235, 0.03)',
            borderLeft: '3px solid var(--chatbot-blue)',
            borderRadius: '4px 8px 8px 4px',
            padding: '0.65rem 0.85rem',
            border: '1px solid rgba(37, 99, 235, 0.08)',
            borderLeftWidth: '3px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, fontSize: '0.8rem', color: 'var(--chatbot-blue)', marginBottom: '0.3rem' }}>
              <span>📋</span> <span>Summary</span>
            </div>
            <div style={{ fontSize: '0.82rem', lineHeight: '1.45', color: 'var(--text-primary)' }}>
              {parseBoldText(structured.summary)}
            </div>
          </div>
        )}

        {/* 2. Technical Troubleshooting Block */}
        {structured.procedure && (
          <div className="rag-block procedure-block" style={{ background: 'transparent', padding: '0 0.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, fontSize: '0.8rem', color: '#111827', marginBottom: '0.4rem', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '0.25rem' }}>
              <span>⚙️</span> <span>Troubleshooting Procedure</span>
            </div>
            {renderProcedureTimeline(structured.procedure)}
          </div>
        )}

        {/* 3. Safety Block */}
        {structured.safety && (
          <div className="rag-block safety-block" style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderLeft: '4px solid #dc2626',
            borderRadius: '6px',
            padding: '0.65rem 0.85rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, fontSize: '0.8rem', color: '#dc2626', marginBottom: '0.35rem' }}>
              <span>⚠️</span> <span>Critical Safety Precautions</span>
            </div>
            {renderSafetyBullets(structured.safety)}
          </div>
        )}
      </div>
    );
  }

  // Fallback if not structured:
  return renderFallbackContent(content);
};

