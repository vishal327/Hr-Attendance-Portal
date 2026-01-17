import { Router } from "express";
import { db } from "../db.js";
import { HttpError } from "../errors.js";
import { employeeCreateSchema } from "../validation.js";

export const employeesRouter = Router();

employeesRouter.get("/", (req, res) => {
  const qRaw = typeof req.query.q === "string" ? req.query.q : "";
  const departmentRaw = typeof req.query.department === "string" ? req.query.department : "";

  const q = qRaw.trim();
  const department = departmentRaw.trim();

  const clauses: string[] = [];
  const params: unknown[] = [];

  if (q) {
    clauses.push("(employeeId LIKE ? OR fullName LIKE ? OR email LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }

  if (department) {
    clauses.push("department = ?");
    params.push(department);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

  const rows = db
    .prepare(
      `SELECT employeeId, fullName, email, department, createdAt FROM employees ${where} ORDER BY fullName ASC`
    )
    .all(...params);

  res.json({ data: rows });
});

employeesRouter.post("/", (req, res) => {
  const input = employeeCreateSchema.parse(req.body);

  const existsId = db
    .prepare("SELECT 1 FROM employees WHERE employeeId = ?")
    .get(input.employeeId);
  if (existsId) {
    throw new HttpError(409, "DUPLICATE_EMPLOYEE_ID", "Employee ID already exists");
  }

  const existsEmail = db.prepare("SELECT 1 FROM employees WHERE email = ?").get(input.email);
  if (existsEmail) {
    throw new HttpError(409, "DUPLICATE_EMAIL", "Email already exists");
  }

  const createdAt = new Date().toISOString();

  db.prepare(
    "INSERT INTO employees (employeeId, fullName, email, department, createdAt) VALUES (?, ?, ?, ?, ?)"
  ).run(input.employeeId, input.fullName, input.email, input.department, createdAt);

  res.status(201).json({
    data: {
      ...input,
      createdAt,
    },
  });
});

employeesRouter.delete("/:employeeId", (req, res) => {
  const employeeId = (req.params.employeeId ?? "").trim();
  if (!employeeId) throw new HttpError(400, "VALIDATION_ERROR", "employeeId is required");

  const exists = db.prepare("SELECT 1 FROM employees WHERE employeeId = ?").get(employeeId);
  if (!exists) throw new HttpError(404, "NOT_FOUND", "Employee not found");

  db.prepare("DELETE FROM employees WHERE employeeId = ?").run(employeeId);

  res.status(204).send();
});
