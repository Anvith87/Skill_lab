# HostelOps 🏢

HostelOps is a full-stack complaint and operations management system designed for hostel environments.  
It enables students to submit complaints and allows administrators to monitor, analyze, and resolve them efficiently.

---

## 🚀 Features

### 👨‍🎓 Student Dashboard
- Submit complaints (category, priority, description)
- Track complaint status in real time
- View complaint history

### 🛠 Admin Dashboard
- View all complaints
- Filter by status, category, and priority
- Update complaint status
- Analytics dashboard with charts:
  - Complaints by Category (Bar Chart)
  - Status Distribution (Pie Chart)
  - Priority Breakdown (Donut Chart)
- Dynamic time-range filtering (Last 7 / 30 Days / All Time)
- Export complaints to CSV

---

## 🧠 Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn UI
- React Query
- Recharts

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication

---

## 🔐 Authentication

- Role-based authentication
- Student and Admin access control
- Protected routes
- Secure password hashing

---

## 📊 Analytics

The Admin dashboard includes:
- Real-time complaint statistics
- Time-range filtering
- Data visualization using Recharts
- CSV data export functionality

---

## 📁 Project Structure


hostel-diaries/
│
├── hostelops-backend/
│ ├── controllers/
│ ├── models/
│ ├── routes/
│ └── middleware/
│
└── hostelops-frontend/
├── src/
│ ├── components/
│ ├── pages/
│ ├── contexts/
│ ├── hooks/
│ └── services/


---

## ⚙️ Installation

### 1️⃣ Clone the Repository

```bash
git clone <your-repository-url>
2️⃣ Install Frontend Dependencies
cd hostelops-frontend
npm install
npm run dev
3️⃣ Install Backend Dependencies
cd hostelops-backend
npm install
npm run dev
🌍 Environment Variables

Create a .env file inside the backend folder:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
📈 Future Improvements

Real-time updates using Socket.io

Admin notes per complaint

Email notifications

Deployment on Vercel + Render

PDF export

👨‍💻 Author

Anvesh R Bekal
Full-Stack Developer | MERN Stack