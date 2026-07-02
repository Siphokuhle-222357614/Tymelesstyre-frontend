# Tymelesstyre — Frontend

A Vue.js frontend for **TymelessTyre**, a full-stack e-commerce platform for purchasing tyres online and booking automotive services.

> 🚧 **Status:** Frontend refactor currently in progress. Backend API is stable and running.

---

## About

TymelessTyre allows customers to browse and purchase tyres online and schedule automotive service appointments. This repository contains the Vue.js client that consumes the Spring Boot REST API.

The backend repository lives here → [TymelessTyre](https://github.com/Siphokuhle-222357614/TymelessTyre)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Vue.js 3 |
| Build Tool | Vite |
| Language | JavaScript |
| Markup | HTML5 |
| Styling | CSS3 |
| Linting | ESLint |
| Formatting | Prettier |
| API Communication | REST |

---

## Features

- Tyre product listings and browsing
- Product detail views with pricing
- Order placement flow
- Automotive service booking interface
- Communicates with the Spring Boot backend API

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- [TymelessTyre backend](https://github.com/Siphokuhle-222357614/TymelessTyre) running on `http://localhost:8080`

### Installation

1. Clone the repository

```bash
git clone https://github.com/Siphokuhle-222357614/Tymelesstyre-frontend.git
cd Tymelesstyre-frontend
```

2. Install dependencies

```bash
npm install
```

3. Start the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for production

```bash
npm run build
```

---

## Project Structure

```
src/
├── assets/
├── components/
├── views/
├── router/
├── stores/
├── services/
└── App.vue
public/
index.html
vite.config.js
```

---

## Development Notes

This frontend is actively being refactored for improved UI/UX and code quality. The backend API is fully functional — all current work is on the client side.

---

## Related Repository

⚙️ **Backend:** [TymelessTyre](https://github.com/Siphokuhle-222357614/TymelessTyre) — Spring Boot 3 REST API with JWT authentication

---

## Team

| Role | GitHub |
|------|--------|
| Project Lead | [@Siphokuhle-222357614](https://github.com/Siphokuhle-222357614) |
| Developer | [@222582731](https://github.com/222582731) |
| Developer | [@BonkeBulana](https://github.com/BonkeBulana) |
| Developer | [@Ofentselebaka](https://github.com/Ofentselebaka) |
| Developer | [@phelomadubela](https://github.com/phelomadubela) |
