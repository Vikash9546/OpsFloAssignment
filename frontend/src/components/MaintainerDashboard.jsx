import React, { useState, useEffect } from 'react';
import { Send, X, AlertTriangle, Clock, CheckCircle2, HelpCircle, Layers, Filter } from 'lucide-react';

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
      
      // Initialize local statuses for tickets that don't have one in localStatuses yet
      setLocalStatuses(prev => {
        const next = { ...prev };
        list.forEach(t => {
          if (!next[t.ticket_id]) {
            next[t.ticket_id] = "New"; // default status
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
  const totalComplaints = tickets.length;
  const highPriority = tickets.filter(t => t.priority === 'High').length;
  const inProgress = tickets.filter(t => localStatuses[t.ticket_id] === 'In Progress').length;
  const resolved = tickets.filter(t => localStatuses[t.ticket_id] === 'Resolved').length;

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

  return (
    <div className="dashboard-grid">
      {/* Welcome Banner */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.5rem' }}>
        <h2 className="title" style={{ fontSize: '1.6rem' }}>Welcome back, Admin</h2>
        <p className="subtitle">Monitor and manage maintenance complaints intelligently.</p>
      </div>

      {/* Horizontal Stats Row */}
      <div className="stats-row">
        {/* Total Complaints */}
        <div 
          className="card card-interactive" 
          onClick={() => setActiveFilter(null)}
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            position: 'relative', 
            overflow: 'hidden', 
            padding: '1.5rem 1.5rem 2.5rem',
            border: activeFilter === null ? '2px solid var(--brand-purple)' : '1px solid var(--border-subtle)',
            background: activeFilter === null ? 'var(--brand-purple-light)' : 'var(--bg-card)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ background: 'var(--brand-purple-light)', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: 'var(--brand-purple)' }}>
              <Layers size={22} />
            </div>
            <span className="text-sm text-gray font-semibold">Total Complaints</span>
          </div>
          <span className="font-semibold" style={{ fontSize: '2rem', marginLeft: '0.25rem', color: 'var(--text-primary)' }}>{totalComplaints}</span>
          <svg style={{ position: 'absolute', bottom: 0, left: 0, width: '100%' }} viewBox="0 0 100 20" preserveAspectRatio="none"><path d="M0,10 Q25,20 50,10 T100,10 L100,20 L0,20 Z" fill="var(--brand-purple)" opacity="0.15"/></svg>
        </div>
        
        {/* High Priority */}
        <div 
          className="card card-interactive" 
          onClick={() => setActiveFilter({ type: 'priority', value: 'High', label: 'High Priority' })}
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            position: 'relative', 
            overflow: 'hidden', 
            padding: '1.5rem 1.5rem 2.5rem',
            border: activeFilter?.type === 'priority' && activeFilter?.value === 'High' ? '2px solid #ef4444' : '1px solid var(--border-subtle)',
            background: activeFilter?.type === 'priority' && activeFilter?.value === 'High' ? '#fef2f2' : 'var(--bg-card)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ background: '#fee2e2', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: '#ef4444' }}>
              <AlertTriangle size={22} />
            </div>
            <span className="text-sm text-gray font-semibold">High Priority</span>
          </div>
          <span className="font-semibold" style={{ fontSize: '2rem', marginLeft: '0.25rem', color: 'var(--text-primary)' }}>{highPriority}</span>
          <svg style={{ position: 'absolute', bottom: 0, left: 0, width: '100%' }} viewBox="0 0 100 20" preserveAspectRatio="none"><path d="M0,10 Q25,20 50,10 T100,10 L100,20 L0,20 Z" fill="#ef4444" opacity="0.15"/></svg>
        </div>

        {/* In Progress */}
        <div 
          className="card card-interactive" 
          onClick={() => setActiveFilter({ type: 'status', value: 'In Progress', label: 'In Progress' })}
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            position: 'relative', 
            overflow: 'hidden', 
            padding: '1.5rem 1.5rem 2.5rem',
            border: activeFilter?.type === 'status' && activeFilter?.value === 'In Progress' ? '2px solid var(--brand-orange)' : '1px solid var(--border-subtle)',
            background: activeFilter?.type === 'status' && activeFilter?.value === 'In Progress' ? '#fffbeb' : 'var(--bg-card)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ background: '#fef3c7', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: 'var(--brand-orange)' }}>
              <Clock size={22} />
            </div>
            <span className="text-sm text-gray font-semibold">In Progress</span>
          </div>
          <span className="font-semibold" style={{ fontSize: '2rem', marginLeft: '0.25rem', color: 'var(--text-primary)' }}>{inProgress}</span>
          <svg style={{ position: 'absolute', bottom: 0, left: 0, width: '100%' }} viewBox="0 0 100 20" preserveAspectRatio="none"><path d="M0,10 Q25,20 50,10 T100,10 L100,20 L0,20 Z" fill="var(--brand-orange)" opacity="0.15"/></svg>
        </div>

        {/* Resolved */}
        <div 
          className="card card-interactive" 
          onClick={() => setActiveFilter({ type: 'status', value: 'Resolved', label: 'Resolved' })}
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            position: 'relative', 
            overflow: 'hidden', 
            padding: '1.5rem 1.5rem 2.5rem',
            border: activeFilter?.type === 'status' && activeFilter?.value === 'Resolved' ? '2px solid var(--brand-green)' : '1px solid var(--border-subtle)',
            background: activeFilter?.type === 'status' && activeFilter?.value === 'Resolved' ? '#f0fdf4' : 'var(--bg-card)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ background: 'var(--brand-green-light)', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: 'var(--brand-green)' }}>
              <CheckCircle2 size={22} />
            </div>
            <span className="text-sm text-gray font-semibold">Resolved</span>
          </div>
          <span className="font-semibold" style={{ fontSize: '2rem', marginLeft: '0.25rem', color: 'var(--text-primary)' }}>{resolved}</span>
          <svg style={{ position: 'absolute', bottom: 0, left: 0, width: '100%' }} viewBox="0 0 100 20" preserveAspectRatio="none"><path d="M0,10 Q25,20 50,10 T100,10 L100,20 L0,20 Z" fill="var(--brand-green)" opacity="0.15"/></svg>
        </div>
      </div>

      {/* Main Content Row */}
      <div className="content-row">
        {/* Dynamic Data Table & Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Submission Form */}
          <div className="card" style={{ borderLeft: '4px solid var(--brand-purple)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{ background: 'var(--brand-purple-light)', padding: '0.5rem', borderRadius: '50%', color: 'var(--brand-purple)' }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              </div>
              <h3 className="title text-sm">Submit New Ticket</h3>
            </div>
            <p className="text-xs text-gray mb-4">Describe the maintenance issue in detail so our AI agent can analyze and classify it.</p>
            <textarea 
              className="chat-input"
              style={{ borderRadius: 'var(--radius-md)', minHeight: '80px', padding: '1rem', width: '100%', marginBottom: '1rem' }}
              placeholder="Describe the maintenance issue... (e.g., 'The compressor is smoking')" 
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                style={{ background: '#000000', color: 'white', borderRadius: '8px', cursor: 'pointer', padding: '0.6rem 1.25rem', border: 'none', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center' }} 
                onClick={handleSubmit} 
                disabled={loading || !complaint.trim()}
              >
                <Send size={14} style={{ marginRight: '0.35rem' }} /> {loading ? "Analyzing via Agent..." : "Submit to Agent"}
              </button>
            </div>
          </div>

          {/* Table Card */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 className="title text-sm">Recent Complaints</h3>
              <span className="text-sm text-purple cursor-pointer font-semibold" onClick={() => setActiveFilter(null)}>View All &rarr;</span>
            </div>

            {/* Filter Banner */}
            {activeFilter && (
              <div className="filter-banner">
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--brand-purple)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Filter size={16} /> Showing only <strong>{activeFilter.label}</strong> tickets
                </span>
                <button 
                  onClick={() => setActiveFilter(null)}
                  style={{ background: 'white', border: '1px solid var(--border-focus)', borderRadius: '6px', padding: '0.25rem 0.6rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', color: 'var(--brand-purple)' }}
                >
                  Clear Filter
                </button>
              </div>
            )}

            <table style={{ width: '100%', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Issue Type</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Date & Time</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.length === 0 ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>No matching tickets found.</td></tr>
                ) : filteredTickets.map((t, i) => {
                  const status = localStatuses[t.ticket_id] || "New";
                  let badgeClass = "badge-New";
                  if (status === "In Progress") badgeClass = "badge-In_Progress";
                  if (status === "Resolved") badgeClass = "badge-Resolved";

                  return (
                    <tr key={i} onClick={() => setSelectedTicket(t)}>
                      <td className="font-semibold text-sm">{t.ticket_id}</td>
                      <td className="text-purple font-semibold text-sm">⚡ {t.issue_type}</td>
                      <td><span className={`badge badge-${t.priority}`}>{t.priority}</span></td>
                      <td><span className={`badge ${badgeClass}`}>{status}</span></td>
                      <td className="text-gray text-xs">{new Date(t.created_at).toLocaleString()}</td>
                      <td className="text-gray cursor-pointer" style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--brand-purple)', fontWeight: 600, marginRight: '0.5rem' }} className="view-details-hover">View Details</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline-block', verticalAlign: 'middle' }}><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Slide-Over Drawer */}
      <div className={`detail-drawer ${selectedTicket ? 'open' : ''}`}>
        {selectedTicket && (
          <>
            <div className="drawer-header">
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.05em' }}>TICKET DETAILS</span>
                <h3 className="title" style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>{selectedTicket.ticket_id}</h3>
              </div>
              <button onClick={() => setSelectedTicket(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={20} />
              </button>
            </div>

            <div className="drawer-body">
              {/* Created Time */}
              <div className="drawer-section">
                <span className="drawer-label">Created At</span>
                <span className="drawer-value" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {new Date(selectedTicket.created_at).toLocaleString()}
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
                    <span className="text-purple font-semibold" style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      ⚡ {selectedTicket.issue_type}
                    </span>
                  </div>
                </div>
              </div>

              {/* Operational Status (Interactive!) */}
              <div className="drawer-section">
                <span className="drawer-label">Operational Status</span>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem' }}>
                  {["New", "In Progress", "Resolved"].map(status => {
                    const isActive = localStatuses[selectedTicket.ticket_id] === status;
                    let badgeClass = "badge-New";
                    if (status === "In Progress") badgeClass = "badge-In_Progress";
                    if (status === "Resolved") badgeClass = "badge-Resolved";
                    
                    return (
                      <button
                        key={status}
                        onClick={() => {
                          setLocalStatuses(prev => ({
                            ...prev,
                            [selectedTicket.ticket_id]: status
                          }));
                        }}
                        style={{
                          border: isActive ? '2px solid currentColor' : '1px solid var(--border-subtle)',
                          background: isActive ? 'none' : 'transparent',
                          opacity: isActive ? 1 : 0.45,
                          cursor: 'pointer',
                          borderRadius: '99px',
                          display: 'inline-flex',
                          padding: '0.35rem 0.75rem'
                        }}
                        className={`badge ${badgeClass}`}
                      >
                        {status}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* AI Generated Summary */}
              <div className="drawer-section" style={{ background: 'var(--brand-purple-light)', padding: '1.25rem', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--brand-purple)' }}>
                <span className="drawer-label" style={{ color: 'var(--brand-purple)', marginBottom: '0.25rem' }}>AI Diagnostics Summary</span>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontStyle: 'italic', lineHeight: 1.5 }}>
                  "{selectedTicket.summary}"
                </p>
              </div>

              {/* Original Complaint Text */}
              <div className="drawer-section">
                <span className="drawer-label">Original natural language complaint</span>
                <div style={{ background: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', maxHeight: '150px', overflowY: 'auto', lineHeight: 1.5 }}>
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
                  borderRadius: 'var(--radius-md)',
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
