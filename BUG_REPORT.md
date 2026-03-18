# Bug Report - TeamPulse

## 1. Header Notifications State Bug

- **Visible Symptom**: Clicking any notification in the dropdown always shows the detail for the last item in the list, regardless of which one was clicked.
- **Root Cause**: In `utils/helpers.ts`, `bindNotificationHandlers` used a `var i` in a `for` loop to create closure handlers. Because `var` has function scope, by the time the handlers were executed, `i` evaluated to `notifications.length` for all of them.
- **Fix**: Replaced the `for` loop with `notifications.map(n => () => onSelect(n.id))`. This ensures each handler captures the correct `id` lexically.

## 2. Notification Dropdown Z-Index Issue

- **Visible Symptom**: When opening the notification dropdown, it was covered by elements like Member Detail Modal or Toasts.
- **Root Cause**: The `.header` element creates a stacking context with `z-index: 100`. The modal had `z-index: 1000`. Thus, the entire header (including the `99999` z-index dropdown inside it) was painted below the modal and toasts.
- **Fix**: Increased `.header` `z-index` to `100000` in `Header.css` so it sits above all other page content.

## 3. App Mobile Responsiveness / Sidebar Overflow

- **Visible Symptom**: On narrow viewports (e.g., 360px), the content area became too small, squeezing everything uncomfortably.
- **Root Cause**: The `.sidebar` component had a fixed `min-width: 240px` and no media queries to hide or stack it on mobile, leaving very little room for `.main-content`.
- **Fix**: Added media queries in `App.css` and `Sidebar.css` to switch `.app-body` to a column layout and make the sidebar responsive (`100%` width) on screens smaller than `768px`.

## 4. Member Cards Horizontal Scrollbar

- **Visible Symptom**: Long names or tag combinations in MemberCards could potentially cause a horizontal scrollbar.
- **Root Cause**: Unbroken text like `Bartholomew Christophersen-Vandenberg` forces the container width to expand without wrapping.
- **Fix**: Added `word-break: break-word` to `.member-card__name` in `MemberCard.css`.

## 5. Member Grid Column Initialization

- **Visible Symptom**: Dashboard started with 3 columns by default even on mobile screens until a resize event occurred.
- **Root Cause**: In `Dashboard.tsx`, `gridCols` was statically initialized to `3` without checking `window.innerWidth`. The resize listener also lacked cleanup.
- **Fix**: Extracted the column calculation into a helper function `getCols()`, used it for initial state, and added proper `removeEventListener` cleanup in `useEffect`.

## 6. Standup Timer Drift and Stacking

- **Visible Symptom**: Dashboard standup timer would drift because of stale closures and could speed up (stack) if the user navigated away and back.
- **Root Cause**: `StandupTimer` used `setInterval` referencing a stale `timeLeft` state without functional state updates (`prev => prev - 1`), and it failed to `clearInterval` on unmount, causing multiple intervals to run concurrently.
- **Fix**: Refactored `StandupTimer.tsx` to recalculate the actual seconds remaining every second (`getSecondsUntilStandup()`), effectively preventing any drift, and added cleanup for the interval.

## 7. Member Grid Infinite Loop

- **Visible Symptom**: Browser froze/slowed down rapidly on Dashboard due to React infinite re-renders.
- **Root Cause**: The `useEffect` dependency array in `MemberGrid.tsx` was `[{ status: filters.status, role: filters.role }]`. Creating an inline object on every render yields a new reference, re-triggering the effect endlessly.
- **Fix**: Flattened the dependency array to use the primitive string values directly: `[filters.status, filters.role]`.

## 8. Stale State on Bookmark Click

- **Visible Symptom**: Rapidly clicking the bookmark star could result in incorrect toggles.
- **Root Cause**: `handleBookmark` used the stale closure reference of `bookmarks`.
- **Fix**: Refactored to use the functional state update form `setBookmarks(prev => { ... })`.

## 9. Incorrect Bookmark Count

