import { Routes, Route } from "react-router-dom";
import { PageShell } from "./components/PageShell";
import { EmployeesPage } from "./pages/EmployeesPage";
import { AttendancePage } from "./pages/AttendancePage";

export default function App() {
  return (
    <PageShell>
      <Routes>
        <Route path="/" element={<EmployeesPage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="*" element={<EmployeesPage />} />
      </Routes>
    </PageShell>
  );
}
