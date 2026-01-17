import * as React from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import { api, getApiErrorMessage } from "../api";
import type { Employee } from "../types";
import { AddEmployeeDialog, type NewEmployeeInput } from "../components/AddEmployeeDialog";
import { ConfirmDialog } from "../components/ConfirmDialog";

export function EmployeesPage() {
  const [q, setQ] = React.useState("");
  const [department, setDepartment] = React.useState<string>("");

  const [rows, setRows] = React.useState<Employee[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [addOpen, setAddOpen] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const [toast, setToast] = React.useState<{ type: "success" | "error"; msg: string } | null>(null);

  const departments = React.useMemo(() => {
    const set = new Set(rows.map((r) => r.department).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const load = React.useCallback(async (opts: { q: string; department: string }) => {
    setLoading(true);
    try {
      const res = await api.get<{ data: Employee[] }>("/employees", {
        params: {
          q: opts.q || undefined,
          department: opts.department || undefined,
        },
      });
      setRows(res.data.data);
    } catch (err) {
      setToast({ type: "error", msg: getApiErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const handle = setTimeout(() => {
      void load({ q, department });
    }, 250);
    return () => clearTimeout(handle);
  }, [q, department, load]);

  async function handleCreate(input: NewEmployeeInput) {
    try {
      await api.post("/employees", input);
      setToast({ type: "success", msg: "Employee added" });
      await load({ q, department });
    } catch (err) {
      setToast({ type: "error", msg: getApiErrorMessage(err) });
      throw err;
    }
  }

  async function handleDelete(employeeId: string) {
    try {
      await api.delete(`/employees/${encodeURIComponent(employeeId)}`);
      setToast({ type: "success", msg: "Employee deleted" });
      setDeleteId(null);
      await load({ q, department });
    } catch (err) {
      setToast({ type: "error", msg: getApiErrorMessage(err) });
    }
  }

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Employees
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Add, remove, and find employees quickly.
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
          <TextField
            label="Search"
            placeholder="Employee ID, name, or email"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            fullWidth
          />
          <FormControl sx={{ minWidth: 220 }}>
            <InputLabel id="dept-label">Department</InputLabel>
            <Select
              labelId="dept-label"
              label="Department"
              value={department}
              onChange={(e) => setDepartment(String(e.target.value))}
            >
              <MenuItem value="">All</MenuItem>
              {departments.map((d) => (
                <MenuItem key={d} value={d}>
                  {d}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<PersonAddAltIcon />}
            onClick={() => setAddOpen(true)}
            sx={{ whiteSpace: "nowrap" }}
          >
            Add employee
          </Button>
        </Stack>
      </Paper>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Employee ID</TableCell>
              <TableCell>Full name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Department</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 2 }}>
                    <CircularProgress size={18} />
                    <Typography variant="body2" color="text.secondary">
                      Loading...
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No employees found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.employeeId} hover>
                  <TableCell sx={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                    {r.employeeId}
                  </TableCell>
                  <TableCell>{r.fullName}</TableCell>
                  <TableCell>{r.email}</TableCell>
                  <TableCell>{r.department}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      aria-label="Delete"
                      color="error"
                      onClick={() => setDeleteId(r.employeeId)}
                      size="small"
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <AddEmployeeDialog open={addOpen} onClose={() => setAddOpen(false)} onCreate={handleCreate} />

      <ConfirmDialog
        open={deleteId != null}
        title="Delete employee?"
        description={deleteId ? `This will remove ${deleteId} and their attendance records.` : undefined}
        confirmText="Delete"
        confirmColor="error"
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) void handleDelete(deleteId);
        }}
      />

      <Snackbar
        open={toast != null}
        autoHideDuration={3500}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {toast ? (
          <Alert severity={toast.type} onClose={() => setToast(null)} variant="filled">
            {toast.msg}
          </Alert>
        ) : (
          <span />
        )}
      </Snackbar>
    </Stack>
  );
}
