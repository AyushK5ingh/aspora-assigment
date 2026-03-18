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
