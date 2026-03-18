import React, { useState, useEffect, useRef } from 'react';
import { getTeamDisplay } from '../../utils/helpers';
import { saveMember } from '../../api/mockApi';
import type { Member } from '../../api/mockApi';
import './MemberModal.css';

interface MemberModalProps {
  member: Member;
  onClose: () => void;
  onUpdateMember: (member: Member) => void;
}

export const MemberModal: React.FC<MemberModalProps> = ({ member, onClose, onUpdateMember }) => {
  const [newTag, setNewTag] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member>(member);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    contentRef.current?.focus();
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    const updated = { 
      ...selectedMember,
      tags: [...selectedMember.tags, newTag.trim()]
    };
    setSelectedMember(updated);
    onUpdateMember(updated);
    saveMember(updated);
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updated = {
      ...selectedMember,
      tags: selectedMember.tags.filter(t => t !== tagToRemove)
    };
    setSelectedMember(updated);
    onUpdateMember(updated);
    saveMember(updated);
  };

  return (
    <div className="member-modal__backdrop" onClick={onClose}>
      <div
        className="member-modal__content"
        ref={contentRef}
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
      >
        <div className="member-modal__header">
          <div className="member-modal__avatar">{selectedMember.avatar}</div>
          <div className="member-modal__info-row">
            <h2>{selectedMember.name}</h2>
            <p>{selectedMember.role} — {selectedMember.email}</p>
          </div>
          <button className="member-modal__close" onClick={onClose}>×</button>
        </div>
        <div className="member-modal__body">
          <div className="member-modal__stats-box">
            <div className="member-modal__stat">
              <strong>Status</strong>
              <span className={`member-card__status member-card__status--${selectedMember.status}`}>
                {selectedMember.status === 'on-leave' ? 'On Leave' : selectedMember.status.charAt(0).toUpperCase() + selectedMember.status.slice(1)}
              </span>
            </div>
            <div className="member-modal__stat">
              <strong>Team</strong>
              <span>{getTeamDisplay(selectedMember)}</span>
            </div>
          </div>
          <div className="member-modal__section">
            <h3>Tags</h3>
            <div className="member-modal__tags">
              {selectedMember.tags.map(tag => (
                <span 
                  key={tag} 
                  className="member-modal__tag member-modal__tag--removable"
                  onClick={() => handleRemoveTag(tag)}
                  title="Click to remove"
                >
                  {tag} &times;
                </span>
              ))}
            </div>
            <div className="member-modal__add-tag">
              <input
                type="text"
                placeholder="Add a tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <button onClick={handleAddTag}>Add</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
