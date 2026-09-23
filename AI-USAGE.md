# AI usage

This project was built with AI assistance. This file records what was requested, what was kept or changed, and the commits that contain the work. It will be updated throughout all three finals weeks.

## 1. How I used AI

### 2026-09-23 - Requirements and Week 1 scope

- **Tool:** OpenAI Codex
- **What I asked for:** Read the finals lesson, templates, and rubrics; inspect the new project repository; and determine what had to be finished for the three Week 1 submissions.
- **What it gave back:** A requirements checklist and a plan to start from the official class template, deliver the client in demo mode first, and postpone the basketball database and real routes to the next increment.
- **What I kept, what I changed, and why:** I kept the template structure and demo-first scope because the class starter explicitly separates the Week 1 client from the later server integration. The initial idea of working on the entire backend immediately was dropped after the starter instructions were read.
- **Commit:** <https://github.com/Aegyog/Basketball-Live-Score-Stats-Tracker/commit/9b519a6>

### 2026-09-23 - React screens and components

- **Tool:** OpenAI Codex
- **What I asked for:** Build a minimalist, black-text basketball scoring interface based on the approved proposal, wireframes, and design system.
- **What it gave back:** A dashboard, game setup screen, live tracker, history, and summary, with reusable header, game card, scoreboard, roster, and play-log components.
- **What I kept, what I changed, and why:** I kept the five-screen flow and reusable component split. I also kept the restrained navy/orange palette and black body text because it matches the earlier planning documents and remains readable on mobile.
- **Commit:** <https://github.com/Aegyog/Basketball-Live-Score-Stats-Tracker/commit/9b519a6>

### 2026-09-23 - Mock data boundary and browser persistence

- **Tool:** OpenAI Codex
- **What I asked for:** Make Week 1 usable without pretending that the Express/PostgreSQL backend was complete, while keeping the React code ready for a real API.
- **What it gave back:** Matching mock and HTTP adapters, seeded games, `localStorage` persistence, stat recording, undo, quarter advancement, and game completion.
- **What I kept, what I changed, and why:** I kept the adapter boundary because the screens do not need to change when the real server is connected. Demo mode is clearly labeled so a reviewer is not misled about where the data is stored.
- **Commit:** <https://github.com/Aegyog/Basketball-Live-Score-Stats-Tracker/commit/9b519a6>

## 2. Where the AI got it wrong

### Case 1 - Finishing a game after a failed request

- **What it gave me:** The first `handleFinish` implementation always switched to the summary view immediately after calling the mutation helper.
- **What was wrong with it:** If the API call failed, the error was displayed but the screen still changed, making the game look final when it was not. That would be especially confusing after the real server is connected.
- **What I did instead:** The mutation helper now returns `true` on success and `false` on failure. `handleFinish` only changes the view when the update succeeds.
- **Commit:** <https://github.com/Aegyog/Basketball-Live-Score-Stats-Tracker/commit/9b519a6>

Two more genuine cases will be added as the server and database are implemented. They are not invented in advance.

## 3. Who wrote what

### Written by me

No meaningful self-authored code is claimed for Week 1. Codex produced most of the scaffold and client implementation. During Week 2 I need to write and explain at least one substantial part myself, such as the basketball validation rules, a safe PostgreSQL transaction, or an Express route, so the final project meets the course's 20% self-authored requirement.

### The AI-written part I understand best

- **File:** `client/src/api/mockApi.js`
- **Commit:** <https://github.com/Aegyog/Basketball-Live-Score-Stats-Tracker/commit/9b519a6>
- **What it does and why we kept it:** This module gives the React app the same asynchronous functions that the HTTP adapter exposes. Each update loads the saved games, creates a new game object instead of directly mutating React state, recalculates the relevant player and team score, saves the result to `localStorage`, and returns the updated game. The shared function names let the app switch to real HTTP requests later through one environment variable instead of rewriting the screens.
