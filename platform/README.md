# VidyaSetu AI - Educational Platform

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://vidhyasetu.onrender.com/)

A comprehensive MERN-stack educational platform with role-based access control, integrating a face-recognition attendance system and AI-powered content/assessment features.

---

## 🔗 Live Demo

You can try the live demo here: **https://vidhyasetu.onrender.com/**

---

## 🎯 Features

### For Students
- View personal attendance records
- Track performance across quizzes
- Take AI-generated quizzes derived from uploaded curriculum
- View AI-powered feedback and suggested study-plan

### For Teachers
- Mark and manage student attendance (single/bulk)
- Upload curriculum PDFs and resources
- Generate quizzes from uploaded content (OpenAI-assisted)
- Generate lesson plans using AI
- Voice-enabled AI assistant for quick queries and analytics
- View class-wise performance and attendance reports

### For Management
- Complete user management (CRUD)
- Administrative dashboard and platform analytics
- Attendance & performance report exports (CSV/PDF)
- Role-based access and monitoring across classes

---

## 🏗️ Project Structure

```
platform/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── attendanceController.js
│   │   ├── performanceController.js
│   │   ├── resourceController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── uploadMiddleware.js
│   ├── models/
│   │   ├── Attendance.js
│   │   ├── Performance.js
│   │   ├── Resource.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── attendanceRoutes.js
│   │   ├── performanceRoutes.js
│   │   ├── resourceRoutes.js
│   │   └── userRoutes.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── context/
        │   └── AuthContext.js
        ├── layouts/
        │   └── Layout.js
        ├── pages/
        │   ├── auth/
        │   │   ├── LoginPage.js
        │   │   └── RegisterPage.js
        │   ├── student/
        │   │   ├── StudentDashboard.js
        │   │   ├── StudentAttendance.js
        │   │   ├── StudentPerformance.js
        │   │   └── StudentQuiz.js
        │   ├── teacher/
        │   │   ├── TeacherDashboard.js
        │   │   ├── TeacherAttendance.js
        │   │   ├── TeacherResources.js
        │   │   ├── TeacherStudents.js
        │   │   └── TeacherAIAssistant.js
        │   └── management/
        │       ├── ManagementDashboard.js
        │       ├── ManagementUsers.js
        │       └── ManagementReports.js
        ├── services/
        │   └── api.js
        ├── styles/
        │   └── index.css
        ├── App.js
        └── index.js
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (local or Atlas)
- OpenAI API Key (for AI features)
- [Optional] Python face recognition system to populate `face_encoding` vectors

### Backend Setup

1. Navigate to backend directory:

```bash
cd platform/backend
```

2. Install dependencies:

```bash
npm install
```

3. Create and configure `.env` (example):

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/vidyasetu
JWT_SECRET=your_jwt_secret_key
OPENAI_API_KEY=your_openai_api_key
```

4. Start development server:

```bash
npm run dev
```

> The backend will listen on `http://localhost:5000` by default.

### Frontend Setup

1. Navigate to frontend directory:

```bash
cd platform/frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the frontend:

```bash
npm start
```

> The frontend will run on `http://localhost:3000` (with proxy configured to `http://localhost:5000`).

---

## 📝 API Endpoints (Summary)

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current authenticated user
- `PUT /api/auth/profile` - Update profile

### Attendance
- `GET /api/attendance` - List attendance records (role-limited)
- `POST /api/attendance` - Mark single attendance
- `POST /api/attendance/bulk` - Bulk mark attendance
- `GET /api/attendance/stats` - Attendance statistics and trends

### Resources
- `GET /api/resources` - Get all resources
- `POST /api/resources/upload` - Upload curriculum PDFs (Multer)
- `POST /api/resources/:id/generate-quiz` - Generate quiz from resource (OpenAI)
- `POST /api/resources/:id/generate-lesson-plan` - Generate lesson plan (OpenAI)

### Performance
- `GET /api/performance` - Get performance records
- `POST /api/performance/submit-quiz` - Submit quiz answers
- `GET /api/performance/stats` - Performance analytics
- `POST /api/performance/ai-query` - AI-powered query for student data

### Users (Management)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get single user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/dashboard/stats` - Dashboard statistics

> Protect sensitive routes using `authMiddleware` and role checks in controllers.

---

## 🔐 Role-Based Access Matrix

| Feature | Student | Teacher | Management |
|---------|:-------:|:-------:|:----------:|
| View Own Attendance | ✅ | - | - |
| View Own Performance | ✅ | - | - |
| Take Quizzes | ✅ | - | - |
| Mark Attendance | ❌ | ✅ | ✅ |
| Upload Resources | ❌ | ✅ | ✅ |
| Generate Quiz/Plans | ❌ | ✅ | ✅ |
| AI Assistant | ❌ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ✅ |
| View All Reports | ❌ | ❌ | ✅ |

---

## 🛠️ Technologies

**Backend**
- Node.js, Express
- MongoDB & Mongoose
- JWT for authentication
- OpenAI API for quiz/lesson-plan generation
- Multer for file uploads
- pdf-parse for extracting text from PDFs

**Frontend**
- React 18
- React Router v6
- Axios for HTTP requests
- React Toastify for notifications
- Web Speech API for voice assistant

---

## 🔗 Face Recognition Integration

- The `User` model contains a `face_encoding` field (128-d vector) which the external Python-based face-recognition system can populate.
- A separate Python service (e.g., using `face_recognition` or `dlib`) processes webcam images, computes face encodings, and calls a backend endpoint (e.g., `POST /api/attendance/face`) to mark attendance based on a match.
- The backend verifies `face_encoding` similarity (cosine or euclidean distance threshold) before marking presence.

---

## 🧩 Deployment Notes

- Ensure `MONGODB_URI` points to a production-grade MongoDB Atlas cluster.
- Use environment variables on your hosting provider (Render/Heroku/Vercel) for secrets.
- For Render: create two services — one for backend (Node/Express) and one for frontend (static site or Node). Set `PORT` for backend and appropriate build commands for frontend (`npm run build` / serve).
- If you use HTTPS, configure OpenAI keys and callbacks to accept secure origins.

---

## 🧪 Testing

- Unit-test controllers and utility modules (Jest / Supertest recommended for backend endpoints).
- Use React Testing Library for key frontend flows (login, role-based pages, quiz flow).

---

## ✅ Contribution

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/awesome`
3. Commit your changes: `git commit -m "feat: add awesome feature"`
4. Push to the branch: `git push origin feature/awesome`
5. Open a Pull Request describing your changes

Please follow the existing code style and add tests where applicable.

---

## 📄 License

This project is released under the **MIT License**. See below.

```
MIT License

Copyright (c) 2025 VidyaSetu

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```


---

## Contact

If you have questions or need help setting up the project, open an issue or contact the maintainer.

**Live demo:** https://vidhyasetu.onrender.com/

---

*Generated README — modify as needed.*

