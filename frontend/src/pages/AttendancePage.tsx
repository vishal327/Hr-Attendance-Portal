import * as React from "react";
import {
  Alert,
  Box,
  CircularProgress,
  MenuItem,
  Paper,
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
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { type Dayjs } from "dayjs";
import { api, getApiErrorMessage } from "../api";
import type { AttendanceRow } from "../types";

type AttendanceStatus = "present" | "absent";

export function AttendancePage() {
  const [date, setDate] = React.useState<Dayjs>(dayjs());
  const [rows, setRows] = React.useState<AttendanceRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [savingIds, setSavingIds] = React.useState<Record<string, boolean>>({});
  const [toast, setToast] = React.useState<{ type: "success" | "error"; msg: string } | null>(null);

  const dateStr = React.useMemo(() => date.format("YYYY-MM-DD"), [date]);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: AttendanceRow[] }>("/attendance", {
        params: { date: dateStr },
      });
      setRows(res.data.data);
    } catch (err) {
      setToast({ type: "error", msg: getApiErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }, [dateStr]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function setStatus(employeeId: string, status: AttendanceStatus) {
    setSavingIds((p) => ({ ...p, [employeeId]: true }));
    try {
      await api.put(`/attendance/${encodeURIComponent(employeeId)}`, {
        date: dateStr,
        status,
      });
      setRows((prev) => prev.map((r) => (r.employeeId === employeeId ? { ...r, status } : r)));
      setToast({ type: "success", msg: "Attendance saved" });
    } catch (err) {
      setToast({ type: "error", msg: getApiErrorMessage(err) });
    } finally {
      setSavingIds((p) => {
        const next = { ...p };
        delete next[employeeId];
        return next;
      });
    }
  }

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Attendance
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Pick a date, then mark each employee as present or absent.
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Date"
            value={date}
            onChange={(d) => {
              if (d) setDate(d);
            }}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </LocalizationProvider>
      </Paper>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Employee</TableCell>
              <TableCell>Department</TableCell>
              <TableCell width={220}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3}>
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
                <TableCell colSpan={3}>
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No employees yet. Add employees first.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => {
                const saving = Boolean(savingIds[r.employeeId]);
                const value = r.status ?? "";

                return (
                  <TableRow key={r.employeeId} hover>
                    <TableCell>
                      <Stack>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {r.fullName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {r.employeeId} â€¢ {r.email}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{r.department}</TableCell>
                    <TableCell>
                      <TextField
                        select
                        size="small"
                        fullWidth
                        value={value}
                        disabled={saving}
                        onChange={(e) => {
                          const next = e.target.value as AttendanceStatus;
                          void setStatus(r.employeeId, next);
                        }}
                      >
                        <MenuItem value="" disabled>
                          Unmarked
                        </MenuItem>
                        <MenuItem value="present">Present</MenuItem>
                        <MenuItem value="absent">Absent</MenuItem>
                      </TextField>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={toast != null}
        autoHideDuration={2500}
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
