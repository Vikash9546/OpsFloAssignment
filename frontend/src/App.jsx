import React, { useState } from 'react';
import MaintainerDashboard from './components/MaintainerDashboard';
import RAGChatbot from './components/RAGChatbot';
import { 
  Home, Bot, FileText 
} from 'lucide-react';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
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
        <div className="logo-container-vertical">
          <div className="logo-emblem-box">
            <div className="emblem-shape shape-1"></div>
            <div className="emblem-shape shape-2"></div>
            <div className="emblem-shape shape-3"></div>
            <div className="emblem-shape shape-4"></div>
            <div className="emblem-m">M</div>
          </div>
          <h1 className="logo-title-premium">Maintainer AI</h1>
          <p className="logo-subtitle-premium">Intelligent Maintenance Agent</p>
        </div>

        {/* Navigation Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
          <div 
            className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentPage('dashboard')}
          >
            <Home size={18} />
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Dashboard</span>
          </div>
          <div 
            className={`nav-item ${currentPage === 'complaints' ? 'active' : ''}`}
            onClick={() => setCurrentPage('complaints')}
          >
            <FileText size={18} />
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Complaints</span>
          </div>
        </div>
      </aside>

      {/* Scrollable Main Content Dashboard */}
      <main className="main-content">
        <MaintainerDashboard 
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          triggerDiagnostics={triggerDiagnostics} 
        />

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
