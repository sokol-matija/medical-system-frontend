import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, useTheme } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PageContainer from '../../components/layout/PageContainer/PageContainer';
import DataTable from '../../components/common/DataTable/DataTable';
import { useApi } from '../../hooks/useApi';
import { getDoctors, deleteDoctor } from '../../api/doctorApi';
import { Doctor } from '../../types';

/**
 * Doctors page component
 * Displays a list of doctors with search and CRUD functionality
 */
const Doctors: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);
  
  // API hooks
  const { data: doctors, loading, error, execute: fetchDoctors } = useApi<Doctor[], []>(getDoctors);
  const { execute: executeDelete } = useApi<void, [number]>(deleteDoctor);
  
  // Fetch doctors on component mount
  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);
  
  // Filter doctors when search term or doctors data changes
  useEffect(() => {
    if (doctors) {
      if (searchTerm.trim() === '') {
        setFilteredDoctors(doctors);
      } else {
        const lowercasedSearch = searchTerm.toLowerCase();
        setFilteredDoctors(
          doctors.filter(
            doctor => 
              doctor.firstName.toLowerCase().includes(lowercasedSearch) ||
              doctor.lastName.toLowerCase().includes(lowercasedSearch) ||
              doctor.specialization.toLowerCase().includes(lowercasedSearch)
          )
        );
      }
    }
  }, [doctors, searchTerm]);
  
  // Handle adding a new doctor
  const handleAddDoctor = () => {
    console.log("Add Doctor button clicked, navigating to /doctors/new");
    console.log("Current path:", window.location.pathname);
    navigate('/doctors/new');
    // Log after navigation attempt
    setTimeout(() => {
      console.log("After navigation, location is:", window.location.pathname);
    }, 100);
  };
  
  // Define column interface for our local usage
  interface Column<T> {
    key?: keyof T & string;
    id?: string;
    label: string;
    minWidth?: number;
    render?: (row: T) => React.ReactNode;
    format?: (value: unknown, row: T) => React.ReactNode;
  }
  
  // Column definitions for the data table
  const columns: Column<Doctor>[] = [
    { id: 'id', label: 'ID', minWidth: 50 },
    { id: 'firstName', label: 'First Name', minWidth: 120 },
    { id: 'lastName', label: 'Last Name', minWidth: 120 },
    { id: 'specialization', label: 'Specialization', minWidth: 180 },
    { 
      id: 'examinations', 
      label: 'Examinations', 
      minWidth: 120,
      format: (_: unknown, row: Doctor) => row.examinations ? row.examinations.length : 0
    }
  ];
  
  // Handler for viewing doctor details
  const handleViewDoctor = (doctor: Doctor) => {
    navigate(`/doctors/${doctor.id}`);
  };
  
  // Handler for editing a doctor
  const handleEditDoctor = (doctor: Doctor) => {
    navigate(`/doctors/${doctor.id}?edit=true`);
  };
  
  // Handler for initiating doctor deletion
  const handleDeleteDoctor = (doctor: Doctor) => {
    setDoctorToDelete(doctor);
    setDeleteDialogOpen(true);
  };
  
  // Handler for confirming doctor deletion
  const confirmDelete = async () => {
    if (doctorToDelete) {
      try {
        await executeDelete(doctorToDelete.id);
        // Refresh doctors list after deletion
        fetchDoctors();
        setDeleteDialogOpen(false);
        setDoctorToDelete(null);
      } catch (error) {
        console.error('Error deleting doctor:', error);
      }
    }
  };
  
  return (
    <PageContainer title="Doctors">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <TextField
          label="Search doctors"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name or specialization..."
          sx={{ width: '300px' }}
        />
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleAddDoctor}
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
          Add New Doctor
        </Button>
      </Box>
      
      <DataTable
        columns={columns}
        data={filteredDoctors || []}
        isLoading={loading}
        error={error}
        keyExtractor={(item) => item.id}
        onView={handleViewDoctor}
        onEdit={handleEditDoctor}
        onDelete={handleDeleteDoctor}
      />
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Doctor</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete Dr. {doctorToDelete?.firstName} {doctorToDelete?.lastName}? 
            This action cannot be undone and will affect all associated examinations and prescriptions.
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

export default Doctors; 