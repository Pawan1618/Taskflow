import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 12,
      color: '#6B778C', padding: 40,
    }}>
      <div style={{ fontSize: 72, fontWeight: 800, color: '#DFE1E6', lineHeight: 1 }}>404</div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#172B4D' }}>Page not found</h2>
      <p style={{ fontSize: 14 }}>This page doesn't exist or was moved.</p>
      <Link to="/" className="tf-btn-primary" style={{ marginTop: 8, textDecoration: 'none' }}>
        <Home size={14} /> Back to Dashboard
      </Link>
    </div>
  );
}
