
## 🗂 Project Structure

```

project-root/
├── backend/        # Express + MongoDB backend
│   └── src/        # Backend source code
├── frontend/       # React (Vite) frontend
│   └── src/        # Frontend source code
└── README.md

````

# How to run the project (as of now) 🦦

## 🛠️ First-Time Setup

Clone the repo:
```bash
git clone https://github.com/your-username/ai-quiz-app.git
cd ai-quiz-app
````

### 1. Backend setup

```bash
cd backend
npm install
```

Start the backend in dev mode:

```bash
npm run dev
```

By default, backend runs on:
👉 [http://localhost:4000](http://localhost:4000)

---

### 2. Frontend setup

Open a second terminal:

```bash
cd frontend
npm install
```

Start the frontend dev server:

```bash
npm run dev
```

Vite will show the local dev URL (usually [http://localhost:5173](http://localhost:5173)).

---

## Running After Setup

Each time you want to run the project:

1. Start the backend:

   ```bash
   cd backend
   npm run dev
   ```
2. Start the frontend (in a new terminal):

   ```bash
   cd frontend
   npm run dev
   ```
3. Open the frontend URL from Vite’s output in your browser.