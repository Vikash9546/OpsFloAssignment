import React, { useState } from 'react';
import MaintainerDashboard from './components/MaintainerDashboard';
import RAGChatbot from './components/RAGChatbot';
import { 
  Wrench, Home, Settings, Bell, Search, Bot, ChevronDown 
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
      <aside className="sidebar">
        <div className="flex items-center gap-3 mb-8" style={{ padding: '0.5rem' }}>
          <div style={{ background: 'var(--brand-purple)', padding: '0.4rem', borderRadius: '8px' }}>
            <Wrench size={20} color="white" />
          </div>
          <div>
            <h1 className="title" style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>Maintainer AI</h1>
            <p className="subtitle" style={{ fontSize: '0.7rem' }}>Intelligent Agent</p>
          </div>
        </div>

        <div className="nav-item active"><Home size={18} /> Dashboard</div>

        <div className="nav-bottom">
          <div className="nav-item"><Settings size={18} /> Settings</div>
        </div>
      </aside>

      {/* Scrollable Main Content Dashboard */}
      <main className="main-content">
        <header className="top-header">
          <div className="search-wrapper">
            <Search size={18} />
            <input type="text" className="search-bar" placeholder="Search complaints, tickets..." />
          </div>
          <div className="flex items-center gap-5">
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <Bell size={20} className="text-gray" />
              <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%' }}></div>
            </div>
            <div className="flex items-center gap-3 font-semibold text-sm cursor-pointer ml-2">
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--brand-purple)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>A</div>
              Admin
              <ChevronDown size={16} className="text-gray" style={{ marginLeft: '-4px' }} />
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
