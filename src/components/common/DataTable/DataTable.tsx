import React, { ReactNode, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  IconButton,
  Box,
  CircularProgress,
  Typography,
  useTheme
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { alpha } from '@mui/material/styles';

/**
 * Column configuration interface
 */
interface Column<T> {
  key?: keyof T & string;
  id?: string;
  label: string;
  minWidth?: number;
  render?: (row: T) => ReactNode;
  format?: (value: unknown, row: T) => ReactNode;
}

/**
 * Props for the DataTable component
 */
interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  error?: Error | null;
  keyExtractor: (row: T) => string | number;
  onView?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  hideActions?: boolean;
}

/**
 * DataTable component for displaying data in a tabular format
 * @template T - The type of data in each row
 * Supports pagination, custom formatting, and action buttons
 */
const DataTable = <T,>({
  columns,
  data,
  isLoading = false,
  error = null,
  keyExtractor,
  onView,
  onEdit,
  onDelete,
  hideActions = false
}: DataTableProps<T>) => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">Error: {error.message}</Typography>
      </Box>
    );
  }

  if (data.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>No data available</Typography>
      </Box>
    );
  }

  const getCellContent = (column: Column<T>, row: T) => {
    if (column.render) {
      return column.render(row);
    }
    if (column.format) {
      const value = column.id ? (row as Record<string, unknown>)[column.id] : column.key ? (row as Record<string, unknown>)[column.key] : undefined;
      return column.format(value, row);
    }
    const value = column.id ? (row as Record<string, unknown>)[column.id] : column.key ? (row as Record<string, unknown>)[column.key] : undefined;
    return String(value ?? '');
  };

  return (
    <Paper 
      elevation={2}
      sx={{ 
        width: '100%',
        overflow: 'hidden',
        borderRadius: 2,
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id || column.key}
                  sx={{
                    backgroundColor: theme.palette.background.default,
                    color: theme.palette.text.primary,
                    fontWeight: 'bold',
                    borderBottom: `2px solid ${theme.palette.divider}`,
                    minWidth: column.minWidth,
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
              {!hideActions && (onView || onEdit || onDelete) && (
                <TableCell
                  align="right"
                  sx={{
                    backgroundColor: theme.palette.background.default,
                    color: theme.palette.text.primary,
                    fontWeight: 'bold',
                    borderBottom: `2px solid ${theme.palette.divider}`,
                  }}
                >
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {data
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => (
                <TableRow
                  hover
                  key={keyExtractor(row)}
                  sx={{
                    '&:hover': {
                      backgroundColor: `${theme.palette.action.hover} !important`,
                    },
                    transition: 'background-color 0.2s',
                  }}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.id || column.key}
                      sx={{
                        borderBottom: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      {getCellContent(column, row)}
                    </TableCell>
                  ))}
                  {!hideActions && (onView || onEdit || onDelete) && (
                    <TableCell
                      align="right"
                      sx={{
                        borderBottom: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        {onView && (
                          <IconButton
                            size="small"
                            onClick={() => onView(row)}
                            sx={{
                              color: theme.palette.primary.main,
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                              },
                            }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        )}
                        {onEdit && (
                          <IconButton
                            size="small"
                            onClick={() => onEdit(row)}
                            sx={{
                              color: theme.palette.warning.main,
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.warning.main, 0.1),
                              },
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        )}
                        {onDelete && (
                          <IconButton
                            size="small"
                            onClick={() => onDelete(row)}
                            sx={{
                              color: theme.palette.error.main,
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.error.main, 0.1),
                              },
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          borderTop: `1px solid ${theme.palette.divider}`,
          '.MuiTablePagination-select': {
            color: theme.palette.text.primary,
          },
          '.MuiTablePagination-selectIcon': {
            color: theme.palette.text.primary,
          },
        }}
      />
    </Paper>
  );
};

export default DataTable; 