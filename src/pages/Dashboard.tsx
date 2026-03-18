import React, { useState, useEffect } from 'react';
import { StatsCards } from '../components/StatsCards/StatsCards';
import { MemberGrid } from '../components/MemberGrid/MemberGrid';
import { StandupTimer } from '../components/Timer/StandupTimer';
import { MemberModal } from '../components/MemberModal/MemberModal';
import type { Member } from '../api/mockApi';
import './Dashboard.css';
export interface DashboardProps {
  selectedMember: Member | null;
  setSelectedMember: (m: Member | null) => void;
  updatedMember: Member | null;
  setUpdatedMember: (m: Member | null) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  selectedMember, 
  setSelectedMember, 
  updatedMember, 
  setUpdatedMember 
}) => {
  const getCols = () => window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3;
  const [gridCols, setGridCols] = useState(getCols());

  useEffect(() => {
    const handler = () => setGridCols(getCols());
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return (
    <div className="dashboard">
      <div className="dashboard__title">
        <h1>Dashboard</h1>
        <p>Team overview and activity at a glance</p>
      </div>
      <div className="dashboard__top">
        <StatsCards />
        <StandupTimer />
      </div>
      <MemberGrid onSelectMember={setSelectedMember} columns={gridCols} updatedMember={updatedMember} />
      {selectedMember && (
        <MemberModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onUpdateMember={(updated) => {
            setSelectedMember(updated);
            setUpdatedMember(updated);
          }}
        />
      )}
    </div>
  );
};
