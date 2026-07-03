<div align="center">

# 🩺 EchoCare – AI-Powered Healthcare Companion

### *Every patient story deserves to be heard.*

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB.svg)]()
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)]()
[![Google OAuth](https://img.shields.io/badge/Auth-Google%20OAuth-red.svg)]()
[![JWT](https://img.shields.io/badge/Security-JWT-green.svg)]()
[![AI Powered](https://img.shields.io/badge/AI-Gemini%20API-orange.svg)]()

**An AI-powered healthcare companion that helps users document, understand, and monitor their health journey through explainable AI insights, daily health tracking, and personalized wellness recommendations.**

</div>

---

# 📖 Table of Contents

- Overview
- Problem Statement
- Solution
- Key Features
- System Workflow
- Technology Stack
- Project Architecture
- Folder Structure
- Installation
- Environment Variables
- Running the Project
- Screenshots
- Future Scope
- Team
- Hackathon Journey
- AI Tools Used
- Disclaimer
- License
- Acknowledgements

---

# 📌 Overview

EchoCare is an AI-powered healthcare companion designed for individuals experiencing persistent health concerns despite normal medical reports or inconclusive diagnoses.

Instead of replacing healthcare professionals, EchoCare acts as a digital health companion by helping users document their health journey, organize medical records, monitor daily health activities, receive explainable AI insights, and prepare for more informed consultations with medical professionals.

---

# 🚨 Problem Statement

Millions of people suffer from symptoms that significantly impact their daily lives while routine medical tests often return normal results.

Many patients experience:

- Persistent symptoms
- Multiple doctor visits
- Normal laboratory reports
- Difficulty explaining their complete health history
- Uncertainty about which specialist to consult next

Traditional consultations are often time-limited, making it difficult for healthcare providers to capture the complete patient story.

EchoCare aims to bridge this communication gap by helping users organize and understand their health journey over time.

---

# 💡 Solution

EchoCare provides a centralized platform where users can:

- Record their complete health story
- Maintain their medical history
- Upload medical reports
- Track daily health activities
- Receive AI-generated health insights
- Understand medical reports
- Monitor health trends
- Receive wellness recommendations
- Identify appropriate healthcare departments

All AI-generated insights are based solely on user-provided information and are intended to support—not replace—professional medical advice.

---

# ✨ Key Features

## 🔐 Secure Authentication

- Google OAuth Login
- JWT Authentication
- Secure Session Management

---

## 📝 Patient Story Analyzer

Allows users to document:

- Complete health history
- Symptoms
- Previous consultations
- Pain points
- Emotional concerns
- Lifestyle habits

---

## 📋 Initial Health Survey

Collects

- Medical history
- Current symptoms
- Sleep habits
- Diet
- Physical activity
- Stress levels
- Existing conditions

---

## 📅 Daily Health Tracker

Monitor

- Sleep
- Mood
- Stress
- Diet
- Water Intake
- Medication
- Exercise
- Symptoms
- Energy Level

---

## 📄 Medical Report Analysis

Supports

- Laboratory Reports
- Blood Reports
- Diagnostic Reports
- Medical Prescriptions

Provides

- Simplified summaries
- Important observations
- Easy-to-understand explanations

---

## 🤖 Explainable AI Health Insights

Analyzes

- Patient Story
- Daily Health Logs
- Lifestyle
- Medical Reports

Provides

- Health observations
- Pattern recognition
- Confidence Score
- Explainable reasoning
- Supporting evidence

---

## 🩺 Medical Department Recommendation

Suggests appropriate healthcare departments such as

- General Physician
- Neurology
- Cardiology
- Gastroenterology
- Dermatology
- Orthopedics
- Psychiatry
- ENT

---

## ❤️ Personalized Wellness Recommendations

Recommendations include

- Healthy diet
- Better sleep habits
- Exercise
- Stretching
- Stress reduction
- Hydration
- Healthy routines

---

## 📊 Personalized Dashboard

Displays

- Health Score
- Daily Tracking
- Sleep Analysis
- Activity Trends
- AI Insights
- Medical Reports
- Recommendations
- Health Timeline

---

## 🌿 Stress Support

Dedicated support modules for

- Workplace Stress
- Family Stress

Includes

- Communication guidance
- Burnout self-check
- Wellness activities

---

## 🧘 Self-Care Tools

- Grounding Exercises
- Breathing Exercises
- Journaling
- Relaxation Activities

Private by design with no reporting trail.

---

# 🔄 System Workflow

```text
User Registration
        │
        ▼
Google OAuth Authentication
        │
        ▼
Health Profile Creation
        │
        ▼
Patient Story Submission
        │
        ▼
Initial Health Survey
        │
        ▼
Daily Health Tracking
        │
        ▼
Medical Report Upload
        │
        ▼
AI Health Analysis
        │
        ▼
Explainable AI Insights
        │
        ▼
Department Recommendation
        │
        ▼
Health Dashboard
```

---

# 🛠 Technology Stack

## Frontend

- React.js / Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Recharts

---

## Backend

- FastAPI
- Python

---

## Authentication

- Google OAuth 2.0
- JWT Authentication

---

## AI & Machine Learning

- Google Gemini API
- spaCy
- Transformers
- Sentence Transformers

---

## Database

- PostgreSQL
- MongoDB

---

## OCR & Report Processing

- PyMuPDF
- EasyOCR

---

## Deployment

- Vercel
- Render
- Docker

---

# 🏗 Project Architecture

```text
Users
   │
   ▼
Frontend (React + Tailwind)
   │
   ▼
Google OAuth + JWT
   │
   ▼
FastAPI Backend
   │
   ├──────────────┐
   ▼              ▼
AI Engine      Business Logic
   │              │
   └──────┬───────┘
          ▼
Database Layer
(PostgreSQL + MongoDB)
          │
          ▼
Cloud Storage
```

---

# 📂 Folder Structure

```text
EchoCare/

├── frontend/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── assets/
│   └── styles/
│
├── backend/
│   ├── auth/
│   ├── api/
│   ├── ai/
│   ├── services/
│   ├── database/
│   └── models/
│
├── docs/
│
├── screenshots/
│
├── README.md
│
└── LICENSE
```

---

# 🚀 Installation

Clone Repository

```bash
git clone https://github.com/badri-2005/DOS-Finals.git

cd DOS-Finals
```

Install Frontend

```bash
npm install
```

Install Backend

```bash
pip install -r requirements.txt
```

---

# 🔑 Environment Variables

Create a `.env` file.

```env
GOOGLE_CLIENT_ID=

GOOGLE_CLIENT_SECRET=

JWT_SECRET=

DATABASE_URL=

MONGODB_URI=

GEMINI_API_KEY=
```

---

# ▶ Running the Application

Frontend

```bash
npm run dev
```

Backend

```bash
uvicorn main:app --reload
```

Visit

```
http://localhost:3000
```

---

# 📸 Screenshots

## Landing Page

*(Add Screenshot)*

---

## Dashboard

*(Add Screenshot)*

---

## Patient Story

*(Add Screenshot)*

---

## Daily Health Tracker

*(Add Screenshot)*

---

## AI Health Insights

*(Add Screenshot)*

---

## Medical Report Analysis

*(Add Screenshot)*

---

# 🎥 Demo

Add your demo video here.

---

# 🔮 Future Enhancements

- Smartwatch Integration
- Wearable Device Support
- Voice-Based Story Recording
- Hospital Integration
- Electronic Health Record Integration
- AI Predictive Analytics
- Mobile Applications
- Multi-language Support
- Doctor Portal
- Appointment Scheduling

---

# 👥 Team

| Team Member | Role |
|-------------|------|
| **Kavin V S** | Project Manager |
| **Savita S** | Business Analyst |
| **Rahul K** | AI/ML Architect |
| **Badri Narayanan B R** | Fullstack Developer |
| **Ruban Prakasam J** | Software Tester |

---

# 🏆 Hackathon Journey

## What We Learned

- Healthcare system analysis
- Explainable AI
- Secure authentication
- User-centered design
- Longitudinal health tracking

---

## Challenges

- Processing unstructured patient stories
- Building transparent AI recommendations
- Managing healthcare data securely
- Designing an intuitive healthcare experience

---

## Achievements

- Built a complete AI healthcare companion.
- Developed explainable AI workflows.
- Designed a scalable architecture.
- Created a patient-first user experience.

---

# 🤖 AI Tools Used

- ChatGPT
- Google Gemini
- GitHub Copilot
- Figma AI

All AI-generated content and code were reviewed, validated, and customized by the development team.

---

# ⚠ Disclaimer

EchoCare is intended to support users in organizing and understanding their health information.

It does **not** provide medical diagnoses and should **not** replace consultation with qualified healthcare professionals.

All AI-generated analyses, recommendations, summaries, and insights are generated solely from user-provided information and may contain inaccuracies.

Always consult a licensed healthcare professional before making medical decisions.

---

# 📄 License

This project is licensed under the MIT License.

---

# 🙏 Acknowledgements

Special thanks to:

- **Descience Open Source Club (DOS)** for organizing the hackathon.
- Our mentors and judges for their valuable feedback.
- The open-source community for providing amazing frameworks and tools.



### ⭐ If you like this project, don't forget to give it a Star!

## ❤️ Every patient story deserves to be heard.

