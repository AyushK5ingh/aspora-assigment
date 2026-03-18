import React, { useState, useEffect, useRef, useMemo } from 'react';
import './SearchOverlay.css';

interface Comment {
  postId: number;
  id: number;
  name: string;
  email: string;
  body: string;
}

const HighlightText: React.FC<{ text: string; highlight: string }> = ({ text, highlight }) => {
  if (!highlight.trim()) return <span>{text}</span>;
  const lowerText = text.toLowerCase();
  const lowerHighlight = highlight.toLowerCase();
  const index = lowerText.indexOf(lowerHighlight);
  if (index === -1) return <span>{text}</span>;
  
  return (
    <>
      <span>{text.slice(0, index)}</span>
      <mark>{text.slice(index, index + highlight.length)}</mark>
      <HighlightText text={text.slice(index + highlight.length)} highlight={highlight} />
    </>
  );
};

export const SearchOverlay: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setDebouncedQuery('');
      setActiveIndex(-1);
      setExpandedId(null);
      setTimeout(() => inputRef.current?.focus(), 100);
      
      if (comments.length === 0 && !error) {
        setLoading(true);
        fetch(import.meta.env.VITE_API_COMMENTS_URL)
          .then(res => {
            if (!res.ok) throw new Error('Failed to fetch comments');
            return res.json();
          })
          .then(data => {
            setComments(data);
            setLoading(false);
          })
          .catch(err => {
            setError(err.message || 'Failed to load comments');
            setLoading(false);
          });
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setActiveIndex(-1);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    if (!debouncedQuery) return [];
    const lowerQ = debouncedQuery.toLowerCase();
    return comments.filter(c => c.body.toLowerCase().includes(lowerQ));
  }, [debouncedQuery, comments]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!debouncedQuery || results.length === 0) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % results.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + results.length) % results.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < results.length) {
          setExpandedId(expandedId === results[activeIndex].id ? null : results[activeIndex].id);
        }
        break;
    }
  };

  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const activeEl = listRef.current.children[activeIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex]);

  if (!isOpen) return null;

  return (
    <div className="search-overlay">
      <div className="search-overlay__backdrop" onClick={onClose} />
      <div className="search-overlay__content">
        <div className="search-overlay__header">
          <input
            ref={inputRef}
            type="text"
            className="search-overlay__input"
            placeholder="Search comments..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="search-overlay__close" onClick={onClose}>×</button>
        </div>
        
        <div className="search-overlay__body">
          {loading && comments.length === 0 && <div className="search-overlay__loading">Connecting to database...</div>}
          {error && <div className="search-overlay__error">{error}</div>}
          
          {!loading && !error && !query && (
            <div className="search-overlay__empty">Start typing to search comments...</div>
          )}

          {!error && query && query !== debouncedQuery && (
            <div className="search-overlay__loading">Searching...</div>
          )}

          {!loading && !error && debouncedQuery && query === debouncedQuery && results.length === 0 && (
            <div className="search-overlay__empty">No comments found for "{debouncedQuery}"</div>
          )}

          {!loading && !error && debouncedQuery && query === debouncedQuery && results.length > 0 && (
            <ul className="search-overlay__results" ref={listRef}>
              {results.map((comment, i) => (
                <li
                  key={comment.id}
                  className={`search-overlay__result-item ${i === activeIndex ? 'active' : ''}`}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => setExpandedId(expandedId === comment.id ? null : comment.id)}
                >
                  <div className="search-overlay__result-item-header">
                    <strong>{comment.name}</strong>
                    <span>{comment.email}</span>
                  </div>
                  <div className={`search-overlay__result-item-body ${expandedId === comment.id || activeIndex === i ? 'expanded' : ''}`}>
                    <HighlightText text={comment.body} highlight={debouncedQuery} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
