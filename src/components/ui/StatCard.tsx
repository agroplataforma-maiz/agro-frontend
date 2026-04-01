import React from 'react';

interface StatCardProps {
  value: React.ReactNode;
  label: string;
  colorClass?: string;
}

const StatCard: React.FC<StatCardProps> = ({ value, label, colorClass = '' }) => {
  return (
    <div className={`stat-card${colorClass ? ' ' + colorClass : ''}`}>
      <div className="stat-n">{value}</div>
      <div className="stat-l">{label}</div>
    </div>
  );
};

export default StatCard;
