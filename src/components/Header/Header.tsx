import React, { useState, useEffect } from 'react';
import { NotificationDropdown } from '../NotificationDropdown/NotificationDropdown';
import { searchMembers } from '../../api/mockApi';
import type { Member } from '../../api/mockApi';
import './Header.css';

function computeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export const Header: React.FC<{ 
  onNavigate: (page: string) => void;
  onSelectMember?: (member: Member) => void;
}> = ({ onNavigate, onSelectMember }) => {
  const [query, setQuery] = useState<string>('');
  const [greeting] = useState(() => computeGreeting());
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchResults, setSearchResults] = useState<Member[]>([]);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  useEffect(() => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    let isActive = true;
    const timer = setTimeout(() => {
      searchMembers(query).then(results => {
        if (isActive) setSearchResults(results);
      }).catch(err => {
        if (isActive) console.error(err);
      });
    }, 300);
    
    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [query]);

  return (
    <header className="header">
      <div className="header__left">
        <h1 className="header__logo" onClick={() => onNavigate('dashboard')}>TeamPulse</h1>
      </div>
      <div className="header__center">
        <div className="header__search-container">
          <input
            className="header__search"
            type="text"
            placeholder="Search members..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {searchResults.length > 0 && query && (
            <div className="header__search-results">
              {searchResults.map(m => (
                <div 
                  key={m.id} 
                  className="header__search-result-item"
                  onClick={() => {
                    if (onSelectMember) onSelectMember(m);
                    setQuery('');
                    setSearchResults([]);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <strong>{m.name}</strong>
                  <span>{m.role}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="header__right">
        <span className="header__greeting">{greeting}, John</span>
        <div ref={dropdownRef} className="header__notification-wrapper" style={{ position: 'relative' }}>
          <button
            className="header__notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            🔔
          </button>
          {showNotifications && (
            <NotificationDropdown 
              onSelectMember={(m: Member) => {
                if (onSelectMember) onSelectMember(m);
                setShowNotifications(false);
              }}
            />
          )}
        </div>
        <div className="header__avatar">JD</div>
      </div>
    </header>
  );
};
