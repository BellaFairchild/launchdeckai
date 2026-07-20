# Manual QA Results

Track results for device and third-party test cases that cannot be automated.

---

## Onboarding Screens (feat/onboarding-screens)

**Branch:** feat/onboarding-screens  
**Build:** _TBD_  
**Tested by:** _TBD_  
**Date:** _TBD_

| # | Case | Status | Notes |
|---|------|--------|-------|
| 1 | Cold install, auth on: Landing → intent 0–2 → save-plan → Google/Apple/email → mission 3–6 → Deck | PENDING | |
| 2 | Kill app mid-intent (step 1): reopen → landing → Get Started resumes draft | PENDING | |
| 3 | Returning signed-in user: welcome back → Deck; second launch skips welcome back | PENDING | |
| 4 | Sign out with mission: landing → "I already have an account" → sign-in → welcome back | PENDING | |
| 5 | Demo mode (no Clerk key): still lands on Deck; no landing/sign-in | PENDING | |
| 6 | Onboarding: no Refuel modal; tertiary link on confirm only | PENDING | |
| 7 | First milestone (cadet): optional Commander spotlight once | PENDING | |
| 8 | Foundry lock / Signal export: existing Refuel modal unchanged | PENDING | |
| 9 | Reduced motion: no auto-advance on welcome back | PENDING | |

## Astro voice dock (2026-06-06)

- [ ] Dev-client rebuilt (`npx expo run:ios` / `run:android`) — module loads, no red screen.
- [ ] Onboarding step 0: Astro orb + bubble visible bottom-right; bubble shows the step-0 line.
- [ ] First mic tap prompts for mic + speech permission; granting starts dictation (orb mic turns teal, bubble shows "Listening…").
- [ ] Dictation **appends** to typed text (type "Habit app", then dictate "for indie devs" → field reads "Habit app for indie devs").
- [ ] **Keyboard coexistence:** with the keyboard open on steps 0–2, the orb stays visible and tappable above the keyboard.
- [ ] Steps 3–6 (platform/stage/date/confirm): orb shows coaching, **no** mic badge.
- [ ] Permission denied: a hint is acceptable; typing still works; no crash.
- [ ] Web (Chrome, `npm run web`): mic appears and dictation works via Web Speech API.
- [ ] Reduced motion ON (OS setting): orb does not animate; "Listening…" shown as a static label.
- [ ] VoiceOver/TalkBack: mic button announces "Dictate" / "Stop dictating".
