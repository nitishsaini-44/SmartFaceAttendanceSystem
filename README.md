# 🎓 Smart FaceAttendance System

A **real-time face recognition–based attendance system** built using **Python**, **InsightFace** .  

The system allows you to **register students**, **recognize faces via webcam**, **mark attendance automatically**, and **manage student records**.

---

## 📂 Project Structure

Smart FaceAttendance/
│
├── attendance/
│ └── attendance.csv
│
├── database/
│ ├── embeddings.pkl
│ └── students.csv
│
├── images/
│ ├── image.jpg
│
├── models/
│ └── insightface_model.py
│
├── add_student.py
├── recognize_attendance.py
├── remove_student.py
├── utils.py
├── requirements.txt
└── README.md


---

## 🚀 Features

- Real-time face recognition using webcam
- Automatic attendance marking
- GPU support with CPU fallback
- Duplicate attendance prevention
- Student enrollment and removal
- Persistent storage using Pickle and CSV

---

## 🧠 Technologies Used

- Python 3.10
- InsightFace (`buffalo_l` model)
- OpenCV
- NumPy
- Pandas
