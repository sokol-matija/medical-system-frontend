import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  TextField, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useTheme
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PageContainer from '../../components/layout/PageContainer/PageContainer';
import DataTable from '../../components/common/DataTable/DataTable';
import { useApi } from '../../hooks/useApi';
import { getExaminations, deleteExamination } from '../../api/examinationApi';
import { Examination } from '../../types';
import { formatDateTime } from '../../utils/dateUtils';
import { getExaminationTypeName } from '../../utils/examinationUtils';

// Column interface definition - matches what's in DataTable but defined here to avoid import issues
interface Column<T> {
  key?: keyof T & string;
  id?: string;
  label: string;
  minWidth?: number;
  render?: (row: T) => React.ReactNode;
  format?: (value: unknown, row: T) => React.ReactNode;
}

/**
 * Examinations page component
 * Displays a list of examinations with search, filter, and CRUD functionality
 */
const Examinations: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [filteredExaminations, setFilteredExaminations] = useState<Examination[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [examinationToDelete, setExaminationToDelete] = useState<Examination | null>(null);
  
  // API hooks
  const { data: examinations, loading, error, execute: fetchExaminations } = useApi<Examination[], []>(getExaminations);
  const { execute: executeDelete } = useApi<void, [number]>(deleteExamination);
  
  // Fetch examinations on component mount
  useEffect(() => {
    fetchExaminations();
  }, [fetchExaminations]);
  
  // Handle adding a new examination
  const handleAddExamination = () => {
    navigate('/examinations/new');
  };
  
  // Filter and sort examinations when data, search term, or type filter changes
  useEffect(() => {
    if (examinations) {
      // First filter by search term
      let filtered = [...examinations];
      
      if (searchTerm.trim() !== '') {
        const lowercasedSearch = searchTerm.toLowerCase();
        filtered = filtered.filter(
          exam => 
            (exam.patient && `${exam.patient.firstName} ${exam.patient.lastName}`.toLowerCase().includes(lowercasedSearch)) ||
            (exam.doctor && `${exam.doctor.firstName} ${exam.doctor.lastName}`.toLowerCase().includes(lowercasedSearch)) ||
            exam.notes.toLowerCase().includes(lowercasedSearch)
        );
      }
      
      // Then filter by examination type
      if (typeFilter) {
        filtered = filtered.filter(
          exam => getExaminationTypeName(exam.type as unknown as number) === typeFilter
        );
      }
      
      // Sort by date, most recent first
      filtered.sort((a, b) => 
        new Date(b.examinationDateTime).getTime() - new Date(a.examinationDateTime).getTime()
      );
      
      setFilteredExaminations(filtered);
    }
  }, [examinations, searchTerm, typeFilter]);
  
  // Column definitions for the data table
  const columns: Column<Examination>[] = [
    { 
      id: 'type', 
      label: 'Type', 
      minWidth: 100,
      format: (value: unknown) => getExaminationTypeName(value as unknown as number)
    },
    { 
      id: 'examinationDateTime', 
      label: 'Date & Time', 
      minWidth: 150,
      format: (value: unknown) => formatDateTime(value as string)
    },
    { 
      id: 'patient', 
      label: 'Patient', 
      minWidth: 150,
      format: (_: unknown, row: Examination) => 
        row.patient ? `${row.patient.firstName} ${row.patient.lastName}` : 'Unknown'
    },
    { 
      id: 'doctor', 
      label: 'Doctor', 
      minWidth: 150,
      format: (_: unknown, row: Examination) => 
        row.doctor ? `${row.doctor.firstName} ${row.doctor.lastName}` : 'Unknown'
    },
    { 
      id: 'notes', 
      label: 'Notes', 
      minWidth: 200,
      format: (value: unknown) => {
        const notes = value as string;
        return notes.length > 50 ? `${notes.substring(0, 50)}...` : notes;
      }
    }
  ];

  // Get unique examination types for filter
  const getExaminationTypes = () => {
    if (!examinations) return [];
    
    const typesSet = new Set<string>();
    examinations.forEach(exam => {
      const typeName = getExaminationTypeName(exam.type as unknown as number);
      typesSet.add(typeName);
    });
    
    return Array.from(typesSet).sort();
  };
  
  // Handler for viewing examination details
  const handleViewExamination = (examination: Examination) => {
    navigate(`/examinations/${examination.id}`);
  };
  
  // Handler for editing an examination
  const handleEditExamination = (examination: Examination) => {
    navigate(`/examinations/${examination.id}?edit=true`);
  };
  
  // Handler for initiating examination deletion
  const handleDeleteExamination = (examination: Examination) => {
    setExaminationToDelete(examination);
    setDeleteDialogOpen(true);
  };
  
  // Handler for confirming examination deletion
  const confirmDelete = async () => {
    if (examinationToDelete) {
      try {
        await executeDelete(examinationToDelete.id);
        // Refresh examinations list after deletion
        fetchExaminations();
        setDeleteDialogOpen(false);
        setExaminationToDelete(null);
      } catch (error) {
        console.error('Error deleting examination:', error);
      }
    }
  };
  
  return (
    <PageContainer title="Examinations">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            label="Search examinations"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by doctor, patient, or notes..."
            sx={{ width: '300px' }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="examination-type-filter-label">Type</InputLabel>
            <Select
              labelId="examination-type-filter-label"
              id="examination-type-filter"
              value={typeFilter}
              label="Type"
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <MenuItem value="">
                <em>All Types</em>
              </MenuItem>
              {getExaminationTypes().map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleAddExamination}
          startIcon={<AddIcon />}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1,
            transition: 'all 0.3s',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: theme.shadows[8],
            },
          }}
        >
          Add New Examination
        </Button>
      </Box>
      
      <DataTable
        columns={columns}
        data={filteredExaminations || []}
        isLoading={loading}
        error={error}
        keyExtractor={(item) => item.id}
        onView={handleViewExamination}
        onEdit={handleEditExamination}
        onDelete={handleDeleteExamination}
      />
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Examination</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this examination? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default Examinations; 