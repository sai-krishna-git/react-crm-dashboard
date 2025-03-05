# react-crm-dashboard

🚀 A full-stack CRM dashboard built with React, Node.js, and Express.js, providing an intuitive interface for customer relationship management.

---

## Table of Contents  
- [About the Project](#about-the-project)  
- [Project Structure](#project-structure)  
- [Features](#features)  
- [Installation & Setup](#installation--setup)  
- [Running the Application](#running-the-application)  
- [Technologies Used](#technologies-used)  
- [API Endpoints](#api-endpoints)  
- [Contributing](#contributing)  
- [License](#license)  

---

## About the Project  
The React CRM Dashboard is designed to manage customer interactions efficiently. It provides:  
✅ **User Authentication & Authorization (JWT)**  
✅ **Role-Based Access Control (RBAC)**  
✅ **Secure API for User Data Management**  
✅ **Modern UI with React & TailwindCSS**  

The project consists of:  
- **Backend**: A RESTful API built with **Node.js, Express.js, and MongoDB**  
- **Frontend**: A responsive dashboard built with **React.js & TailwindCSS**  

---

## Project Structure  
```bash
react-crm-dashboard
│── backend/
│   ├── config/
│   │   ├── connectDB.js
│   │   ├── db.js
│   ├── controllers/
│   │   ├── userController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   ├── routes/
│   │   ├── userRoutes.js
│   ├── package.json
│   ├── server.js
│
│── frontend/
│   ├── build/
│   ├── static/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.js
│   │   ├── index.js
│   ├── package.json
│   ├── tailwind.config.js

```


⸻

## Features

✅ User Authentication & Authorization (JWT)
✅ Role-Based Access Control (RBAC)
✅ Secure REST API for User Management
✅ Modern UI with React.js & TailwindCSS
✅ Database Management using MongoDB
✅ Efficient State Management

⸻

## Installation & Setup

1️⃣ Clone the Repository
```bash
git clone https://github.com/ShashankByalla/react-crm-dashboard.git
cd react-crm-dashboard
```
2️⃣ Install Backend Dependencies
```bash
cd backend
npm install
```
3️⃣ Install Frontend Dependencies
```bash
cd ../frontend
npm install
```


⸻

## Running the Application

1. Start the Backend Server
```bash
cd backend
npm start
```
Backend will be running on http://localhost:5000.

2. Start the Frontend Server
```bash
cd frontend
npm start
```
Frontend will be available at http://localhost:3000.

⸻

## Technologies Used

Technology	Purpose
React.js	Frontend UI
TailwindCSS	Styling
Node.js	Backend Server
Express.js	API Framework
MongoDB	Database
JWT	Authentication
PostCSS	CSS Processing



⸻

## API Endpoints

Method	Endpoint	Description
POST	/api/users/register	Register a new user
POST	/api/users/login	User login
GET	/api/users/profile	Get user profile (protected)



⸻

## Contributing

Contributions are welcome! Please follow these steps:
	1.	Fork the repository
	2.	Create a new branch:

git checkout -b feature-branch


	3.	Commit your changes:

git commit -m "Added feature"


	4.	Push the branch:

git push origin feature-branch


	5.	Submit a Pull Request

⸻

## License

This project is licensed under the MIT License.

