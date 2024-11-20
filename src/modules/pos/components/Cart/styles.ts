import { TableCell, TableRow, styled, alpha } from '@mui/material';

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(0.75),
  whiteSpace: 'nowrap',
  '&.MuiTableCell-head': {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.common.white,
    fontWeight: 600,
    zIndex: 2,
    position: 'sticky',
    top: 0,
    borderBottom: `2px solid ${theme.palette.primary.dark}`,
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  },
}));

export const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: alpha(theme.palette.primary.light, 0.05),
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.light, 0.1),
  },
  '& td': {
    borderBottom: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(0.5, 0.75),
  },
  height: theme.spacing(4.5), // Add fixed height for consistent row sizing
}));
