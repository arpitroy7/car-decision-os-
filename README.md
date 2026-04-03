
# 🚗 CarDecisionOS

An AI-powered decision engine that compares vehicles based on user-defined priorities and delivers a clear recommendation, confidence score, reasoning, and trade-offs.

---

## 🌐 Live Demo

👉 https://car-decision-os.vercel.app

---

## 🧠 Overview

Choosing the right car is complex — too many options, conflicting priorities, and unclear trade-offs.

CarDecisionOS transforms user preferences into structured AI-driven decisions.

Instead of raw specifications, it answers:
- Which car is best for you?
- Why is it better?
- What are the trade-offs?

---

## ❌ Problem

- Generic comparison platforms lack personalization  
- Users struggle to balance multiple decision factors  
- Information overload leads to poor decisions  

---

## ✅ Solution

- Accepts user-defined priorities (1–10 sliders)  
- Applies AI-driven comparative reasoning  
- Produces a single best recommendation  
- Explains why it wins and what it sacrifices  

---

## 🤖 Why This is an AI Agent

CarDecisionOS functions as an autonomous decision agent:

- Takes structured input (cars + priorities)  
- Performs reasoning using AI (Groq LLaMA 3)  
- Applies weighted decision logic  
- Produces a final decision with explanation  

Workflow:
**Input → Reason → Decide → Output**

---

## ✨ Features

- Multi-car comparison (2–3 vehicles)  
- Priority-weighted scoring system  
- AI-powered decision engine  
- Confidence-based recommendation  
- Explainable reasoning output  
- Trade-off analysis  
- Best-fit vs not-ideal segmentation  
- Dynamic comparison matrix  
- Robust fallback handling  

---

## ⚙️ How It Works

### 1. Input Layer
  - User enters car names  
  - Adjusts priorities  

### 2. Processing Layer
  - Validates input  
  - Structures weights  

### 3. AI Engine
  - Compares vehicles  
  - Applies scoring logic  
  - Forces differentiation  

### 4. Output Layer
  - Returns best car  
  - Displays confidence and reasoning  

---

## 🏗 System Architecture

```text
User (Browser)
        │
        ▼
Frontend (HTML + CSS + JS)
        │
        ▼
API Layer (/api/decision)
        │
        ▼
AI Engine (LLaMA 3.3 70B Versatile)
        ├── Planner (priority structuring)
        ├── Reasoning Engine (comparison logic)
        ├── Validator (output verification)
        ▼
Structured JSON Response
        │
        ▼
UI Rendering (Results + Insights + Matrix)
```
----
## 🛠 Tech Stack

| Category        | Technology                     | Purpose                          |
|----------------|-------------------------------|----------------------------------|
| Frontend       | HTML, CSS, JavaScript         | User interface                   |
| Backend        | Vercel Serverless Functions   | API handling & logic             |
| AI Engine      | Groq API (LLaMA 3.3 70B Versatile)            | Decision-making & reasoning      |
| Deployment     | Vercel                        | Hosting & deployment             |
| Version Control| Git & GitHub                  | Source code management           |

---
## 📁 Project Structure

```text
car-decision-os/
├── api/
│   └── decision.js        # API logic (AI decision engine)
├── index.html             # Main frontend UI
├── script.js              # Frontend logic
├── style.css              # Styling
├── package.json           # Dependencies & config
├── package-lock.json      # Lock file
├── .env                   # Environment variables (API key)
├── .gitignore             # Git ignored files
└── README.md              # Project documentation
```

## ⚙️ Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/arpitroy7/car-decision-os.git
cd car-decision-os
