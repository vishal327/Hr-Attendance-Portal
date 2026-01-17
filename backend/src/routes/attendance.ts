import { Router } from "express";
import { db } from "../db.js";
import { HttpError } from "../errors.js";
import { attendanceUpsertSchema, yyyyMmDdSchema } from "../validation.js";

export const attendanceRouter = Router();

attendanceRouter.get("/", (req, res) => {
  const dateRaw = typeof req.query.date === "string" ? req.query.date : "";
  const date = yyyyMmDdSchema.parse(dateRaw);

  const rows = db
    .prepare(
      `
      SELECT
        e.employeeId,
        e.fullName,
        e.email,
        e.department,
        a.status
      FROM employees e
      LEFT JOIN attendance a
        ON a.employeeId = e.employeeId
        AND a.date = ?
      ORDER BY e.fullName ASC
      `.trim()
    )
    .all(date);

  res.json({ data: rows, meta: { date } });
});

attendanceRouter.put("/:employeeId", (req, res) => {
  const employeeId = (req.params.employeeId ?? "").trim();
  if (!employeeId) throw new HttpError(400, "VALIDATION_ERROR", "employeeId is required");

  const { date, status } = attendanceUpsertSchema.parse(req.body);

  const employeeExists = db.prepare("SELECT 1 FROM employees WHERE employeeId = ?").get(employeeId);
  if (!employeeExists) throw new HttpError(404, "NOT_FOUND", "Employee not found");

  const now = new Date().toISOString();

  db.prepare(
    `
    INSERT INTO attendance (employeeId, date, status, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(employeeId, date)
    DO UPDATE SET status = excluded.status, updatedAt = excluded.updatedAt
    `.trim()
  ).run(employeeId, date, status, now, now);

  res.json({ data: { employeeId, date, status } });
});
