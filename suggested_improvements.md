# Suggested Improvements for "Today"

Based on an assessment of the codebase, here are a few recommended technical and UX improvements that could elevate the "Today" app further:


## 2. Subtasks & Nested Items
Lists often have a hierarchy (e.g., "Groceries" -> "Fruit" -> "Apples").
**Suggestion:** Allow items to be indented to create subtasks. This would help users organize more complex lists without needing multiple separate lists.

## 3. Shared Lists & Collaboration
Currently, lists are private to the user.
**Suggestion:** Implement a sharing feature where users can invite others (via email/link) to view or edit a specific list. This is essential for household grocery lists or small team projects.

## 4. Priority Levels & Visual Coding
Not all tasks have the same urgency.
**Suggestion:** Add priority flags (Low, Medium, High) with subtle color coding (e.g., a small vertical bar on the left of the item). This helps users scan the list for "must-dos" quickly.

## 5. Natural Language Parsing (Dates/Times)
Typing "Call mom tomorrow at 5pm" requires manual tracking of the time.
**Suggestion:** Use a library like `chrono-node` to detect dates and times in the item text and automatically set reminders or sort them into a "Scheduled" section.

## 6. Voice Memos & Audio Attachments
Sometimes users are on the go and can't type.
**Suggestion:** Add a small microphone icon to record a short audio snippet attached to a todo item. This could be transcribed or simply played back later.
