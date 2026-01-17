export type Employee = {
  employeeId: string;
  fullName: string;
  email: string;
  department: string;
  createdAt: string;
};

export type AttendanceRow = {
  employeeId: string;
  fullName: string;
  email: string;
  department: string;
  status: "present" | "absent" | null;
};
