# TeamPulse Dashboard 

TeamPulse is a single-page team activity dashboard built with React and TypeScript. This repository contains the submission for the Aspora Bug Hunt — Frontend Intern Assignment.

## Deployment & Repository
**Deployed Link (Placeholder):** https://vero-teampulse.vercel.app/
**GitHub Source:** https://github.com/ayush-aspora/team-pulse

## Time Log
- Setup & Discovery: ~1 hr
- Fixing Base Bugs (Navigation, Styling, API): ~2 hrs
- Infinite Loop & Memory Leaks Fixes: ~1.5 hrs
- Implementing "Search Comments" Feature: ~1 hr 
- Final Polishing & Persistence Fixes: ~1.5 hrs
- **Total Approx. Time Spent:** ~7 hours

## Core Achievements
1. **Identified and fixed 31 major bugs and UI/UX flaws** spanning the whole architecture: state mutation, closures, race conditions, memory leaks, invalid DOM hooks, CSS stacking contexts, layout issues, and mobile responsiveness logic.
2. Built a performant, purely React-driven **Search Overlay Component** to parse the `JSONPlaceholder` comments natively, with robust error recovery and proper fetch abort handling.
3. Enhanced aesthetics: adjusted contrast of statuses, implemented skeleton UI behaviors for networking latency, ensured the sidebar extends fully to the bottom, and integrated responsive behavior that works fluidly from 360px upwards.

## Choices, Trade-Offs, and Architecture
In approaching the search features and UI changes:
- I opted for `Promise.allSettled` to resolve the batch processing requirements safely, rather than refactoring the underlying mock promises structure. 
- Debouncing was kept vanilla. Instead of installing Lodash, I used an efficient `useEffect` timeout closure to keep overhead as minimal as possible. 
- For Highlighting, `dangerouslySetInnerHTML` was heavily avoided to maintain peak XSS-protection compliance, leaning on a recursive sub-string mapping approach which generates pure JSX `mark` nodes dynamically.

### Search Comments Feature Enhancements
- **Error Recovery:** Added automatic retry mechanism on API failures — users can close and reopen the search overlay to recover from transient network issues without requiring an explicit retry button or page refresh.
- **Fetch Abort Handling:** Integrated `AbortController` to cancel in-flight requests when the overlay closes, preventing stale state updates and console warnings. The error handler properly checks for `AbortError` before updating component state.
- **Caching Strategy:** The comments dataset is fetched once on first open and cached for the session lifetime. This prevents unnecessary API calls while maintaining responsiveness across all 500 items.
- **Strict XSS Compliance:** Avoids `dangerouslySetInnerHTML` entirely; all highlighting is rendered as proper DOM elements via a recursive component approach.

## What I'd Improve With More Time
- **Pagination / Virtualization:** Even though filtering 500 items fits fine dynamically with `useMemo`, rendering 500 DOM list items when typing "e" would cause minor browser layout jank. Implementing `react-window` or an intersection observer for data virtualization would be my immediate next step.
- **Global Data Store:** The application currently relies on isolated component-focused effects to hydrate data. Moving to robust caching architecture like `React Query` or a Context-backed data pipeline would streamline all data loading indicators and completely centralize errors.
- **Fuzzy Search:** The current `includes()` search is strict. Moving towards an algorithm like fuse.js would offer better resilience to typos.
- **Keyboard Focus Management:** Further refinement of keyboard navigation could include automatic focus preview as users arrow through results, similar to browser search implementations.

See the detailed `BUG_REPORT.md` and `FEATURE_NOTES.md` for complete technical breakdowns on fixes and the implementation phase.
