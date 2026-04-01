import React from 'react';

interface UserCardProps {
  initials: string;
  name: string;
  role: string;
  color: string;
}

export const UserCard: React.FC<UserCardProps> = ({ initials, name, role, color }) => (
  <div className="user-card">
    <div className="user-avatar" style={{ background: color }}>
      {initials}
    </div>
    <div className="user-info">
      <span className="user-name">{name}</span>
      <span className="user-role">{role}</span>
    </div>
  </div>
);
