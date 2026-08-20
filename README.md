# 🏛️ UPSC CSE 2028 Command Center (PWA)

A mobile-first, full-stack Progressive Web Application (PWA) engineered specifically for **B.Tech CSE students balancing college workloads with UPSC Civil Services Examination preparation**. Built using Vite, React, TypeScript, Tailwind CSS, and powered by Google's Gemini API via edge functions.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![PWA Ready](https://img.shields.io/badge/PWA-Supported-emerald.svg)
![React](https://img.shields.io/badge/React-18.x-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)

---

## ✨ Core Features

### ⚡ 1. 15-Minute Lecture-Gap Sprint Engine
Designed for 10–15 minute free gaps between college classes. Launches three high-yield quick modes:
- **Active Recall Flashcards:** Practice 5 flashcards from your weakest subject.
- **1-Page High-Yield News Summary:** Crisp GS2/GS3 current affairs summaries.
- **3-MCQ Drill:** Instant UPSC-style prelims questions with AI-generated explanations.

### 🧠 2. Active Recall Vault (Spaced Repetition System)
- Anki-style flashcard engine powered by the **SuperMemo-2 (SM-2)** algorithm.
- Rate card recall difficulty (`Again`, `Hard`, `Good`, `Easy`) to automatically recalculate review queues.
- **Batch AI Generation:** Single-tap generation of 30-card decks from any topic or textbook chapter using Gemini API.

### 💬 3. AI Mentor "Prep" (Voice & Chat)
- Persistent AI study partner trained for UPSC CSE context.
- **Speech-to-Text Input:** Tap to speak with Prep while walking between lecture halls.
- **Proactive Nudge Engine:** Evaluates daily hours. If B.Tech coursework pushes study targets behind, Prep recalibrates weekly plans automatically.

### ✍️ 4. Interactive Mains Answer Sandbox & AI Grading
- Daily 10/15-marker Mains questions with live 150-word count indicators.
- **Vision OCR Upload:** Snap a photo of physical handwritten answer sheets to receive instant AI scoring (out of 10), structure feedback, and missing keyword reports.

### 📊 5. B.Tech vs. UPSC Time Audit
- Multi-device study logging: `B.Tech (IIIT Nagpur)` vs `UPSC Prep`.
- **Chart.js Analytics:** Visualizes trailing 7-day balance with automatic warning banners if weekly UPSC study hours drop below 15 hours.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion
- **PWA & Offline:** Web Manifest, Service Worker caching, LocalStorage/IndexedDB offline sync
- **AI Engine:** Google Gemini API (`gemini-2.5-flash`) via edge serverless functions
- **Database:** Bolt Database (PostgreSQL / RLS enabled for multi-device sync)
- **Charts:** Chart.js / React-Chartjs-2

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm
- A free **Gemini API Key** from [Google AI Studio] (https://aistudio.google.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/YOUR-USERNAME/upsc-2028-command-center.git](https://github.com/YOUR-USERNAME/upsc-2028-command-center.git)
   cd upsc-2028-command-center
