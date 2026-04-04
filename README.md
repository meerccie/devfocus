
```
devfocus
├─ backend
│  src
 ┣ modules
 ┃ ┗ github
 ┃ ┃ ┣ application
 ┃ ┃ ┃ ┗ ports
 ┃ ┃ ┃ ┃ ┗ github-repository.port.ts
 ┃ ┃ ┣ domain
 ┃ ┃ ┃ ┗ models
 ┃ ┃ ┃ ┃ ┣ github-repo.entity.ts
 ┃ ┃ ┃ ┃ ┣ github-user.entity.ts
 ┃ ┃ ┃ ┃ ┗ security-issue.entity.ts
 ┃ ┃ ┣ infrastructure
 ┃ ┃ ┃ ┣ adapters
 ┃ ┃ ┃ ┃ ┗ github-octokit.adapter.ts
 ┃ ┃ ┃ ┣ controllers
 ┃ ┃ ┃ ┃ ┗ github.controller.ts
 ┃ ┃ ┃ ┣ mappers
 ┃ ┃ ┃ ┃ ┗ github-user.mapper.ts
 ┃ ┃ ┃ ┣ services
 ┃ ┃ ┃ ┃ ┣ cache.service.ts
 ┃ ┃ ┃ ┃ ┣ github-logger.service.ts
 ┃ ┃ ┃ ┃ ┣ security-scanner.service.ts
 ┃ ┃ ┃ ┃ ┗ severity-scorer.service.ts
 ┃ ┃ ┃ ┗ types
 ┃ ┃ ┃ ┃ ┗ github-graphql-user.interface.ts
 ┃ ┃ ┗ github.module.ts
 ┣ app.module.ts
 ┗ main.ts
└─ frontend
src/
 ┣ assets
 ┃ ┣ hero.png
 ┃ ┣ main.css
 ┃ ┣ vite.svg
 ┃ ┗ vue.svg
 ┣ components
 ┃ ┣ base
 ┃ ┃ ┣ BaseButton.vue
 ┃ ┃ ┗ BaseInput.vue
 ┃ ┗ github
 ┃ ┃ ┣ RepoCard.vue
 ┃ ┃ ┣ SecurityIssueItem.vue
 ┃ ┃ ┗ UserProfile.vue
 ┣ services
 ┃ ┗ github.service.ts
 ┣ types
 ┃ ┣ repository.ts
 ┃ ┣ security.ts
 ┃ ┗ user.ts
 ┣ App.vue
 ┗ main.ts

```
# DevFocus Monorepo

A full-stack application built with a focus on clean architecture and modern web standards.

## 🚀 Tech Stack
- **Backend:** NestJS, TypeScript, Github GraphQL API (Hexagonal Architecture)
- **Frontend:** Vue 3, Vite, Tailwind CSS
- **Tools:** Git, NPM

## 📂 Project Structure
- `/backend`: The core API following Hexagonal (Ports & Adapters) principles.
- `/frontend`: The user interface built with Vue and styled with Tailwind.

## 🛠️ Getting Started
1. Clone the repo.
2. Run `npm install` in both `/backend` and `/frontend`.
3. Configure your `.env` files (see `.env.example`).
