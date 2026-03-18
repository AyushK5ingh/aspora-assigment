import React, { useState, useEffect } from 'react';
import { fetchActivities, updateActivityNote, updateMemberRole } from '../../api/mockApi';
import { batchAssignRole } from '../../utils/batchOperations';
import { useToast } from '../Toast/ToastContainer';
import type { Activity } from '../../api/mockApi';
import './ActivityFeed.css';

export const ActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [filterText, setFilterText] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBatching, setIsBatching] = useState(false);
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    setLoading(true);
    fetchActivities()
      .then(data => {
        if (isActive) {
          setActivities(prev => [...prev, ...data]);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isActive) {
          setError(err.message || 'Failed to fetch activities');
          setLoading(false);
        }
      });
    return () => { isActive = false; };
  }, []);

  const sorted = [...activities].sort((a, b) => {
    const aTime = new Date(a.timestamp).getTime();
    const bTime = new Date(b.timestamp).getTime();
    return sortBy === 'newest' ? bTime - aTime : aTime - bTime;
  });

  const filtered = filterText
    ? sorted.filter(a => a.action.toLowerCase().includes(filterText.toLowerCase()) ||
        a.memberName.toLowerCase().includes(filterText.toLowerCase()))
    : sorted;

  const handleBatchAssign = async () => {
    if (selectedIds.length === 0) return;
    setIsBatching(true);
    await batchAssignRole(
      selectedIds,
      'Senior Engineer',
      updateMemberRole,
      () => {
        showToast('All roles updated!');
        setSelectedIds([]);
      },
      (msg) => showToast(msg, 'error')
    );
    setIsBatching(false);
  };

  return (
    <div className="activity-feed">
      <div className="activity-feed__controls">
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
        <input
          type="text"
          placeholder="Filter activities..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
        <button 
          className="btn-primary" 
          onClick={handleBatchAssign}
          disabled={isBatching || selectedIds.length === 0}
        >
          {isBatching ? 'Saving all...' : `Batch Assign Role (${selectedIds.length})`}
        </button>
      </div>
      <div className="activity-feed__list">
        {loading && activities.length === 0 && <p className="activity-feed__loading" style={{ padding: '20px', textAlign: 'center' }}>Loading activities...</p>}
        {error && <p className="activity-feed__error" style={{ padding: '20px', textAlign: 'center', color: 'red' }}>{error}</p>}
        {filtered.map((activity) => (
          <div key={activity.id} className="activity-feed__item">
            <input
              type="checkbox"
              checked={selectedIds.includes(activity.memberId)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedIds(prev => [...prev, activity.memberId]);
                } else {
                  setSelectedIds(prev => prev.filter(id => id !== activity.memberId));
                }
              }}
            />
            <div className="activity-feed__item-content">
              <strong>{activity.memberName}</strong>
              <span>{activity.action}</span>
              <time>{new Date(activity.timestamp).toLocaleString()}</time>
              <input
                className="activity-feed__note"
                type="text"
                value={activity.note || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setActivities(prev => prev.map(a => a.id === activity.id ? { ...a, note: val } : a));
                }}
                onBlur={(e) => updateActivityNote(activity.id, e.target.value)}
                placeholder="Add note..."
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