- **Visible Symptom**: The `Bookmarked: X` count in the member grid counted all bookmarked members in the app instead of just the visible/filtered ones.
- **Root Cause**: It rendered `bookmarks.size` directly.
- **Fix**: Calculated a `visibleBookmarks` count by checking how many of the currently displayed members have `bookmarked: true`.

## 10. Activity Feed Sorting and Note Unlinking

- **Visible Symptom**: When sorting the feed by Oldest/Newest, inline notes stayed in the same DOM position, appearing unlinked to their correct activity.
- **Root Cause**: The `ActivityFeed.tsx` map loop used the array `index` as the React `key`. When the array order changed, React recycled the DOM elements improperly without moving the attached uncontrolled `defaultValue` of the input.
- **Fix**: Changed the `key` to use `activity.id`.

## 11. Batch Assign Role Parallel Failures

- **Visible Symptom**: The "Batch Assign Role" executed requests but could crash silently on an inner promise and showed success prematurely.
- **Root Cause**: Used `memberIds.forEach(async ...)` which runs fire-and-forget Promises without `await` block from the `forEach`.
- **Fix**: Rewrote `batchAssignRole` in `batchOperations.ts` to use `Promise.allSettled`, properly awaiting all requests and returning a count of exactly how many failed vs succeeded.

## 12. Modal State Mutation (Tag Sharing)

- **Visible Symptom**: Adding a tag to one member inadvertently added that tag to other members with the same initial tag array reference.
- **Root Cause**: `MemberModal` used `const updated = { ...selectedMember }; updated.tags.push(...)`. This mutated the shared `tags` array reference in memory.
- **Fix**: Safely cloned the array inside the update: `tags: [...selectedMember.tags, newTag.trim()]`.

## 13. Status Badge Readability

- **Visible Symptom**: The "Active" status badge had white text on a light green background, making it hard to read.
- **Root Cause**: In `index.css`, `--status-active-text` was strictly `#ffffff`.
- **Fix**: Changed it to a dark green `#064e3b` for contrast.

## 14. Header Search Input React Warning

- **Visible Symptom**: "A component is changing an uncontrolled input to be controlled" console warning.
- **Root Cause**: `query` state was initialized as `undefined`.
- **Fix**: Initialized `query` as `''`.

## 15. Header Search API Race Conditions

- **Visible Symptom**: Outdated search results could overwrite newer ones due to API latency variances. Stale results remained if navigating away.
- **Root Cause**: The `setTimeout` lacked a `clearTimeout` cleanup, and the asynchronous promise `.then` callbacks did not check if the effect was still active.

## 16. Data Loading & Error States Missing

- **Visible Symptom**: Blank screens while data was loading or failed strings were not handled.
- **Root Cause**: `MemberGrid` and `ActivityFeed` did not use available `loading` or `error` state properties when fetching from the mock API.
- **Fix**: Added UI indicators for loading and fetching failures using robust `isActive` cleanups to prevent state updates on unmounted components.

## 17. Filter State Mutation Bug

- **Visible Symptom**: Selecting filters (Status or Role) from the Sidebar didn't immediately update the Member Grid.
- **Root Cause**: In `FilterContext.tsx`, `updateFilter` directly mutated the `filters` state object (`filters[key] = value`) and called `setFilters(filters)`. Because the reference was identical, React bailed out of the update.
- **Fix**: Replaced the mutation with a functional immutable state update: `setFilters(prev => ({ ...prev, [key]: value }))`.

## 18. Tag Persistence and Removal Bug

- **Visible Symptom**: Adding a new tag in the Member Modal only updated the local modal state. Closing and reopening the modal caused the new tag to disappear. Additionally, there was no way to remove tags.
- **Root Cause**: The modal updated its local `selectedMember` state without a mechanism for the parent `MemberGrid` (which holds the source of truth for the member list) to sync the updated object. Furthermore, `saveMember` was not called to persist the changes to the mock backend.
- **Fix**: Passed `updatedMember` down from `Dashboard.tsx` to `MemberGrid.tsx` to patch the memory-resident `members` array dynamically when edited in the modal. Imported `saveMember` from the mock API and tracked state to the backend on every tag change. Added an `&times;` icon to tags and implemented an `onClick` removal handler (`handleRemoveTag`).

