# HRMS Lite Web-Based Internal HR Tool

## Project Overview
HRMS Lite is a lightweight internal HR tool for a single admin user. It supports employee record management and daily attendance tracking with a clean, professional interface. The backend exposes RESTful APIs with validation and meaningful error handling, while the frontend provides friendly UI states for loading, empty, and error conditions.

## Tech Stack
- **Frontend:** Vanilla HTML, CSS, and JavaScript
- **Backend:** Node.js + Express
- **Database:** SQLite

## Features
- Add, list, and delete employees.
- Mark daily attendance as present or absent.
- View attendance records per employee.
- Validation for required fields and email format.
- Duplicate employee ID handling and error responses with proper HTTP status codes.

## Running Locally
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   npm start
   ```
3. Open the app in your browser:
   ```
   http://localhost:3000
   ```

## API Endpoints
- `GET /api/employees`
- `POST /api/employees`
- `DELETE /api/employees/:id`
- `GET /api/attendance?employeeId=EMP-001`
- `POST /api/attendance`

## Assumptions & Limitations
- Single admin user with no authentication.
- Attendance records are fetched per employee ID.
- Deployment details must be filled in once hosted (see below).

## Deployment
- **Live Frontend URL:** _TODO_
- **Hosted Backend API URL:** _TODO_
- **GitHub Repository Link:** _TODO_

