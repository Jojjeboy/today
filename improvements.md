# Suggested Improvements for "today"

Since the core concept of the app is exclusively about what needs to be done **today**, the user experience should heavily emphasize focus, urgency, and a clean slate. 

Here are some functional and UX improvements to double down on that concept:

## 1. The "Clean Slate" (Auto-Reset)
- **Daily Rollover/Archive:** At a configurable time (e.g., midnight or 3 AM), the main list should automatically clear. Completed tasks get archived to a "History" or "Done" view.
- **Unfinished Business:** Uncompleted tasks remain in a purgatory state or a separate section where the user has to explicitly decide whether to "Do it Today" or "Delete". This prevents the list from growing indefinitely.

## 2. Extreme Focus Mode
- **One Thing at a Time:** A mode that hides the entire list except for the single top-priority item. Removing visual clutter prevents the overwhelming feeling of a long list and builds momentum.
- **Pomodoro Timer Integration:** Add a built-in 25-minute timer to the currently active task so users can time-box their focus directly within the app.

## 3. Smarter Triage
- **"Snooze to Tomorrow" Swipe:** Allow users to swipe an item away if they realize it won't happen today. It disappears from the "today" list and pops back up the next morning.
- **Energy Level/Time Estimates:** Instead of just low/medium/high priority tags, allow users to tag tasks by required energy ("Quick Win", "Deep Work") or size ("5 min", "1 hr"). This helps them pick the right task for their current mental state.

## 4. Daily Review & Momentum
- **Evening Reflection:** A satisfying end-of-day summary popup that congratulates you on what you finished, and asks you to quickly process the remaining items (snooze, abandon, carry over).
- **Weekly Insights:** A lightweight dashboard showing how many tasks were completed versus pushed forward, to help users become more realistic about what they can actually fit into one day.

## 5. Better "Today Context"
- **Progress Ring / Visualization:** A prominent visual indicator (e.g., a progress circle around the app logo or header) that fills up as the day goes on and items are checked off.
- **Weather / Sunset Insight:** A subtle widget that shows when the sun sets or if rain is expected, helping users instinctively prioritize outdoor tasks earlier in the day.

## 6. Widget / Lock Screen Support
- Since it's a PWA/web app, ensure it has strong support for widgets or PWA push notifications (if turned into a native shell down the road) so the "today" list is always a glance away without having to open the app.
