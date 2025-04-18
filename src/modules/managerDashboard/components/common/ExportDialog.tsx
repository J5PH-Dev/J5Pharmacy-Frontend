import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  CircularProgress,
  InputAdornment,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import * as XLSX from 'xlsx';

interface Column {
  field: string;
  header: string;
}

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  data: any[];
  columns: Column[];
  filename: string;
}

const ExportDialog: React.FC<ExportDialogProps> = ({
  open,
  onClose,
  data,
  columns,
  filename
}) => {
  const [customFilename, setCustomFilename] = useState(filename);
  const [isExporting, setIsExporting] = useState(false);
  const [rowCount, setRowCount] = useState('5');
  const [exportAll, setExportAll] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Determine the number of rows to export
      const numRows = exportAll ? data.length : parseInt(rowCount, 10);
      const exportData = data.slice(0, numRows).map(row => {
        const orderedRow: { [key: string]: any } = {};
        columns.forEach(({ field, header }) => {
          orderedRow[header] = row[field];
        });
        return orderedRow;
      });

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

      // Save file
      XLSX.writeFile(wb, `${customFilename}.xlsx`);

      setIsExporting(false);
      onClose();
    } catch (error) {
      console.error('Error exporting data:', error);
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Export Data</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Filename
          </Typography>
          <TextField
            fullWidth
            value={customFilename}
            onChange={(e) => setCustomFilename(e.target.value)}
            size="small"
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Typography variant="body2" color="text.secondary">
                    .xlsx
                  </Typography>
                </InputAdornment>
              ),
            }}
          />

          <Typography variant="subtitle1" gutterBottom>
            Number of Rows to Export
          </Typography>
          <TextField
            fullWidth
            value={rowCount}
            onChange={(e) => setRowCount(e.target.value)}
            size="small"
            sx={{ mb: 2 }}
            placeholder="Enter number of rows"
            disabled={exportAll}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={exportAll}
                onChange={(e) => setExportAll(e.target.checked)}
                color="primary"
              />
            }
            label="Export All Rows"
          />

          <Typography variant="subtitle1" gutterBottom>
            Preview (First {exportAll ? data.length : Math.min(parseInt(rowCount, 10), data.length)} rows)
          </Typography>
          <Paper sx={{ maxHeight: 300, overflow: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {columns.map(column => (
                    <TableCell key={column.field}>{column.header}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.slice(0, exportAll ? data.length : Math.min(parseInt(rowCount, 10), data.length)).map((row, index) => (
                  <TableRow key={index}>
                    {columns.map(column => (
                      <TableCell key={column.field}>{row[column.field]}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isExporting}>
          Cancel
        </Button>
        <Button
          onClick={handleExport}
          variant="contained"
          disabled={isExporting}
          startIcon={isExporting ? <CircularProgress size={20} /> : null}
        >
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportDialog;