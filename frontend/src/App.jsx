import React, { useState } from 'react';
import MaintainerDashboard from './components/MaintainerDashboard';
import RAGChatbot from './components/RAGChatbot';
import { 
  Wrench, Home, Settings, Bell, Search, Bot, ChevronDown, LogOut 
} from 'lucide-react';

function App() {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatQuery, setChatQuery] = useState("");
  const [triggerQuerySend, setTriggerQuerySend] = useState(false);

  const triggerDiagnostics = (query) => {
    setChatQuery(query);
    setTriggerQuerySend(true);
    setChatOpen(true);
  };

  return (
    <div className="app-container">
      {/* Fixed Left Sidebar */}
      <aside className="sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Sidebar Header Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', padding: '0.5rem 0.25rem' }}>
          <div style={{ background: '#000000', padding: '0.45rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wrench size={18} color="white" />
          </div>
          <div>
            <h1 className="title" style={{ fontSize: '1.05rem', color: '#111827', fontWeight: 700, lineHeight: '1.1' }}>Maintainer AI</h1>
            <p className="subtitle" style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: 500, marginTop: '0.1rem' }}>Intelligent Maintenance Agent</p>
          </div>
        </div>

        {/* Navigation Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div className="nav-item active">
            <Home size={18} />
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Dashboard</span>
          </div>
          <div className="nav-item">
            <Settings size={18} />
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Settings</span>
          </div>
        </div>

        {/* Sidebar Bottom Nav with Logout */}
        <div className="nav-bottom">
          <div className="nav-item" style={{ marginBottom: 0 }}>
            <LogOut size={18} />
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Logout</span>
          </div>
        </div>
      </aside>

      {/* Scrollable Main Content Dashboard */}
      <main className="main-content">
        <header className="top-header" style={{ height: '64px', borderBottom: '1px solid #e5e7eb' }}>
          <div className="search-wrapper">
            <Search size={18} style={{ color: '#9ca3af' }} />
            <input type="text" className="search-bar" placeholder="Search complaints, tickets..." style={{ background: '#f9fafb' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={20} style={{ color: '#111827' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#000000', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 600 }}>A</div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111827' }}>Admin</span>
              <ChevronDown size={14} style={{ color: '#6b7280' }} />
            </div>
          </div>
        </header>

        <MaintainerDashboard triggerDiagnostics={triggerDiagnostics} />

        {/* Sliding Chatbot Overlay */}
        <RAGChatbot 
          isOpen={chatOpen} 
          onClose={() => setChatOpen(false)} 
          externalQuery={chatQuery}
          triggerSend={triggerQuerySend}
          onQueryTriggered={() => {
            setTriggerQuerySend(false);
            setChatQuery("");
          }}
        />
      </main>

      {/* Floating Action Button (FAB) */}
      <button className="fab" onClick={() => setChatOpen(!chatOpen)}>
        <Bot size={28} />
      </button>
    </div>
  );
}

export default App;
