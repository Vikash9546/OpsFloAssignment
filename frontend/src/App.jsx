import React, { useState } from 'react';
import MaintainerDashboard from './components/MaintainerDashboard';
import RAGChatbot from './components/RAGChatbot';
import { 
  Home, Settings, Bot, LogOut 
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
        <div className="logo-container">
          <div className="logo-icon-box">
            <div className="css-wrench">
              <div className="wrench-handle"></div>
              <div className="wrench-head"></div>
              <div className="wrench-jaw-cut"></div>
              <div className="wrench-tail"></div>
            </div>
          </div>
          <div>
            <h1 className="logo-title">Maintainer AI</h1>
            <p className="logo-subtitle">Intelligent Maintenance Agent</p>
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
