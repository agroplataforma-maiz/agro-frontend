import React from 'react';

interface QuickAccessCardProps {
  icon: string;
  label: string;
  desc: string;
  onClick?: () => void;
}

export const QuickAccessCard: React.FC<QuickAccessCardProps> = ({ icon, label, desc, onClick }) => (
  <button className="quick-access-card" onClick={onClick}>
    <span className="quick-access-icon">{icon}</span>
    <span className="quick-access-label">{label}</span>
    <span className="quick-access-desc">{desc}</span>
  </button>
);
