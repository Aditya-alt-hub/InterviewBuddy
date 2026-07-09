
#  Interview Buddy

> **AI-Powered Mock Interview Platform** for Coding, Technical, and HR interviews with real-time AI evaluation, voice transcription, and personalized feedback.

---

#  Overview

Interview Buddy is an AI-powered mock interview platform that helps students and professionals prepare for technical interviews.

The platform simulates real interview experiences by generating Coding, Technical, and HR questions based on the selected role and experience level. Users can answer through voice or code, receive AI-powered evaluations, and review their performance after the interview.

---

#  Features

###  AI Interview Generation

- AI-generated interview questions
- Role-specific interviews
- Junior, Mid-Level, and Senior difficulty
- Coding, Technical & HR rounds

###  Voice Interviews

- Record answers using microphone
- Speech-to-text transcription
- AI evaluates spoken responses

### Coding Interviews

- Coding challenges
- Multi-language support
- AI code evaluation

Supported languages:

- Java
- Python
- JavaScript
- TypeScript
- C++
- C
- C#
- Go
- Kotlin
- Swift
- PHP
- Rust

###  AI Evaluation

- Answer scoring
- Code quality analysis
- Communication feedback
- Technical knowledge assessment
- Strengths & weaknesses
- Overall interview score

###  Authentication

- JWT Authentication
- Google OAuth Login
- Secure Password Hashing (bcrypt)

###  Session Management

- Create interview sessions
- Resume incomplete interviews
- Interview history
- Review completed interviews

###  Real-Time Updates

- Socket.IO integration
- Live interview status
- Instant AI evaluation updates

---

# 🛠 Tech Stack

## Frontend

- React 19
- Vite
- Redux Toolkit
- React Router
- Tailwind CSS
- Axios
- Socket.IO Client
- Monaco Editor
- React Toastify

---

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Multer
- Socket.IO
- Nodemailer
- Google OAuth

---

# AI Service

- FastAPI
- Python
- Google Gemini
- AssemblyAI
- Uvicorn

---

#  Project Architecture

```
Interview Buddy
│
├── frontend (React + Vite)
│
├── backend (Node.js + Express)
│
├── ai-service (FastAPI)
│
└── MongoDB
```

---

#  Folder Structure

```
InterviewBuddy/

│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── models/
│   ├── utils/
│   ├── uploads/
│   ├── package.json
│
├── ai-service/
│   ├── main.py
│   ├── requirements.txt
│
└── README.md
```

---

#  Installation

# Backend Setup

```bash
cd backend

npm install

npm run dev
```

---

# Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

---

# AI Service Setup

Create virtual environment

```bash
cd ai-service

python -m venv venv
```

Activate

Windows

```bash
venv\Scripts\activate
```

Linux/Mac

```bash
source venv/bin/activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

Run

```bash
uvicorn main:app --reload
```

---

# Environment Variables

## Backend (.env)

```env
PORT=5000

MONGO_URI=

JWT_SECRET=

EMAIL_USER=

EMAIL_PASS=

GOOGLE_CLIENT_ID=

CLIENT_URL=http://localhost:5173

AI_SERVICE_URL=http://localhost:8000
```

---

## Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api

VITE_GOOGLE_CLIENT_ID=
```

---

## AI Service (.env)

```env
GEMINI_API_KEY=

ASSEMBLYAI_API_KEY=
```

---

# API Endpoints

## Authentication

```
POST /users/register

POST /users/login

POST /users/google-login

GET /users/profile

PUT /users/profile
```

---

## Sessions

```
POST /sessions/createSession

GET /sessions/startSession

GET /sessions/SessionById/:id

POST /sessions/submitAnswer/:id

DELETE /sessions/deleteSession/:id
```

---

## AI Service

```
POST /transcribe
```

---

# Interview Flow

```
Login/Register

        │

        ▼

Create Interview

        │

        ▼

Generate AI Questions

        │

        ▼

Answer by Voice or Code

        │

        ▼

Speech Transcription

        │

        ▼

Gemini Evaluation

        │

        ▼

Store Results

        │

        ▼

Review Interview
```

---


#  Security

- JWT Authentication
- Password Encryption
- Protected Routes
- Google OAuth
- Input Validation
- Secure Environment Variables

---

#  Future Improvements

- Resume-based interview generation
- Company-specific interview preparation
- Personalized learning roadmap
- Weak topic detection
- AI interview analytics dashboard
- Video interview support
- Leaderboards
- Mock interview sharing
- PDF performance reports
- Multi-language interview support

---

#  Contributing

Contributions are welcome!

1. Fork the repository

2. Create a feature branch

```bash
git checkout -b feature/new-feature
```

3. Commit your changes

```bash
git commit -m "Added new feature"
```

4. Push

```bash
git push origin feature/new-feature
```

5. Open a Pull Request

---


#  Author

Aditya Bhadauria

