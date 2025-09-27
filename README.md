# Quiz-App

Quiz-App is an advanced, AI-powered platform for creating, managing, and analyzing quizzes in educational settings. It empowers teachers to build engaging assessments, analyze student performance, and leverage data-driven insights, while providing students with a seamless quiz-taking experience and instant feedback.
**[Live Demo](https://quizzapp.ftp.sh/)**

![](/images/laptop_mockup.png)

---

## Table of Contents

- [Features](#features)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Folder Structure](#folder-structure)
- [Contributing](#contributing)
- [License](#license)

---
## Features

- **AI Quiz Generation:** Upload lecture files (PDF, DOCX, TXT) and let AI generate questions automatically using Gemini API.
- **Manual Quiz Creation:** Intuitive editor for building quizzes with MCQ, short answer, and numeric questions.
- **Authentication & Roles:** Secure login/register for teachers and students, with role-based access control.
- **Quiz Scheduling:** Set start/end times and optional PIN codes for quiz access.
- **Student Attempts:** Students join quizzes via code, submit answers, and receive instant feedback.
- **Advanced Analytics:**
  - Performance distribution
  - Confidence calibration
  - Question-level statistics
  - Exportable results
- **Responsive UI:** Modern, mobile-friendly design using React and Tailwind CSS.
- **Teacher Dashboard:** Manage quizzes, view attempts, and analyze results in one place.
- **Quiz Analysis:** Deep insights into student performance, question difficulty, and confidence vs. accuracy.
- **Public Quiz Access:** Students can join quizzes via code, even without an account.

---

## Screenshots & Highlights

> _Add your own screenshots below each section for visual reference._

### 1. Teacher Dashboard

- Overview of all created quizzes
- Quick access to analytics, attempts, and quiz editing
  

![](/images/teacher_dashbord.png)

### 2. Quiz Creation & AI Generation

- Manual question editor with support for LaTeX
- Upload lecture files for instant AI-generated questions
<!-- - [Add quiz creation/AI screenshot here] -->

### 3. Student Quiz Attempt

- Simple interface for answering questions
- Confidence slider for each answer
- Real-time feedback on submission
<!-- - [Add student attempt screenshot here] -->

### 4. Quiz Analytics & Results

- Performance distribution charts
- Confidence calibration graphs
- Question-level breakdowns
- Export results to CSV
<!-- - [Add analytics/results screenshot here] -->

### 5. Public Quiz Join

- Students join quizzes using a code
- Optional PIN protection
<!-- - [Add public join screenshot here] -->

---

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express, MongoDB
- **AI Integration:** Gemini API for automatic question generation
- **Authentication:** JWT-based, with protected routes
- **State Management:** Redux Toolkit

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB (local or cloud)

### Installation

1. **Clone the repository:**
	```sh
	git clone https://github.com/itsmoe15/Quiz-App.git
	cd Quiz-App
	```
2. **Install dependencies:**
	```sh
	cd backend && npm install
	cd ../frontend && npm install
	```
3. **Configure environment variables:**
	- Copy `.env.example` to `.env` in both `backend` and `frontend` folders and fill in required values (MongoDB URI, Gemini API key, etc).
4. **Start the backend server:**
	```sh
	cd backend
	npm start
	```
5. **Start the frontend dev server:**
	```sh
	cd frontend
	npm run dev
	```
6. **Access the app:**
	Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Usage

### For Teachers

- Register/login to access the dashboard
- Create quizzes manually or upload files for AI question generation
- Set quiz schedule, PIN, and settings
- View student attempts and analyze results
- Export analytics and results

### For Students

- Join quizzes using link (and PIN if required)
- Answer questions and set confidence for each
- Submit attempts and view instant feedback/results

---

## Folder Structure

- `backend/` — Express API, models, controllers, analytics, authentication
- `frontend/` — React app, pages, components, services, store

---

## Contributing

Pull requests are welcome! Please open issues for bugs or feature requests.

---

