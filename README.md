# HR Attendance Portal

A lightweight HR management portal to manage:
- **Employees**: add, delete, search/filter
- **Attendance**: mark employees **present/absent** by date

No authentication (as requested).

## Live Application URL
https://hr-attendance-portal-qc3rilau9-vishal327s-projects.vercel.app/

## GitHub Repository Link
- [vishal327/Hr-Attendance-Portal](https://github.com/vishal327/Hr-Attendance-Portal)

## Tech Stack Used
- **Frontend**: React + TypeScript + Vite + Material UI (MUI)
- **Backend**: Node.js + Express (REST API)
- **Database**: SQLite (persisted to a local file)

## Steps to Run the Project Locally

### Prerequisites
- Node.js 18+

### Install
From the project root:

```powershell
npm install
cd backend; npm install
cd ..\frontend; npm install
cd ..
```

### Run (Frontend + Backend)
From the project root:

```powershell
npm run dev
```

- **Frontend**: `http://localhost:5173`
- **Backend**: `http://localhost:4000`
- **Health check**: `http://localhost:4000/api/health`

## Where Data Is Stored
Data is stored in a SQLite DB file:
- `backend/data/hr.db`

## REST API Overview

### Employees
- `GET /api/employees?q=&department=`
- `POST /api/employees`
- `DELETE /api/employees/:employeeId`

Validation:
- Required fields
- Valid email format
- Duplicate handling (`employeeId` and `email`) with `409` status codes

### Attendance
- `GET /api/attendance?date=YYYY-MM-DD`
- `PUT /api/attendance/:employeeId` (upsert present/absent for a date)

## Assumptions / Limitations
- **No authentication/authorization**.
- **SQLite** is file-based and great for lightweight/local usage.
  - For cloud deployment you need a host with a **persistent disk**, or switch DB to SQL Server/Postgres.
- Attendance is **per employee per date** (one record per day).
