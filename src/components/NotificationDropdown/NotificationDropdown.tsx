import React, { useState, useEffect } from 'react';
import { fetchNotifications, fetchMemberById } from '../../api/mockApi';
import { bindNotificationHandlers } from '../../utils/helpers';
import type { Notification, Member } from '../../api/mockApi';

export const NotificationDropdown: React.FC<{
  onSelectMember?: (member: Member) => void;
}> = ({ onSelectMember }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  useEffect(() => {
    fetchNotifications().then(setNotifications);
  }, []);

  const handlers = bindNotificationHandlers(notifications, async (id) => {
    const notif = notifications.find(n => n.id === id);
    if (notif && onSelectMember) {
      setLoadingId(notif.id);
      const member = await fetchMemberById(notif.memberId);
      setLoadingId(null);
      if (member) onSelectMember(member);
    }
  });

  return (
    <div className="notification-dropdown" style={{
      position: 'absolute',
      top: '100%',
      right: 0,
      width: '320px',
      background: 'var(--surface, #ffffff)',
      border: '1px solid var(--border, #e2e8f0)',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 99999,
      maxHeight: '400px',
      overflowY: 'auto',
    }}>
      <h3 style={{ padding: '12px 16px', margin: 0, borderBottom: '1px solid var(--border, #e2e8f0)' }}>
        Notifications
      </h3>
      {notifications.map((n, idx) => (
        <div
          key={n.id}
          onClick={handlers[idx]}
          style={{
            padding: '12px 16px',
            cursor: 'pointer',
            borderBottom: '1px solid var(--border, #e2e8f0)',
            background: n.read ? 'transparent' : '#f8f9ff',
          }}
        >
          <strong>{n.title}</strong>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary, #64748b)' }}>
            {n.message}
          </p>
          {loadingId === n.id && (
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--primary)' }}>Loading details...</p>
          )}
        </div>
      ))}
    </div>
  );
};
