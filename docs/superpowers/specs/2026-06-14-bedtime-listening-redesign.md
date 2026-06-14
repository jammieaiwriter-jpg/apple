# Bedtime Listening Redesign

## Goal

Turn the bedtime page into a child-operated audio bedtime story experience. The child taps once, sees one simple theme word with Zhuyin beside each character, and then listens as the screen gradually darkens. Language learning happens naturally through the story rather than through bedtime exercises.

## Nightly Experience

1. The opening screen shows the story title and one large theme word, such as `勇氣`.
2. Each character in the theme word has vertical Zhuyin displayed on its right side.
3. The child taps one primary button: `開始今晚的故事`.
4. The narrator introduces the theme word in one short sentence and begins the complete story automatically.
5. The theme word remains visible for about 20 seconds, then the screen gradually darkens.
6. During playback there are no questions, choices, vocabulary boxes, hints, scores, or required parent actions.
7. Tapping the dark screen briefly reveals playback controls, then returns to the dim listening state.
8. The story ends with a plot-specific calming passage and goodnight line.

## Story Content

- Each night contains one complete, low-tension story with a beginning, development, resolution, and calming ending.
- Target listening duration is approximately 8 to 10 minutes after mobile speech-rate calibration.
- Each story has one theme word. The word and related expressions recur naturally in the narration without explicit teaching.
- Stories are prepared and reviewed before publishing.
- The nightly screen does not display the complete story text.

## Weekend Experience

- Parent-child interaction lives on a separate weekend review screen.
- The review shows the week's theme words and short story reminders.
- Prompts invite conversation about favorite characters, moments, and ideas.
- It does not grade, score, or record the child's ability.

## Visual Design

- Keep the existing dark, warm bedtime palette.
- Make the theme word the visual focus before playback.
- Display Zhuyin vertically to the right of each corresponding Chinese character.
- Fade content and controls gradually after playback begins, leaving a very dark screen suitable for bedside listening.
- Respect iPhone safe areas and keep the reveal gesture simple.

## Playback Behavior

- One tap starts the whole nightly sequence.
- Speech uses `speechSynthesis` with `zh-TW`.
- Playback progresses automatically through all narration sections.
- The app clearly exposes pause/resume and restart when controls are temporarily revealed.
- Progress is stored locally so an interrupted story can be resumed.
- Speech errors restore visible controls and show a calm retry message.

## Data Model

Each nightly story stores:

- stable story ID and title
- theme word split into characters with Zhuyin
- a short spoken introduction
- ordered narration sections
- a plot-specific wind-down section
- adult review status
- optional weekend conversation prompts

Nightly narration does not store choice branches, secret hints, target-word exercises, or assessment state.

## Verification

- Automated contract tests confirm the new story schema and absence of bedtime interaction language.
- Automated browser checks confirm that starting playback enters dim mode and that tapping reveals controls.
- Mobile visual verification confirms right-side Zhuyin, safe-area spacing, readable opening word, and sufficiently dark listening mode.
- Timed mobile playback confirms the story lasts approximately 8 to 10 minutes.

## Out Of Scope

- Voice recording or speech recognition
- Adaptive difficulty based on child behavior
- Nightly questions or choices
- Full story text shown during playback
- Parent dashboards or ability tracking
