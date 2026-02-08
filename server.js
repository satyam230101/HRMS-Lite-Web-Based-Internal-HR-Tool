const express = require("express");
const cors = require("cors");
const path = require("path");
const { db, initDb } = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

initDb();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateEmployee = (payload) => {
  const errors = [];
  if (!payload.id || payload.id.trim() === "") {
    errors.push("Employee ID is required.");
  }
  if (!payload.fullName || payload.fullName.trim() === "") {
    errors.push("Full Name is required.");
  }
  if (!payload.email || payload.email.trim() === "") {
    errors.push("Email Address is required.");
  } else if (!emailRegex.test(payload.email)) {
    errors.push("Email Address must be valid.");
  }
  if (!payload.department || payload.department.trim() === "") {
    errors.push("Department is required.");
  }
  return errors;
};

const validateAttendance = (payload) => {
  const errors = [];
  if (!payload.employeeId || payload.employeeId.trim() === "") {
    errors.push("Employee ID is required.");
  }
  if (!payload.date || payload.date.trim() === "") {
    errors.push("Date is required.");
  }
  if (!payload.status || payload.status.trim() === "") {
    errors.push("Status is required.");
  } else if (!["Present", "Absent"].includes(payload.status)) {
    errors.push("Status must be Present or Absent.");
  }
  return errors;
};

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/employees", (req, res) => {
  db.all(
    "SELECT id, full_name as fullName, email, department, created_at as createdAt FROM employees ORDER BY created_at DESC",
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ message: "Failed to fetch employees." });
      }
      return res.json(rows);
    }
  );
});

app.post("/api/employees", (req, res) => {
  const payload = {
    id: req.body.id?.trim(),
    fullName: req.body.fullName?.trim(),
    email: req.body.email?.trim(),
    department: req.body.department?.trim()
  };
  const errors = validateEmployee(payload);
  if (errors.length > 0) {
    return res.status(400).json({ message: "Validation failed.", errors });
  }

  db.get("SELECT id FROM employees WHERE id = ?", [payload.id], (err, row) => {
    if (err) {
      return res.status(500).json({ message: "Failed to validate employee." });
    }
    if (row) {
      return res.status(409).json({ message: "Employee ID already exists." });
    }
    db.run(
      "INSERT INTO employees (id, full_name, email, department) VALUES (?, ?, ?, ?)",
      [payload.id, payload.fullName, payload.email, payload.department],
      function insertEmployee(insertErr) {
        if (insertErr) {
          return res.status(500).json({ message: "Failed to create employee." });
        }
        return res.status(201).json({
          id: payload.id,
          fullName: payload.fullName,
          email: payload.email,
          department: payload.department
        });
      }
    );
  });
});

app.delete("/api/employees/:id", (req, res) => {
  const employeeId = req.params.id;
  db.run("DELETE FROM employees WHERE id = ?", [employeeId], function deleteEmployee(err) {
    if (err) {
      return res.status(500).json({ message: "Failed to delete employee." });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: "Employee not found." });
    }
    return res.json({ message: "Employee deleted." });
  });
});

app.get("/api/attendance", (req, res) => {
  const { employeeId } = req.query;
  if (!employeeId) {
    return res
      .status(400)
      .json({ message: "Employee ID query parameter is required." });
  }
  db.all(
    "SELECT id, employee_id as employeeId, date, status, created_at as createdAt FROM attendance WHERE employee_id = ? ORDER BY date DESC",
    [employeeId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ message: "Failed to fetch attendance records." });
      }
      return res.json(rows);
    }
  );
});

app.post("/api/attendance", (req, res) => {
  const payload = {
    employeeId: req.body.employeeId?.trim(),
    date: req.body.date?.trim(),
    status: req.body.status?.trim()
  };
  const errors = validateAttendance(payload);
  if (errors.length > 0) {
    return res.status(400).json({ message: "Validation failed.", errors });
  }

  db.get("SELECT id FROM employees WHERE id = ?", [payload.employeeId], (err, row) => {
    if (err) {
      return res.status(500).json({ message: "Failed to validate employee." });
    }
    if (!row) {
      return res.status(404).json({ message: "Employee not found." });
    }
    db.run(
      "INSERT INTO attendance (employee_id, date, status) VALUES (?, ?, ?)",
      [payload.employeeId, payload.date, payload.status],
      function insertAttendance(insertErr) {
        if (insertErr) {
          return res.status(500).json({ message: "Failed to add attendance." });
        }
        return res.status(201).json({
          id: this.lastID,
          employeeId: payload.employeeId,
          date: payload.date,
          status: payload.status
        });
      }
    );
  });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

app.listen(PORT, () => {
  console.log(`HRMS Lite server running on port ${PORT}`);
});
