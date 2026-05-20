import React from 'react';
import { Settings, Shield, Zap, Search, BrainCircuit, Database, Server } from 'lucide-react';

export default function SystemManual() {
  return (
    <div className="dashboard-grid" style={{ gap: '1.25rem', paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginBottom: '1rem' }}>
        <h2 className="title" style={{ fontSize: '2.0rem', color: '#111827', fontWeight: 700 }}>
          System Manual
        </h2>
        <p className="subtitle" style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 500 }}>
          How the Intelligent Maintenance Agent works
        </p>
      </div>

      <div className="card" style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BrainCircuit size={24} color="#0A7C6E" />
          Architecture Overview
        </h3>
        <p style={{ fontSize: '0.9rem', color: '#4b5563', lineHeight: '1.6', marginBottom: '2rem' }}>
          Maintainer AI is a smart assistant designed to help plant operators and maintenance engineers efficiently log, categorize, and troubleshoot industrial equipment issues. The system leverages state-of-the-art Generative AI and Retrieval-Augmented Generation (RAG) to provide contextual, actionable insights derived directly from equipment manuals.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          
          <div style={{ padding: '1.5rem', background: '#f9fafb', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#e0f2f1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Zap size={20} color="#0A7C6E" />
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', marginBottom: '0.5rem' }}>Intelligent Complaint Logging</h4>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', lineHeight: '1.5' }}>
              When a user submits a natural language complaint, the system's backend utilizes Gemini (LLM) to automatically classify the issue type (Electrical, Mechanical, Plumbing) and determine its priority (High, Medium, Low). It also generates a concise summary of the problem.
            </p>
          </div>

          <div style={{ padding: '1.5rem', background: '#f9fafb', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#e0f2f1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Database size={20} color="#0A7C6E" />
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', marginBottom: '0.5rem' }}>Vector Database Search (RAG)</h4>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', lineHeight: '1.5' }}>
              The RAG (Retrieval-Augmented Generation) backend splits massive engineering handbooks into smaller chunks and stores them in a ChromaDB vector database. When troubleshooting, it retrieves the most relevant technical documentation to ground the AI's response in reality.
            </p>
          </div>

          <div style={{ padding: '1.5rem', background: '#f9fafb', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#e0f2f1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Server size={20} color="#0A7C6E" />
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', marginBottom: '0.5rem' }}>Dual-Backend Architecture</h4>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', lineHeight: '1.5' }}>
              <strong>Maint_backend (FastAPI):</strong> Handles ticket management, CRUD operations, and initial AI classification. <br/><br/>
              <strong>RAG_backend (FastAPI):</strong> Dedicated to semantic search, querying ChromaDB, and generating complex step-by-step diagnostic procedures.
            </p>
          </div>

          <div style={{ padding: '1.5rem', background: '#f9fafb', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#e0f2f1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Shield size={20} color="#0A7C6E" />
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', marginBottom: '0.5rem' }}>Interactive UI / UX</h4>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', lineHeight: '1.5' }}>
              The frontend is built with React and Vite. It features a responsive dashboard, dynamic filtering, ticket state management, and a floating Chatbot overlay that directly interfaces with the RAG troubleshooting API.
            </p>
          </div>

        </div>

        <div style={{ marginTop: '3rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '1rem' }}>
            Step-by-Step Usage Guide
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ background: '#111827', color: 'white', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold', flexShrink: 0 }}>1</div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem', color: '#111827', marginBottom: '0.25rem' }}>Submit a Ticket</strong>
                <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>Go to the Dashboard and type a natural language complaint into the text area. The AI will parse it and generate a categorized ticket.</p>
              </div>
            </li>
            <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ background: '#111827', color: 'white', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold', flexShrink: 0 }}>2</div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem', color: '#111827', marginBottom: '0.25rem' }}>View the Repository</strong>
                <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>Check the "Complaints" tab to view all logged tickets. Click on the stats cards at the top to filter by High Priority or In Progress tickets.</p>
              </div>
            </li>
            <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ background: '#111827', color: 'white', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold', flexShrink: 0 }}>3</div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem', color: '#111827', marginBottom: '0.25rem' }}>Update Status</strong>
                <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>Click on any ticket to open its details drawer. You can interactively change its operational status (New, In Progress, Resolved).</p>
              </div>
            </li>
            <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ background: '#111827', color: 'white', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold', flexShrink: 0 }}>4</div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem', color: '#111827', marginBottom: '0.25rem' }}>Run Diagnostics</strong>
                <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>Inside the ticket drawer, click "Run RAG Troubleshooting Guide" to automatically open the chatbot and fetch manual-backed step-by-step repair instructions.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
