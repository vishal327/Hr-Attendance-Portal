import { z } from "zod";

export const employeeCreateSchema = z.object({
  employeeId: z.string().trim().min(1, "employeeId is required"),
  fullName: z.string().trim().min(1, "fullName is required"),
  email: z.string().trim().email("email must be a valid email"),
  department: z.string().trim().min(1, "department is required"),
});

export const employeeUpdateSchema = employeeCreateSchema.partial().refine(
  (v) => Object.keys(v).length > 0,
  { message: "At least one field is required" }
);

export const yyyyMmDdSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD");

export const attendanceUpsertSchema = z.object({
  date: yyyyMmDdSchema,
  status: z.enum(["present", "absent"]),
});
