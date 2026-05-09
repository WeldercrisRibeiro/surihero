import React from 'react';

export const PlaceholderModule = ({ title, icon: Icon, color }: { title: string, icon: any, color: string }) => (
  <div className="animate-fade-in glass-panel" style={{ padding: '40px', minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
    <Icon size={64} color={color} />
    <h2>{title}</h2>
    <p style={{ color: 'var(--suri-text-muted)' }}>Módulo integrado com sucesso. Interface em desenvolvimento.</p>
  </div>
);
