# CareerPilot AI

> **Your AI Career Coach — Optimize. Match. Prepare. Get Hired.**

CareerPilot AI is a full-stack AI-powered career assistant that helps job seekers optimize their resumes, match them with job descriptions, prepare for interviews, and track job applications. The platform combines modern web technologies with Large Language Models (LLMs) and Retrieval-Augmented Generation (RAG) to deliver personalized career insights.

---

## ✨ Features

### 👤 User Management
- User Registration & Login
- Secure Authentication (Laravel Sanctum)
- User Profile Management

### 📄 Resume Management
- Upload Resume (PDF/DOCX)
- AI Resume Parsing
- Resume Editing
- Resume Version History
- Resume Preview

### 🤖 AI Resume Analysis
- ATS Score
- Resume Quality Analysis
- Missing Keywords Detection
- Resume Strengths & Weaknesses
- Professional Bullet Point Rewriting
- Resume Summary Generation

### 💼 Job Matching
- Paste Job Description
- AI Job Match Score
- Keyword Comparison
- Missing Skills Detection
- Experience Gap Analysis
- Salary Estimation

### ✍️ AI Cover Letter Generator
- Personalized Cover Letter
- Company-Specific Letter
- Multiple Writing Styles
- Export to PDF

### 🎤 AI Interview Preparation
- Technical Questions
- HR Questions
- Behavioral Questions
- Mock Interview
- AI Answer Evaluation
- Improvement Suggestions

### 📚 AI Learning Roadmap
- Skill Gap Analysis
- Personalized Learning Plan
- Weekly Learning Goals
- Career Growth Suggestions

### 💬 AI Resume Chat (RAG)
Ask questions such as:

- What are my strongest projects?
- Which experience should I highlight?
- Which skills are missing?
- Am I suitable for this job?
- Improve this experience section.

### 📊 Job Tracker
- Wishlist
- Applied
- Interview
- Offer
- Rejected
- Notes
- Interview Schedule

### 📈 Analytics Dashboard
- ATS Score Trends
- Applications Overview
- Interview Statistics
- Skill Analysis
- Resume Performance

---

# 🏗️ System Architecture

```
                React Frontend
                      │
             REST API (Laravel)
                      │
      ┌───────────────┴───────────────┐
      │                               │
 Authentication                  Business Logic
      │                               │
      └───────────────┬───────────────┘
                      │
                 AI Services
                      │
      ┌───────────────┴───────────────┐
      │                               │
 Resume Parser                Job Analyzer
 Cover Letter AI              Interview AI
 ATS Scoring                  Learning Coach
                      │
               Embedding Service
                      │
                 Vector Database
                      │
                   OpenAI API
```

---

# 🛠️ Tech Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- React Hook Form
- Chart.js

---

## Backend

- Laravel 13
- PHP 8.4
- Laravel Sanctum
- Laravel Queues
- Laravel Horizon
- Laravel Scheduler
- REST API

---

## Database

- PostgreSQL
- pgvector
- Redis

---

## AI

- OpenAI GPT
- OpenAI Embeddings
- Retrieval-Augmented Generation (RAG)
- Vector Search
- Prompt Engineering

---

## Storage

- Local Storage
- Amazon S3 (Optional)

---

## DevOps

- Docker
- Docker Compose
- GitHub Actions
- Nginx

---

# 📂 Project Structure

```
careerpilot-ai/

├── backend/
│   ├── app/
│   ├── routes/
│   ├── database/
│   ├── storage/
│   └── tests/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── docker/
├── docs/
└── README.md
```

---

# 📦 Database Tables

```
users

profiles

resumes

resume_chunks

job_descriptions

job_matches

applications

companies

skills

cover_letters

interviews

learning_paths

activity_logs
```

---

# 🔄 AI Workflow

```
Resume Upload
      │
      ▼
Extract Text
      │
      ▼
AI Resume Parser
      │
      ▼
Structured Resume JSON
      │
      ▼
Generate Embeddings
      │
      ▼
Store in Vector Database
      │
      ▼
AI Analysis
      │
      ▼
ATS Score
Job Match
Cover Letter
Interview Questions
Learning Roadmap
```

---

# 🧠 RAG Workflow

```
User Question

↓

Embedding

↓

Vector Search

↓

Retrieve Resume Chunks

↓

LLM

↓

Final Answer
```

---

# 📡 REST APIs

## Authentication

```
POST   /api/register

POST   /api/login

POST   /api/logout

GET    /api/profile
```

## Resume

```
POST   /api/resume/upload

GET    /api/resume

PUT    /api/resume

DELETE /api/resume
```

## AI

```
POST /api/ats-score

POST /api/job-match

POST /api/improve-resume

POST /api/cover-letter

POST /api/interview

POST /api/chat
```

## Applications

```
GET    /api/applications

POST   /api/applications

PUT    /api/applications/{id}

DELETE /api/applications/{id}
```

---

# 🚀 Roadmap

## Phase 1
- [ ] Authentication
- [ ] Dashboard
- [ ] Resume Upload

## Phase 2
- [ ] Resume Parser
- [ ] Resume Editor
- [ ] Job Description Upload

## Phase 3
- [ ] ATS Score
- [ ] Resume Improvement
- [ ] Cover Letter Generator

## Phase 4
- [ ] Interview Preparation
- [ ] Job Tracker
- [ ] Analytics Dashboard

## Phase 5
- [ ] RAG Chat
- [ ] Learning Roadmap
- [ ] Resume Versioning

## Phase 6
- [ ] Docker Deployment
- [ ] CI/CD Pipeline
- [ ] Production Release

---

# 💡 Future Enhancements

- AI Resume Builder
- LinkedIn Profile Import
- GitHub Portfolio Analysis
- Personalized Job Recommendations
- Voice Mock Interviews
- AI Career Coach
- Company Research Assistant
- Networking Suggestions
- Multi-language Resume Support
- Chrome Extension
- Mobile Application

---

# 📸 Screenshots

> Screenshots will be added after implementation.

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

**Shani Gajera**

Master's Student in Global Software Development

Backend Developer | Laravel | PHP | React | AI

---

## ⭐ If you like this project

Please consider giving it a ⭐ on GitHub!

It helps others discover the project and motivates further development.