## 19. Activity Feed Inline Notes Persistence

- **Visible Symptom**: Typing an inline note on the Activity Feed did not save. Navigating away and back or re-rendering would clear the note.
- **Root Cause**: The `<input>` element was uncontrolled (`defaultValue`) and had no `onChange` / `onBlur` listeners to capture the value. Additionally, the mock API had no endpoint to update an activity note.
- **Fix**: Exported `updateActivityNote` from `mockApi.ts` to patch the in-memory backend. Upgraded the `<input>` to a controlled component via `onChange` mapping over local state, and hooked the `onBlur` event to push the update to the mock backend.

## 20. Batch Assign Role UI Feedback Missing

- **Visible Symptom**: Clicking "Batch Assign Role" showed a success toast, but left all the checkboxes checked, making it look like the action had no physical effect on the feed context.
- **Root Cause**: The checkbox selection array (`selectedIds`) was never cleared upon the successful resolution of the batch action.
- **Fix**: Included `setSelectedIds([])` inside the success callback of `batchAssignRole` to visually reset the UI layer.

## 21. Header Search Click Not Functional

- **Visible Symptom**: Clicking on a searched member in the Header dropdown did not do anything.
- **Root Cause**: The Header component had no `onClick` handler for search results, and could not open the `MemberModal` because the `selectedMember` state was isolated strictly inside the `Dashboard` component.
- **Fix**: Lifted the `selectedMember` state up to `App.tsx` and threaded it down to both `Header` (as `onSelectMember` callback) and `Dashboard` (as state props). Clicking a search result now selects the member, switches to the Dashboard tab if necessary, and immediately opens their detailed modal.

## 22. Notification Dropdown Clicks and Persistence

- **Visible Symptom**: Clicking a notification did not display any useful detail. Furthermore, clicking outside of the dropdown failed to close it automatically.
- **Root Cause**: The dropdown lacked a `click-outside` event listener. The notification items themselves updated a basic local `selected` state instead of routing to the member profile that generated the notification.
- **Fix**: Implemented a `useRef` and `mousedown` `document` listener in the `Header` to close the dropdown when clicking outside. Wired the notification `onClick` handler to fetch the corresponding `Member` object from the mock API via a new `fetchMemberById` function, and subsequently dynamically open their detailed `MemberModal`.

## 23. Bookmark Persistence Loss

- **Visible Symptom**: When a user clicks the bookmark star on a member, the star highlights successfully. However, if the user switches to the Activity tab and comes back to the Dashboard, all bookmarks disappear.
- **Root Cause**: The `MemberGrid` component tracked bookmarks inside a strictly volatile local `Set` component state, entirely ignoring the physiological `bookmarked` boolean property attached to the `Member` payload. Triggering the star only mutated the local Set and never synchronized the change with the API. Changing tabs thus unmounted the grid, wiping the local set.
- **Fix**: Removed the local `bookmarks` `Set` state variables completely. Rewrote the handler to natively toggle the underlying `bookmarked` flag directly on the `Member` object within the primary grid state, and enforced immediate continuity by dispatching it to the mock database via `saveMember(nextMember)`.

## 24. Bookmark Hover Background Asymmetry

- **Visible Symptom**: Hovering the cursor over the bookmark star caused the gold highlight background to expand into a non-uniform, asymmetrical shape instead of a clean bounding box.
- **Root Cause**: The `.member-card__bookmark` button relied purely on uniform `padding: 4px` surrounding a font-icon. Because the star glyph's intrinsic height/width aspect ratios vary depending on the font engine, the padding yielded a non-square computed box.
- **Fix**: Replaced the fluid padding with absolute `width: 32px; height: 32px;` dimensions, and utilized `display: flex; align-items: center; justify-content: center;` to mathematically suspend the star in the dead center of a guaranteed perfect square.

## 25. Toast Notification Animation Bypass

