import React, { useState, useEffect } from 'react';
import { 
  FileText, AlertTriangle, Wrench, CheckCircle2, Send, X, HelpCircle, Filter, Pencil, MoreVertical 
} from 'lucide-react';

export default function MaintainerDashboard({ triggerDiagnostics }) {
  const [tickets, setTickets] = useState([]);
  const [complaint, setComplaint] = useState("");
  const [loading, setLoading] = useState(false);
  const [localStatuses, setLocalStatuses] = useState({});
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);

  const fetchTickets = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/complaints");
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.complaints || []);
      setTickets(list);
      
      // Initialize local statuses from backend or default to "New"
      setLocalStatuses(prev => {
        const next = { ...prev };
        list.forEach(t => {
          if (!next[t.ticket_id]) {
            next[t.ticket_id] = t.status || "New";
          }
        });
        return next;
      });
    } catch (e) {
      console.error("Failed to fetch tickets:", e);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSubmit = async () => {
    if(!complaint.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complaint: complaint })
      });
      if (res.ok) {
        setComplaint("");
        await fetchTickets();
      }
    } catch (e) {
      console.error("Failed to submit complaint:", e);
    }
    setLoading(false);
  };

  // Derive Dynamic Metrics from tickets & localStatuses
  const totalComplaints = tickets.length > 0 ? tickets.length : 3;
  const highPriority = tickets.length > 0 ? tickets.filter(t => t.priority === 'High').length : 26;
  const inProgress = tickets.length > 0 ? tickets.filter(t => localStatuses[t.ticket_id] === 'In Progress').length : 52;
  const resolved = tickets.length > 0 ? tickets.filter(t => localStatuses[t.ticket_id] === 'Resolved').length : 50;

  // Filter tickets based on activeFilter
  const filteredTickets = tickets.filter(t => {
    if (!activeFilter) return true;
    if (activeFilter.type === 'priority') {
      return t.priority === activeFilter.value;
    }
    if (activeFilter.type === 'status') {
      return localStatuses[t.ticket_id] === activeFilter.value;
    }
    return true;
  });

  // Mock tickets to display if database is currently empty
  const defaultTickets = [
    { ticket_id: "TKT-2026-0003", issue_type: "Electrical", priority: "Low", created_at: "2026-05-20T15:35:59Z", summary: "Light flickering and socket issue.", original_complaint: "The lights in the control room are flickering constantly." },
    { ticket_id: "TKT-2026-0002", issue_type: "Mechanical", priority: "High", created_at: "2026-05-20T15:27:44Z", summary: "Compressor generating excessive smoke.", original_complaint: "The main compressor is heating up rapidly and emitting dark smoke." },
    { ticket_id: "TKT-2026-0001", issue_type: "Mechanical", priority: "High", created_at: "2026-05-20T15:27:26Z", summary: "Conveyor belt alignment failure.", original_complaint: "The primary conveyor belt has slipped off its roller track." }
  ];

  const ticketsToRender = tickets.length > 0 ? filteredTickets : defaultTickets.filter(t => {
    if (!activeFilter) return true;
    if (activeFilter.type === 'priority') {
      return t.priority === activeFilter.value;
    }
    if (activeFilter.type === 'status') {
      return (t.status || "Resolved") === activeFilter.value;
    }
    return true;
  });

  const getIssueTypeIcon = (type) => {
    const t = type?.toLowerCase() || '';
    if (t.includes('electrical')) return '⚡';
    if (t.includes('mechanical')) return '⚙️';
    if (t.includes('plumbing')) return '💧';
    return '🛠️';
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="dashboard-grid" style={{ gap: '1.25rem' }}>
      {/* Welcome Banner */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginBottom: '0.25rem' }}>
        <h2 className="title" style={{ fontSize: '1.5rem', color: '#111827', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Welcome back, Admin 👋
        </h2>
        <p className="subtitle" style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 500 }}>
          Monitor and manage maintenance complaints intelligently.
        </p>
      </div>

      {/* Horizontal Stats Row */}
      <div className="stats-row" style={{ gap: '1rem' }}>
        {/* Total Complaints */}
        <div 
          className="card card-interactive" 
          onClick={() => setActiveFilter(null)}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            padding: '1.25rem 1.5rem',
            borderRadius: '12px',
            border: activeFilter === null ? '1px solid #111827' : '1px solid #e5e7eb',
            background: '#ffffff'
          }}
        >
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', color: '#111827', flexShrink: 0 }}>
            <FileText size={20} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em' }}>Total Complaints</span>
            <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827', marginTop: '0.15rem', lineHeight: '1.1' }}>{totalComplaints}</span>
          </div>
        </div>
        
        {/* High Priority */}
        <div 
          className="card card-interactive" 
          onClick={() => setActiveFilter({ type: 'priority', value: 'High', label: 'High Priority' })}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            padding: '1.25rem 1.5rem',
            borderRadius: '12px',
            border: activeFilter?.type === 'priority' && activeFilter?.value === 'High' ? '1px solid #111827' : '1px solid #e5e7eb',
            background: '#ffffff'
          }}
        >
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', color: '#111827', flexShrink: 0 }}>
            <AlertTriangle size={20} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em' }}>High Priority</span>
            <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827', marginTop: '0.15rem', lineHeight: '1.1' }}>{highPriority}</span>
          </div>
        </div>

        {/* In Progress */}
        <div 
          className="card card-interactive" 
          onClick={() => setActiveFilter({ type: 'status', value: 'In Progress', label: 'In Progress' })}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            padding: '1.25rem 1.5rem',
            borderRadius: '12px',
            border: activeFilter?.type === 'status' && activeFilter?.value === 'In Progress' ? '1px solid #111827' : '1px solid #e5e7eb',
            background: '#ffffff'
          }}
        >
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', color: '#111827', flexShrink: 0 }}>
            <Wrench size={20} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em' }}>In Progress</span>
            <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827', marginTop: '0.15rem', lineHeight: '1.1' }}>{inProgress}</span>
          </div>
        </div>

        {/* Resolved */}
        <div 
          className="card card-interactive" 
          onClick={() => setActiveFilter({ type: 'status', value: 'Resolved', label: 'Resolved' })}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            padding: '1.25rem 1.5rem',
            borderRadius: '12px',
            border: activeFilter?.type === 'status' && activeFilter?.value === 'Resolved' ? '1px solid #111827' : '1px solid #e5e7eb',
            background: '#ffffff'
          }}
        >
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', color: '#111827', flexShrink: 0 }}>
            <CheckCircle2 size={20} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em' }}>Resolved</span>
            <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827', marginTop: '0.15rem', lineHeight: '1.1' }}>{resolved}</span>
          </div>
        </div>
      </div>

      {/* Main Content Column Stack */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Submission Form Card */}
        <div className="card" style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', color: '#111827' }}>
              <Pencil size={16} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 className="title text-sm" style={{ fontSize: '0.9rem', color: '#111827', fontWeight: 700 }}>Submit New Ticket</h3>
              <p className="text-xs text-gray" style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>
                Describe the maintenance issue in detail so our AI agent can analyze and classify it.
              </p>
            </div>
          </div>
          <textarea 
            className="chat-input"
            style={{ 
              borderRadius: '8px', 
              minHeight: '90px', 
              padding: '1rem', 
              width: '100%', 
              margin: '1rem 0',
              border: '1px solid #e5e7eb',
              fontSize: '0.85rem',
              outline: 'none',
              background: '#ffffff',
              fontFamily: 'Inter, sans-serif'
            }}
            placeholder="Describe the maintenance issue... (e.g., 'The compressor is smoking')" 
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              style={{ 
                background: '#8BDFDD', 
                color: '#000000', 
                borderRadius: '6px', 
                cursor: 'pointer', 
                padding: '0.55rem 1.25rem', 
                border: 'none', 
                fontSize: '0.85rem', 
                fontWeight: 700, 
                display: 'flex', 
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.2s ease',
                opacity: (loading || !complaint.trim()) ? 0.6 : 1
              }} 
              onClick={handleSubmit} 
              disabled={loading || !complaint.trim()}
            >
              <Send size={14} /> {loading ? "Analyzing..." : "Submit to Agent"}
            </button>
          </div>
        </div>

        {/* Table Card */}
        <div className="card" style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', color: '#111827' }}>
                <FileText size={16} />
              </div>
              <h3 className="title text-sm" style={{ fontSize: '0.9rem', color: '#111827', fontWeight: 700 }}>Recent Complaints</h3>
            </div>
            <span 
              className="text-sm font-semibold" 
              onClick={() => setActiveFilter(null)}
              style={{ fontSize: '0.85rem', color: '#000000', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              View All <span style={{ fontSize: '0.95rem' }}>&rarr;</span>
            </span>
          </div>

          {/* Filter Banner */}
          {activeFilter && (
            <div className="filter-banner" style={{ marginBottom: '1.25rem', border: '1px solid #e5e7eb', background: '#f9fafb' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Filter size={14} /> Showing only <strong>{activeFilter.label}</strong> tickets
              </span>
              <button 
                onClick={() => setActiveFilter(null)}
                style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '0.25rem 0.6rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', color: '#000000' }}
              >
                Clear Filter
              </button>
            </div>
          )}

          <table style={{ width: '100%', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: '#6b7280', fontSize: '0.8rem' }}>Ticket ID</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: '#6b7280', fontSize: '0.8rem' }}>Issue Type</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: '#6b7280', fontSize: '0.8rem' }}>Priority</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: '#6b7280', fontSize: '0.8rem' }}>Status</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: '#6b7280', fontSize: '0.8rem' }}>Date & Time</th>
                <th style={{ padding: '0.75rem 0.5rem', width: '40px' }}></th>
              </tr>
            </thead>
            <tbody>
              {ticketsToRender.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>No matching tickets found.</td></tr>
              ) : ticketsToRender.map((t, i) => {
                const status = t.status || localStatuses[t.ticket_id] || "Resolved";
                let badgeClass = "badge-Resolved";
                if (status === "New") badgeClass = "badge-New";
                if (status === "In Progress") badgeClass = "badge-In_Progress";

                return (
                  <tr key={i} onClick={() => setSelectedTicket(t)} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td className="font-semibold" style={{ padding: '0.9rem 0.5rem', fontWeight: 600, color: '#111827' }}>{t.ticket_id}</td>
                    <td style={{ padding: '0.9rem 0.5rem', color: '#111827', fontWeight: 500 }}>
                      <span style={{ marginRight: '0.35rem' }}>{getIssueTypeIcon(t.issue_type)}</span>
                      {t.issue_type}
                    </td>
                    <td style={{ padding: '0.9rem 0.5rem' }}>
                      <span className={`badge badge-${t.priority}`}>{t.priority}</span>
                    </td>
                    <td style={{ padding: '0.9rem 0.5rem' }}>
                      <span className={`badge ${badgeClass}`}>{status}</span>
                    </td>
                    <td style={{ padding: '0.9rem 0.5rem', color: '#6b7280', fontSize: '0.8rem' }}>
                      {formatDate(t.created_at)}
                    </td>
                    <td style={{ padding: '0.9rem 0.5rem', textAlign: 'center', color: '#9ca3af' }}>
                      <MoreVertical size={16} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Slide-Over Drawer */}
      <div className={`detail-drawer ${selectedTicket ? 'open' : ''}`}>
        {selectedTicket && (
          <>
            <div className="drawer-header">
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: 700, letterSpacing: '0.05em' }}>TICKET DETAILS</span>
                <h3 className="title" style={{ fontSize: '1.15rem', color: '#111827' }}>{selectedTicket.ticket_id}</h3>
              </div>
              <button onClick={() => setSelectedTicket(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                <X size={20} />
              </button>
            </div>

            <div className="drawer-body">
              {/* Created Time */}
              <div className="drawer-section">
                <span className="drawer-label">Created At</span>
                <span className="drawer-value" style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                  {formatDate(selectedTicket.created_at)}
                </span>
              </div>

              {/* Priority & Issue Type */}
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div className="drawer-section" style={{ flex: 1 }}>
                  <span className="drawer-label">Priority Level</span>
                  <div style={{ marginTop: '0.25rem' }}>
                    <span className={`badge badge-${selectedTicket.priority}`}>{selectedTicket.priority}</span>
                  </div>
                </div>
                <div className="drawer-section" style={{ flex: 1 }}>
                  <span className="drawer-label">Issue Type</span>
                  <div style={{ marginTop: '0.25rem' }}>
                    <span className="font-semibold" style={{ fontSize: '0.9rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span>{getIssueTypeIcon(selectedTicket.issue_type)}</span> {selectedTicket.issue_type}
                    </span>
                  </div>
                </div>
              </div>

              {/* Operational Status (Interactive!) */}
              <div className="drawer-section">
                <span className="drawer-label">Operational Status</span>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem' }}>
                  {["New", "In Progress", "Resolved"].map(status => {
                    const currentStatus = selectedTicket.status || localStatuses[selectedTicket.ticket_id] || "Resolved";
                    const isActive = currentStatus === status;
                    let badgeClass = "badge-New";
                    if (status === "In Progress") badgeClass = "badge-In_Progress";
                    if (status === "Resolved") badgeClass = "badge-Resolved";
                    
                    return (
                      <button
                        key={status}
                        onClick={async () => {
                          // Optimistically update the UI state
                          setLocalStatuses(prev => ({
                            ...prev,
                            [selectedTicket.ticket_id]: status
                          }));
                          
                          // Persist status change to database if this is a DB-backed ticket
                          if (tickets.length && selectedTicket.ticket_id) {
                            try {
                              const res = await fetch(`http://127.0.0.1:8000/complaints/${selectedTicket.ticket_id}/status`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ status: status })
                              });
                              if (res.ok) {
                                selectedTicket.status = status;
                                fetchTickets();
                              } else {
                                console.error("Failed to update status on server.");
                              }
                            } catch (err) {
                              console.error("Error patching status:", err);
                            }
                          } else {
                            // If it's a mock ticket, mutate its status field directly in-memory
                            selectedTicket.status = status;
                          }
                        }}
                        style={{
                          border: isActive ? '2px solid #000000' : '1px solid #e5e7eb',
                          background: isActive ? '#000000' : 'transparent',
                          color: isActive ? '#ffffff' : '#6b7280',
                          opacity: 1,
                          cursor: 'pointer',
                          borderRadius: '99px',
                          display: 'inline-flex',
                          padding: '0.35rem 0.75rem',
                          fontWeight: isActive ? 600 : 500
                        }}
                        className={`badge ${isActive && status === 'New' ? '' : badgeClass}`}
                      >
                        {status}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* AI Generated Summary */}
              <div className="drawer-section" style={{ background: '#f9fafb', padding: '1.25rem', borderRadius: '8px', borderLeft: '3px solid #000000' }}>
                <span className="drawer-label" style={{ color: '#000000', marginBottom: '0.25rem' }}>AI Diagnostics Summary</span>
                <p style={{ fontSize: '0.85rem', color: '#111827', fontStyle: 'italic', lineHeight: 1.5 }}>
                  "{selectedTicket.summary}"
                </p>
              </div>

              {/* Original Complaint Text */}
              <div className="drawer-section">
                <span className="drawer-label">Original natural language complaint</span>
                <div style={{ background: '#fcfcfc', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem', fontSize: '0.85rem', color: '#6b7280', maxHeight: '150px', overflowY: 'auto', lineHeight: 1.5 }}>
                  {selectedTicket.original_complaint}
                </div>
              </div>
            </div>

            <div className="drawer-footer">
              <button
                onClick={() => {
                  const query = `Recommend step-by-step diagnostic safety and maintenance troubleshooting procedures based on technical manuals for a ${selectedTicket.issue_type} complaint: "${selectedTicket.original_complaint}"`;
                  triggerDiagnostics(query);
                }}
                style={{
                  background: '#000000',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.75rem 1.25rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  width: '100%',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <HelpCircle size={16} /> Run RAG Troubleshooting Guide
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
