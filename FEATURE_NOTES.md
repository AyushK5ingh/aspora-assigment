# Feature Notes - Search Comments

### What We Built

The "Search Comments" feature lets users search through 500 comments from JSONPlaceholder API in real-time. It's a fully functional search overlay that responds instantly to typing, highlights matching text, and supports keyboard navigation—all without any external UI libraries.

### Why These Decisions?

**1. Smart Data Loading (One-Time Fetch)**

Instead of fetching comments every time users open the search modal, we fetch once and keep them in memory. This makes the search feel instant because we're filtering 500 items locally on your device, not making network requests for each keystroke. The comments stay cached for the entire session, so subsequent searches are lightning-fast.

**2. Debouncing for Smooth Typing**

As you type, the search waits 300ms after you stop before filtering results. This means:
- No stuttering or lag while typing fast
- Results update naturally after a brief pause
- The "Searching..." message appears while you're mid-keystroke, so it feels responsive

Behind the scenes, we use a simple `useEffect` with `setTimeout`—no external debouncing library needed.

**3. Smart Rendering with useMemo**

The filter operation (checking which comments match your query) only runs when your search term actually changes. We don't re-filter the 500 items on every re-render caused by scrolling or expanding a result. This keeps everything smooth.

**4. True DOM Highlighting (No HTML Injection)**

The matched text is highlighted in yellow/bold. We build this purely with React components (`<span>` and `<mark>` tags), not by injecting raw HTML. This is safer (no XSS risk) and plays nicely with React's rendering engine.

**5. Full Keyboard Support**

- **Arrow Up/Down**: Navigate through results (wraps around at top/bottom)
- **Enter**: Expand/collapse the selected comment to read the full text
- **Escape**: Close the overlay instantly

The selection stays visible as you navigate, and the focused result auto-scrolls into view.

### Smart Recovery from Network Issues

If the API is temporarily down when you first open the search, you just get an error message. Close the overlay and open it again—it clears the error and tries to fetch again. No need to refresh the entire page.

### Trade-offs We Made

- **Single-Session Caching**: The comments dataset doesn't refresh if you close and reopen the overlay. This is fine for static data like JSONPlaceholder, but a real app with live data would need periodic updates or WebSocket support.

- **Simple Substring Matching**: We search by checking if your query appears anywhere in the comment (case-insensitive). For typo-tolerance or fuzzy matching, you'd need a library like Fuse.js.

- **Recursive Highlighting**: Very long comment bodies could theoretically cause performance issues due to how we recursively build the highlight spans. An iterative approach would be more future-proof, but our recursive solution is clean and works great for typical-length comments.

### Clean Resource Management

When you close the search overlay while a fetch is still in progress, we cancel the request using `AbortController`. This prevents React errors from stale callbacks trying to update a component that's already unmounted. It's the difference between a clean, professional experience and console warnings.

# Feature Notes - Search Comments

### Approach & Implementation

The "Search Comments" feature required hitting a public REST endpoint (`JSONPlaceholder /comments`) with 500 records and providing client-side search against the `body` field. Given the "standard React + DOM APIs only" constraint, the solution was built entirely with React hooks and plain CSS without any external headless UI or debouncing libraries.

**Core Decisions:**

1. **Client-Side Data Architecture:**
   - Instead of fetching per-keystroke, the API endpoint is hit *once* when the search overlay is opened (if the list is not already cached). This reduces network latency dramatically since the scope is fixed (500 items). The results are cached in local component state for the lifetime of the application since the overlay is mounted high up in the React DOM.
   
2. **Performance (Debouncing & useMemo):**
   - Implemented a custom debounce pattern using `useEffect` with `setTimeout`/`clearTimeout` hooked to the search input state.
   - Leveraged `useMemo` to construct the derived `results` array. This prevents running `.filter().toLowerCase()` on 500 items during arbitrary re-renders (like scrolling or expanding items).

3. **DOM Highlight Construction:**
   - To strictly fulfill the constraint of "DOM highlighting without injecting HTML strings (`dangerouslySetInnerHTML`)", a recursive `HighlightText` functional component was built.
   - It effectively slices strings cleanly around the query boundaries, outputting natural `<span>` and `<mark>` tags recursively.

4. **Keyboard Accessibility:**
   - Added robust viewport event listeners to trap the `Escape` key effectively.
   - Arrow-key navigation captures standard DOM focus with `event.preventDefault()` to prevent arbitrary scrolling while keeping the active selection visible via `.scrollIntoView({ block: 'nearest' })`. It correctly wraps the selection around endpoints.

### Trade-offs & Limitations

- Local caching without invalidation: Because `JSONPlaceholder /comments` is effectively immutable for our scope, we do not refetch data if the overlay is closed and reopened. For a live backend, periodic polling or WebSocket integration would be needed.
- Recursive Highlighting: While perfectly capable for an average paragraph in JSONPlaceholder, deeply recursive component calls on exceptionally large bodies could hit recursion limits or degrade React's diffing speed. An iterative parser would be safer in heavy production environments.
- Highlighting does not overlap: Currently if the highlighted string happens to overlap in some edge case, or ignores complex formatting, it is rudimentary. Given constraints, sticking to pure substring matching is acceptable.
