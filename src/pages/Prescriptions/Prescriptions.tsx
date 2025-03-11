import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  TextField, 
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
import { getPrescriptions, deletePrescription } from '../../api/prescriptionApi';
import { Prescription } from '../../types';
import { formatDate } from '../../utils/dateUtils';

/**
 * Column interface for our local usage
 * Defines a column for the DataTable component
 */
interface Column<T> {
  key?: keyof T & string;
  id?: string;
  label: string;
  minWidth?: number;
  render?: (row: T) => React.ReactNode;
  format?: (value: unknown, row: T) => React.ReactNode;
}

/**
 * Prescriptions page component
 * Displays a list of prescriptions with search and CRUD functionality
 */
const Prescriptions: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<Prescription[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [prescriptionToDelete, setPrescriptionToDelete] = useState<Prescription | null>(null);
  
  // API hooks
  const { 
    data: prescriptions, 
    loading, 
    error, 
    execute: fetchPrescriptions 
  } = useApi<Prescription[], []>(getPrescriptions);
  
  const { 
    execute: executeDelete 
  } = useApi<void, [number]>(deletePrescription);
  
  // Fetch prescriptions on component mount
  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);
  
  // Filter prescriptions when data and search term changes
  useEffect(() => {
    if (prescriptions) {
      let filtered = [...prescriptions];
      
      // Apply search filter
      if (searchTerm.trim() !== '') {
        const lowercasedSearch = searchTerm.toLowerCase();
        filtered = filtered.filter(
          prescription => 
            (prescription.patient && 
              `${prescription.patient.firstName} ${prescription.patient.lastName}`.toLowerCase().includes(lowercasedSearch)) ||
            (prescription.doctor && 
              `${prescription.doctor.firstName} ${prescription.doctor.lastName}`.toLowerCase().includes(lowercasedSearch)) ||
            prescription.medication.toLowerCase().includes(lowercasedSearch) ||
            prescription.instructions.toLowerCase().includes(lowercasedSearch)
        );
      }
      
      // Sort by date, most recent first
      filtered.sort((a, b) => 
        new Date(b.prescriptionDate).getTime() - new Date(a.prescriptionDate).getTime()
      );
      
      setFilteredPrescriptions(filtered);
    }
  }, [prescriptions, searchTerm]);
  
  // Handle adding a new prescription
  const handleAddPrescription = () => {
    navigate('/prescriptions/new');
  };
  
  // Handle viewing a prescription
  const handleViewPrescription = (prescription: Prescription) => {
    navigate(`/prescriptions/${prescription.id}`);
  };
  
  // Handle editing a prescription
  const handleEditPrescription = (prescription: Prescription) => {
    navigate(`/prescriptions/${prescription.id}?edit=true`);
  };
  
  // Handle deleting a prescription
  const handleDeletePrescription = (prescription: Prescription) => {
    setPrescriptionToDelete(prescription);
    setDeleteDialogOpen(true);
  };
  
  // Confirm delete action
  const confirmDelete = async () => {
    if (prescriptionToDelete) {
      try {
        await executeDelete(prescriptionToDelete.id);
        fetchPrescriptions(); // Refresh list
        setDeleteDialogOpen(false);
        setPrescriptionToDelete(null);
      } catch (error) {
        console.error('Error deleting prescription:', error);
      }
    }
  };
  
  // Column definitions for the data table
  const columns: Column<Prescription>[] = [
    { 
      id: 'medication', 
      label: 'Medication', 
      minWidth: 150 
    },
    { 
      id: 'dosage', 
      label: 'Dosage', 
      minWidth: 120 
    },
    { 
      id: 'patient', 
      label: 'Patient', 
      minWidth: 150,
      format: (_: unknown, row: Prescription) => 
        row.patient ? `${row.patient.firstName} ${row.patient.lastName}` : 'Unknown'
    },
    { 
      id: 'doctor', 
      label: 'Doctor', 
      minWidth: 150,
      format: (_: unknown, row: Prescription) => 
        row.doctor ? `${row.doctor.firstName} ${row.doctor.lastName}` : 'Unknown'
    },
    { 
      id: 'prescriptionDate', 
      label: 'Date', 
      minWidth: 120,
      format: (value: unknown) => formatDate(value as string)
    }
  ];
  
  return (
    <PageContainer title="Prescriptions">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <TextField
          label="Search prescriptions"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by medication, patient, or doctor..."
          sx={{ width: '300px' }}
        />
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleAddPrescription}
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
          Add New Prescription
        </Button>
      </Box>
      
      <DataTable
        columns={columns}
        data={filteredPrescriptions || []}
        isLoading={loading}
        error={error}
        keyExtractor={(item) => item.id}
        onView={handleViewPrescription}
        onEdit={handleEditPrescription}
        onDelete={handleDeletePrescription}
      />
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Prescription</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this prescription for 
            {prescriptionToDelete?.patient ? ` ${prescriptionToDelete.patient.firstName} ${prescriptionToDelete.patient.lastName}` : ''}? 
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

export default Prescriptions; 