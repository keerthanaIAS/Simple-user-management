# Simple-user-management
User Management System
Technologies Used:
Frontend: React, TypeScript, Bootstrap, React-Toastify, Vite for fast performance and setup
Backend: Node.js, Express.js, MongoDB
State Management: React useState, useEffect
Features: Undo/Redo, User Management (Create, Edit, Delete), Export Table Data
Features:
User Table: Displays users with Name, Email, and Role.
Add User: Create a new user and save it in MongoDB.
Edit User: Modify existing user details.
Delete User: Remove a user from the table.
Undo/Redo Actions: Undo or redo user edits and deletions.
Export Data: Select users and export table data.
Error Handling & Notifications: Uses React-Toastify for alerts.
Setup Instructions:
Clone the repository
bash
Copy
Edit
git clone <repo-url>
cd project-folder
Install dependencies
bash
Copy
Edit
npm install
cd backend && npm install
Start the frontend & backend
bash
Copy
Edit
npm run dev
Notes:
Undo/Redo works for edit and delete actions.
Data is stored in MongoDB and synced after refresh.
Bootstrap is used for table styling.