- **Visible Symptom**: Toast notifications snapped into existence instantly instead of sliding in from the right gracefully as designed.
- **Root Cause**: The React `ToastItem` component mounted into the DOM with the `.toast--visible` CSS class already attached immediately. Because CSS `transition` algorithms only trigger when a property changes _after_ the element is painted to the screen, applying the final state during the initial mount bypassed the animation engine completely.
- **Fix**: Replaced the static CSS `transition` property with a dedicated CSS `@keyframes slideIn` animation set to execute purely on the element's mount. Stripped the useless `.toast--visible` wrapper class out of the `ToastContainer.tsx` markup entirely.

## 26. Modal Missing Escape Key Dismissal

- **Visible Symptom**: Pressing the 'Escape' key while the Member Detail Modal was open did nothing, unlike the Search Overlay which correctly handled it.
- **Root Cause**: The modal lacked a global `keydown` event listener attached to the window to capture keyboard shortcuts while mounted.
- **Fix**: Implemented a standard `useEffect` hook listening to `window.addEventListener('keydown')` that triggers the `onClose` prop specifically when `e.key === 'Escape'` is detected. Included rigorous event teardown on unmount to prevent memory leaks.

## 27. Member Modal Layout Asymmetry (UI/UX)

- **Visible Symptom**: The "Status" and "Team" labels in the detail modal were uncentered, utilized inconsistent text sizes, and "Team" often appeared misaligned relative to the name above it.
- **Root Cause**: The modal relied on a generic column-flex info row that didn't provide enough visual structure for tabular-style metadata. Furthermore, it used raw text for status instead of the defined status badges.
- **Fix**: Refactored the modal body to use a dedicated `.member-modal__stats-box` panel. Integrated the same dynamic CSS status badges used in the main grid and utilized clear vertical label-value pairings with deliberate padding and background tints to create a professional "Profile" aesthetic.

## 28. Batch Operation UI Blocking (UI/UX)

- **Visible Symptom**: Clicking "Batch Assign Role" gave no indication that a long-running process was happening (since it waits for all promises). A user could click it multiple times, potentially triggering hundreds of redundant API calls.
- **Root Cause**: The button lacked a "Loading" or "Disabled" state while the `Promise.allSettled` block was awaiting fulfillment.
- **Fix**: Introduced an `isBatching` React state variable. The button now dynamically changes its label to **"Saving all..."** and disables itself entirely until the successful/error toast is delivered, preventing race conditions and redundant execution.

## 29. Search Comments Error State Persistence Bug

- **Visible Symptom**: If the JSONPlaceholder API fetch fails on first opening the Search overlay, closing and reopening the overlay shows the error message indefinitely. The fetch never retries, and there's no way to recover without refreshing the entire page.
- **Root Cause**: The fetch logic in `SearchOverlay.tsx` checked `if (comments.length === 0 && !error)` before attempting to fetch. Once `error` was set during a failed fetch attempt, this condition permanently blocked all subsequent fetch attempts, even after closing and reopening the overlay.
- **Fix**: Removed the `&& !error` check from the fetch condition. Now it only checks `if (comments.length === 0)`. Additionally, `setError(null)` is called immediately before the fetch attempt, clearing any prior error state. This allows users to recover from transient network failures by simply closing and reopening the search overlay.

## 30. Search Comments Stale State Updates on Unmount

- **Visible Symptom**: If the user closes the Search overlay while a network request is in flight, React may warn "Can't perform a React state update on an unmounted component" in the console, and stale response handlers could set state after the component leaves the DOM.
- **Root Cause**: The fetch in the `useEffect` lacked cleanup logic. If a fetch was initiated and the overlay was closed before the response completed, the `.then()` and `.catch()` callbacks would still execute, attempting state updates on an unmounted component tree.
- **Fix**: Wrapped the fetch with an `AbortController` and passed its `signal` to the fetch options. The cleanup function returned from the `useEffect` now calls `controller.abort()` when the effect tears down. The catch handler checks `if (err.name !== 'AbortError')` before setting error state, preventing stale state mutations on unmounted components.
