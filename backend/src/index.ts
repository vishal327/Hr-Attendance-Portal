import express from "express";
import cors from "cors";
import morgan from "morgan";
import { employeesRouter } from "./routes/employees.js";
import { attendanceRouter } from "./routes/attendance.js";
import { errorHandler, notFoundHandler } from "./middleware/errors.js";
import "./db.js";

const app = express();

app.use(cors({ origin: true }));
app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/employees", employeesRouter);
app.use("/api/attendance", attendanceRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${port}`);
});
