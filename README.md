🚗 CarDecisionOS

An AI-powered decision engine that compares vehicles based on user priorities and delivers a clear recommendation, confidence score, reasoning, and trade-offs.

⸻

🌐 Live Demo

👉 https://car-decision-d1hydwl7q-arpits-projects-d909bdd2.vercel.app/

⸻

🧠 Overview

Choosing the right car is complex — too many options, conflicting priorities, and unclear trade-offs.

CarDecisionOS solves this by turning user preferences into structured AI-driven decisions.

Instead of showing raw specs, it answers:
	•	Which car is best for you?
	•	Why is it better?
	•	What are the trade-offs?

⸻

🚨 Problem
	•	Generic comparison websites lack personalization
	•	Users struggle to balance price, safety, mileage, and performance
	•	Too much data, not enough decision clarity

⸻

✅ Solution
	•	Accepts user-defined priorities (1–10 sliders)
	•	Applies AI-driven comparative reasoning
	•	Produces a single best recommendation
	•	Explains why it wins and what it sacrifices

⸻

✨ Features
	1.	🚗 Multi-car comparison (2–3 vehicles)
	2.	⚖️ Priority-weighted scoring system
	3.	🧠 AI-powered decision engine
	4.	📊 Confidence-based recommendation
	5.	💡 Explainable reasoning output
	6.	⚠️ Trade-off analysis
	7.	🎯 Best-fit vs not-ideal segmentation
	8.	📈 Dynamic comparison matrix
	9.	🛡️ Robust fallback handling (API failures)

⸻

⚙️ How It Works

1️⃣ Input Layer
	•	User enters car names
	•	Adjusts importance sliders (1–10)

2️⃣ Processing Layer
	•	Input validation & normalization
	•	Priority weights structured for AI

3️⃣ AI Decision Engine
	•	Compares vehicles using real-world logic
	•	Applies weighted scoring
	•	Forces differentiation (no identical outputs)

4️⃣ Response Validation
	•	Ensures strict JSON format
	•	Handles malformed outputs safely

5️⃣ Presentation Layer
	•	Displays best car with confidence
	•	Shows reasoning, trade-offs, and matrix

🏗️ System Architecture

User (Browser)
      │
      ▼
Frontend (HTML + CSS + JS)
      │
      ▼
API Layer (/api/decision)
      │
      ▼
AI Engine (Groq LLaMA 3)
      │
      ▼
Structured JSON Output
      │
      ▼
UI Rendering (Results + Insights + Matrix)

🛠 Tech Stack
	•	Frontend: HTML, CSS, JavaScript
	•	Backend: Vercel Serverless Functions
	•	AI Engine: Groq API (LLaMA 3)
	•	Deployment: Vercel
	•	Version Control: Git & GitHub

🚀 Installation & Setup

1️⃣ Clone Repository
git clone https://github.com/arpitroy7/car-decision-os.git
cd car-decision-os

2️⃣ Install Dependencies
npm install

3️⃣ Add API Key
GROQ_API_KEY=your_api_key_here

4️⃣ Run Locally
npx vercel dev



