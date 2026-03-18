import React, { useState, useEffect } from 'react';
import { fetchMembers, saveMember } from '../../api/mockApi';
import { MemberCard } from '../MemberCard/MemberCard';
import { useFilters } from '../../context/FilterContext';
import type { Member } from '../../api/mockApi';
import './MemberGrid.css';

interface MemberGridProps {
  onSelectMember: (member: Member) => void;
  columns?: number;
  updatedMember?: Member | null;
}

export const MemberGrid: React.FC<MemberGridProps> = ({ onSelectMember, columns = 3, updatedMember }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { filters } = useFilters();

  useEffect(() => {
    let isActive = true;
    setLoading(true);
    setError(null);
    fetchMembers(filters)
      .then(data => {
        if (isActive) {
          setMembers(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isActive) {
          setError(err.message || 'Failed to fetch members');
          setLoading(false);
        }
      });
    return () => { isActive = false; };
  }, [filters.status, filters.role]);

  useEffect(() => {
    if (updatedMember) {
      setMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
    }
  }, [updatedMember]);

  const handleBookmark = (id: number) => {
    setMembers(prev => prev.map(m => {
      if (m.id === id) {
        const nextMember = { ...m, bookmarked: !m.bookmarked };
        saveMember(nextMember).catch(err => console.error('Failed to save bookmark:', err));
        return nextMember;
      }
      return m;
    }));
  };

  const visibleBookmarks = members.filter(m => m.bookmarked).length;

  return (
    <div className="member-grid">
      <div className="member-grid__header">
        <h2>Team Members ({members.length})</h2>
        <span>Bookmarked: {visibleBookmarks}</span>
      </div>
      <div className="member-grid__cards" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {loading && <p className="member-grid__loading">Loading members...</p>}
        {error && <p className="member-grid__error">{error}</p>}
        {!loading && !error && members.length === 0 && (
          <p className="member-grid__empty">No members found</p>
        )}
        {!loading && !error && members.map(member => (
          <MemberCard
            key={member.id}
            member={member}
            onBookmark={handleBookmark}
            onClick={onSelectMember}
          />
        ))}
      </div>
    </div>
  );
};
