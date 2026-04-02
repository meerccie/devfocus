
```
devfocus
├─ backend
│  ├─ .prettierrc
│  ├─ dist
│  │  ├─ app.module.d.ts
│  │  ├─ app.module.js
│  │  ├─ app.module.js.map
│  │  ├─ main.d.ts
│  │  ├─ main.js
│  │  ├─ main.js.map
│  │  ├─ modules
│  │  │  └─ github
│  │  │     ├─ application
│  │  │     │  └─ ports
│  │  │     │     ├─ github-repository.port.d.ts
│  │  │     │     ├─ github-repository.port.js
│  │  │     │     └─ github-repository.port.js.map
│  │  │     ├─ domain
│  │  │     │  └─ models
│  │  │     │     ├─ github-user.entity.d.ts
│  │  │     │     ├─ github-user.entity.js
│  │  │     │     └─ github-user.entity.js.map
│  │  │     ├─ github.module.d.ts
│  │  │     ├─ github.module.js
│  │  │     ├─ github.module.js.map
│  │  │     └─ infrastructure
│  │  │        ├─ adapters
│  │  │        │  ├─ github-octokit.adapter.d.ts
│  │  │        │  ├─ github-octokit.adapter.js
│  │  │        │  └─ github-octokit.adapter.js.map
│  │  │        ├─ controllers
│  │  │        │  ├─ github.controller.d.ts
│  │  │        │  ├─ github.controller.js
│  │  │        │  └─ github.controller.js.map
│  │  │        ├─ mappers
│  │  │        │  ├─ github-user.mapper.d.ts
│  │  │        │  ├─ github-user.mapper.js
│  │  │        │  └─ github-user.mapper.js.map
│  │  │        ├─ services
│  │  │        │  ├─ github-logger.service.d.ts
│  │  │        │  ├─ github-logger.service.js
│  │  │        │  └─ github-logger.service.js.map
│  │  │        └─ types
│  │  │           ├─ github-graphql-user.interface.d.ts
│  │  │           ├─ github-graphql-user.interface.js
│  │  │           └─ github-graphql-user.interface.js.map
│  │  └─ tsconfig.build.tsbuildinfo
│  ├─ eslint.config.mjs
│  ├─ folder-structure.txt
│  ├─ nest-cli.json
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ README.md
│  ├─ src
│  │  ├─ app.module.ts
│  │  ├─ main.ts
│  │  └─ modules
│  │     └─ github
│  │        ├─ application
│  │        │  └─ ports
│  │        │     └─ github-repository.port.ts
│  │        ├─ domain
│  │        │  └─ models
│  │        │     └─ github-user.entity.ts
│  │        ├─ github.module.ts
│  │        └─ infrastructure
│  │           ├─ adapters
│  │           │  └─ github-octokit.adapter.ts
│  │           ├─ controllers
│  │           │  └─ github.controller.ts
│  │           ├─ mappers
│  │           │  └─ github-user.mapper.ts
│  │           ├─ services
│  │           │  └─ github-logger.service.ts
│  │           └─ types
│  │              └─ github-graphql-user.interface.ts
│  ├─ test
│  │  ├─ app.e2e-spec.ts
│  │  └─ jest-e2e.json
│  ├─ tsconfig.build.json
│  └─ tsconfig.json
└─ frontend

```
# DevFocus Monorepo

A full-stack application built with a focus on clean architecture and modern web standards.

## 🚀 Tech Stack
- **Backend:** NestJS, TypeScript, PostgreSQL (Hexagonal Architecture)
- **Frontend:** Vue 3, Vite, Tailwind CSS
- **Tools:** Git, NPM

## 📂 Project Structure
- `/backend`: The core API following Hexagonal (Ports & Adapters) principles.
- `/frontend`: The user interface built with Vue and styled with Tailwind.

## 🛠️ Getting Started
1. Clone the repo.
2. Run `npm install` in both `/backend` and `/frontend`.
3. Configure your `.env` files (see `.env.example`).