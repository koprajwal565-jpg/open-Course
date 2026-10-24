# OpenHub Agent Guide

## Mission
Build and maintain the OpenHub beginner-friendly GitHub issues portal. Keep the UI polished, the GitHub integration read-only by default, and the Git workflow safe.

## Architecture
- Frontend: React + Vite + TypeScript
- Styling: Tailwind CSS
- Data source: Official GitHub REST API for public issue discovery only
- State: local component state and derived filters; no database required for MVP
- Testing: Vitest + React Testing Library

## Coding standards
- Prefer small, focused components and reusable helper functions.
- Keep accessibility in mind: use semantic HTML, labels, keyboard support, and visible focus states.
- Handle API errors, empty states, and loading states explicitly.
- Never introduce fake issue data or claim a label guarantees difficulty.
- Do not add auth or secrets to frontend code.

## Git and GitHub safety policy
- Read-only by default; do not require GitHub login for public issue discovery.
- Never expose tokens, private repository details, or credentials in code or chat.
- Never push, merge, or publish without explicit user confirmation.
- Never run destructive Git commands such as reset --hard, git clean -fd, or forced pushes.
- Respect local user work; never overwrite uncommitted changes.
- For any conflict, stop, explain the situation, and preserve both sides until the user decides the correct resolution.

## Test and validation commands
- npm install
- npm run test -- --run
- npm run build
- npm run lint

## Project-specific notes
- Use free-tier-compatible deployment approaches such as Vercel or Netlify for static app hosting.
- If live GitHub data is unavailable, show a clearly labelled demo mode rather than pretending mock data is live.
