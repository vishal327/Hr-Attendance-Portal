import * as React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";

export type NewEmployeeInput = {
  employeeId: string;
  fullName: string;
  email: string;
  department: string;
};

export function AddEmployeeDialog(props: {
  open: boolean;
  onClose: () => void;
  onCreate: (input: NewEmployeeInput) => Promise<void>;
}) {
  const { open, onClose, onCreate } = props;

  const [input, setInput] = React.useState<NewEmployeeInput>({
    employeeId: "",
    fullName: "",
    email: "",
    department: "",
  });
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setInput({ employeeId: "", fullName: "", email: "", department: "" });
    setSaving(false);
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onCreate({
        employeeId: input.employeeId.trim(),
        fullName: input.fullName.trim(),
        email: input.email.trim(),
        department: input.department.trim(),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Add employee</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Employee ID"
              value={input.employeeId}
              onChange={(e) => setInput((p) => ({ ...p, employeeId: e.target.value }))}
              required
              autoFocus
            />
            <TextField
              label="Full name"
              value={input.fullName}
              onChange={(e) => setInput((p) => ({ ...p, fullName: e.target.value }))}
              required
            />
            <TextField
              label="Email address"
              value={input.email}
              onChange={(e) => setInput((p) => ({ ...p, email: e.target.value }))}
              required
              type="email"
            />
            <TextField
              label="Department"
              value={input.department}
              onChange={(e) => setInput((p) => ({ ...p, department: e.target.value }))}
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={saving} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? "Saving..." : "Add"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
