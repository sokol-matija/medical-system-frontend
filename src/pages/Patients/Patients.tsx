import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, useTheme } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PageContainer from '../../components/layout/PageContainer/PageContainer';
import DataTable from '../../components/common/DataTable/DataTable';
import { useApi } from '../../hooks/useApi';
import { getPatients, deletePatient } from '../../api/patientApi';
import { Patient } from '../../types';
import { formatDate } from '../../utils/dateUtils';

// Define column interface for our local usage
interface Column<T> {
  key?: keyof T & string;
  id?: string;
  label: string;
  minWidth?: number;
  render?: (row: T) => React.ReactNode;
  format?: (value: unknown, row: T) => React.ReactNode;
}

/**
 * Patients page component
 * Displays a list of patients with search and CRUD functionality
 */
const Patients: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  
  // API hooks
  const { data: patients, loading, error, execute: fetchPatients } = useApi<Patient[], []>(getPatients);
  const { execute: executeDelete } = useApi<void, [number]>(deletePatient);
  
  // Fetch patients on component mount
  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);
  
  // Filter patients when search term or patients data changes
  useEffect(() => {
    if (patients) {
      if (searchTerm.trim() === '') {
        setFilteredPatients(patients);
      } else {
        const lowercasedSearch = searchTerm.toLowerCase();
        setFilteredPatients(
          patients.filter(
            patient => 
              patient.firstName.toLowerCase().includes(lowercasedSearch) ||
              patient.lastName.toLowerCase().includes(lowercasedSearch) ||
              patient.personalIdNumber.includes(searchTerm)
          )
        );
      }
    }
  }, [patients, searchTerm]);
  
  // Handle adding a new patient
  const handleAddPatient = () => {
    console.log("Add Patient button clicked, navigating to /patients/new");
    console.log("Current path:", window.location.pathname);
    navigate('/patients/new');
    // Log after navigation attempt
    setTimeout(() => {
      console.log("After navigation, location is:", window.location.pathname);
    }, 100);
  };
  
  // Column definitions for the data table
  const columns: Column<Patient>[] = [
    { id: 'personalIdNumber', label: 'OIB', minWidth: 150 },
    { id: 'firstName', label: 'First Name', minWidth: 120 },
    { id: 'lastName', label: 'Last Name', minWidth: 120 },
    { 
      id: 'dateOfBirth', 
      label: 'Date of Birth', 
      minWidth: 120,
      format: (value: unknown) => formatDate(value as string)
    },
    { 
      id: 'gender', 
      label: 'Gender', 
      minWidth: 80,
      format: (value: unknown) => value === 'M' ? 'Male' : 'Female'
    }
  ];
  
  // Handle viewing a patient
  const handleViewPatient = (patient: Patient) => {
    navigate(`/patients/${patient.id}`);
  };
  
  // Handle editing a patient
  const handleEditPatient = (patient: Patient) => {
    navigate(`/patients/${patient.id}?edit=true`);
  };
  
  // Handle deleting a patient
  const handleDeletePatient = (patient: Patient) => {
    setPatientToDelete(patient);
    setDeleteDialogOpen(true);
  };
  
  // Confirm deletion
  const confirmDelete = async () => {
    if (patientToDelete) {
      try {
        await executeDelete(patientToDelete.id);
        // Refresh patients list after deletion
        fetchPatients();
        setDeleteDialogOpen(false);
        setPatientToDelete(null);
      } catch (error) {
        console.error('Error deleting patient:', error);
      }
    }
  };
  
  return (
    <PageContainer title="Patients">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <TextField
          label="Search patients"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name or OIB..."
          sx={{ width: '300px' }}
        />
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleAddPatient}
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
          Add New Patient
        </Button>
      </Box>
      
      <DataTable
        columns={columns}
        data={filteredPatients || []}
        isLoading={loading}
        error={error}
        keyExtractor={(item) => item.id}
        onView={handleViewPatient}
        onEdit={handleEditPatient}
        onDelete={handleDeletePatient}
      />
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Patient</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {patientToDelete?.firstName} {patientToDelete?.lastName}? 
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

export default Patients; 