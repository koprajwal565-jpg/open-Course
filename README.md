# open-Course

This repository now contains the OpenHub project: a beginner-friendly open-source contribution portal that helps students discover public GitHub issues, learn Git basics, and prepare for their first pull request.

## OpenHub overview

OpenHub is a beginner-friendly open-source contribution portal that helps students discover public GitHub issues, understand beginner labels, and learn the practical Git workflow behind a first pull request.

### Features

- Public GitHub issue discovery with keyword search and filters
- Beginner-friendly issue highlighting with clear label guidance
- First Pull Request cheat sheet and checklist flow
- Beginner Git basics section with safe examples and common mistakes
- Light/dark theme, responsive layout, and copy-to-clipboard commands
- Demo mode fallback when GitHub rate limits or network issues block live data

### Tech stack

- React + Vite + TypeScript
- Tailwind CSS
- Lucide React
- Vitest + React Testing Library

## Local development

1. Install dependencies:
   npm install
2. Start the dev server:
   npm run dev
3. Open the local URL shown in the terminal.

## Environment variables

This app uses public GitHub REST endpoints only. No secret keys are required for the MVP.

Copy the sample file and adjust if needed:

cp .env.example .env

## Testing

Run the test suite:

npm run test -- --run

Run the production build:

npm run build

Run linting:

npm run lint

## Deployment

This project is static and can be deployed on free-tier-compatible hosts such as:

- Vercel
- Netlify
- GitHub Pages

## Limitations

- Live issue discovery depends on GitHub API availability and rate limits.
- Beginner labels are assigned by repository maintainers and are not a guarantee of difficulty or accessibility.
- No GitHub login or private repository access is required for the public issue search workflow.

## Security and Git safety

- Public GitHub endpoints are used by default.
- No tokens or secrets are stored in frontend code.
- Destructive Git actions are not used in this project workflow.
