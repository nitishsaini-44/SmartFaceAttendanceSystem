# 🎓 VidhyaSetu : Smart Attendance & LMS Platform

![Python](https://img.shields.io/badge/Python-3.10-blue?style=for-the-badge&logo=python)
![Streamlit](https://img.shields.io/badge/Streamlit-FF4B4B?style=for-the-badge&logo=streamlit)
![OpenCV](https://img.shields.io/badge/OpenCV-5C3EE8?style=for-the-badge&logo=opencv)
![OpenAI](https://img.shields.io/badge/GenAI-OpenAI%20GPT4-green?style=for-the-badge&logo=openai)
![InsightFace](https://img.shields.io/badge/InsightFace-Biometrics-orange?style=for-the-badge)

> **A Multi-Role Educational Platform merging Real-Time Face Recognition, Generative AI, and Voice Analytics.**

**EduFace AI** transforms traditional attendance systems into a smart **Role-Based Learning Management System (LMS)**. It automates attendance using **InsightFace** (SOTA biometrics) and empowers teachers with **Generative AI** to instantly create quizzes from curriculum PDFs and query student performance using natural **Voice Commands**.

---

## 🚀 Key Features by Role

### 👨‍🏫 **Teacher (The AI Command Center)**
* **Real-Time Attendance Dashboard:** Monitor live class attendance feeds.
* **Curriculum AI:** Upload PDF textbooks/notes; the system automatically generates **Quizzes** and **Lesson Plans** using GPT-4o.
* **Voice Analytics (Talk-to-DB):** Ask complex questions via voice (e.g., *"Who has attendance below 75% and failed the last quiz?"*) and get instant verbal/text reports generated via SQL agents.

### 👩‍🎓 **Student (Performance View)**
* **Personal Dashboard:** View own attendance logs and visual trends.
* **Performance Tracking:** Access quiz history and AI-generated progress summaries.

### 🏫 **Management (Oversight)**
* **Global Analytics:** Aggregate institution-wide attendance data.
* **Anomaly Detection:** Automated flagging of irregular patterns (e.g., frequent absentees).

---

## 🏗️ Architecture & Tech Stack

| Component | Tech Used | Purpose |
| :--- | :--- | :--- |
| **Biometrics** | `InsightFace`, `OpenCV` | Real-time Face Recognition & Liveness Detection |
| **Frontend/UI** | `Streamlit` | Interactive Web Dashboard for all roles |
| **Backend** | `Python`, `Pandas` | Core logic orchestration |
| **Database** | `SQLite` | Relational storage for Users, Attendance, Marks |
| **GenAI** | `OpenAI API`, `LangChain` | RAG for Quizzes & Natural Language-to-SQL |
| **Voice** | `OpenAI Whisper` | Speech-to-Text transcription for analytics |

---

## 📂 Project Structure

```plaintext
EduFace_AI/
│
├── app.py                   # Main Streamlit Web Application (The Dashboard)
├── auth.py                  # Role-based login logic
│
├── database/
│   ├── db_manager.py        # SQLite connection & Schema creation
│   ├── school.db            # The Relational Database (Replaces CSVs)
│   └── embeddings.pkl       # Face Embeddings storage
│
├── core_ai/
│   ├── face_rec_service.py  # Background service running the Webcam/InsightFace
│   ├── rag_engine.py        # PDF Parsing & Quiz Generation Logic
│   └── voice_agent.py       # LangChain SQL Agent for Voice Queries
│
├── utils/
│   ├── pdf_parser.py        # Extract text from uploaded PDFs
│   └── plot_utils.py        # Graphs for Student/Teacher Dashboards
│
├── requirements.txt
└── README.md
