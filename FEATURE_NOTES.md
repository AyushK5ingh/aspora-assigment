# FEATURE_NOTES.md — Search Comments

## What We Built
The **Search Comments** feature allows users to search through 500 comments fetched from the JSONPlaceholder API in real time.

It includes:
- Instant client-side search
- Highlighted matching text
- Keyboard navigation support
- Smooth overlay UX  
- No external UI or utility libraries

---

## Approach & Implementation

### 1. Client-Side Data Architecture
- Comments are fetched **once** when the search overlay opens.
- Data is cached in component state for the session.
- Eliminates repeated API calls → **instant search experience**

---

### 2. Performance Optimization

#### Debouncing
- Implemented using `useEffect + setTimeout`
- 300ms delay after typing stops

**Benefits:**
- Prevents unnecessary filtering on every keystroke  
- Avoids UI lag  
- Provides natural typing experience  

---

#### useMemo for Filtering
- Search results are derived using `useMemo`

**Why:**
- Prevents re-filtering on unrelated re-renders (scroll, expand, etc.)
- Ensures efficient computation over 500 items

---

### 3. DOM Highlighting (Safe Rendering)
- Built a custom `HighlightText` component
- Uses `<span>` and `<mark>` tags
- No `dangerouslySetInnerHTML`

**Benefits:**
- Prevents XSS risks  
- Works seamlessly with React rendering  
- Clean and maintainable  

---

### 4. Keyboard Accessibility
Fully supported keyboard navigation:

- **Arrow Up / Down**
  - Navigate results
  - Wraps around list boundaries  

- **Enter**
  - Expand/collapse selected comment  

- **Escape**
  - Close overlay instantly  

**Additional:**
- Auto-scroll into view using `scrollIntoView`
- Prevents default browser scrolling behavior

---

### 5. Smart Network Handling
- Uses **AbortController** to cancel fetch requests if component unmounts

**Prevents:**
- Memory leaks  
- React state update warnings  

**Error recovery:**
- If fetch fails → show error  
- Closing & reopening overlay retries automatically  

---

## Why These Decisions?

### One-Time Fetch + Caching
- 500 items is small → ideal for client-side filtering  
- Eliminates network latency  
- Makes UI feel **instant**

---

### Debouncing Instead of Immediate Filtering
- Improves typing experience  
- Reduces unnecessary computations  
- Keeps UI responsive  

---

### No External Libraries
- Keeps bundle size small  
- Demonstrates core React + DOM understanding  
- Maintains full control over behavior  

---

## Trade-offs & Limitations

### 1. Single-Session Caching
- Data does not refresh after initial fetch  
- Acceptable for static APIs  
- Not suitable for live/dynamic data  

**Future fix:**
- Add polling or WebSocket updates  

---

### 2. Simple Substring Matching
- Case-insensitive `.includes()` search  

**Limitations:**
- No fuzzy matching  
- No typo tolerance  

**Future fix:**
- Integrate Fuse.js or similar  

---

### 3. Recursive Highlighting
- Clean implementation but not optimal for very large text  

**Risk:**
- Deep recursion may affect performance  

**Future fix:**
- Replace with iterative parsing approach  

---

### 4. Non-overlapping Matches
- Highlight logic does not handle overlapping patterns  
- Works well for standard use cases  

---

## Clean Resource Management
- Fetch cancellation via `AbortController`

**Prevents:**
- Stale updates  
- Console warnings  
- Memory leaks  

---

## Summary
This feature focuses on:
- **Performance (debounce + memoization)**
- **UX (instant results + keyboard navigation)**
- **Security (no HTML injection)**
- **Simplicity (no external dependencies)**

A clean, production-ready implementation for moderate-sized datasets.