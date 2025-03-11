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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import PageContainer from '../../components/layout/PageContainer/PageContainer';
import DataTable, { Column } from '../../components/common/DataTable/DataTable';
import { useApi } from '../../hooks/useApi';
import { getMedicalHistories, deleteMedicalHistory } from '../../api/medicalHistoryApi';
import { MedicalHistory } from '../../types';
import { formatDate } from '../../utils/dateUtils';

/**
 * MedicalHistories page component
 * Displays a list of medical histories with search, filter, and CRUD functionality
 */
const MedicalHistories: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'resolved'
  const [filteredHistories, setFilteredHistories] = useState<MedicalHistory[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [historyToDelete, setHistoryToDelete] = useState<MedicalHistory | null>(null);
  
  // API hooks
  const { data: medicalHistories, loading, error, execute: fetchMedicalHistories } = useApi<MedicalHistory[], []>(getMedicalHistories);
  const { execute: executeDelete } = useApi<void, [number]>(deleteMedicalHistory);
  
  // Fetch medical histories on component mount
  useEffect(() => {
    fetchMedicalHistories();
  }, [fetchMedicalHistories]);
  
  // Filter medical histories when search term, status filter, or medical histories data changes
  useEffect(() => {
    if (medicalHistories) {
      let filtered = [...medicalHistories];
      
      // Apply search filter (disease name or patient name)
      if (searchTerm.trim() !== '') {
        const lowercasedSearch = searchTerm.toLowerCase();
        filtered = filtered.filter(
          history => 
            history.diseaseName.toLowerCase().includes(lowercasedSearch) ||
            (history.patient && 
              `${history.patient.firstName} ${history.patient.lastName}`.toLowerCase().includes(lowercasedSearch))
        );
      }
      
      // Apply status filter
      if (statusFilter === 'active') {
        filtered = filtered.filter(history => !history.endDate);
      } else if (statusFilter === 'resolved') {
        filtered = filtered.filter(history => !!history.endDate);
      }
      
      setFilteredHistories(filtered);
    }
  }, [medicalHistories, searchTerm, statusFilter]);
  
  // Column definitions for the data table
  const columns: Column<MedicalHistory>[] = [
    { 
      id: 'diseaseName', 
      label: 'Disease/Condition', 
      minWidth: 150 
    },
    { 
      id: 'patient', 
      label: 'Patient', 
      minWidth: 150,
      format: (_, row) => 
        row.patient ? `${row.patient.firstName} ${row.patient.lastName}` : 'Unknown'
    },
    { 
      id: 'startDate', 
      label: 'Start Date', 
      minWidth: 120,
      format: (value) => formatDate(value as string)
    },
    { 
      id: 'endDate', 
      label: 'End Date', 
      minWidth: 120,
      format: (value) => value ? formatDate(value as string) : 'Ongoing'
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 100,
      format: (_, row) => 
        row.endDate ? (
          <Chip label="Resolved" color="success" size="small" />
        ) : (
          <Chip label="Active" color="warning" size="small" />
        )
    }
  ];
  
  // Handler for viewing medical history details
  const handleViewMedicalHistory = (history: MedicalHistory) => {
    navigate(`/medical-histories/${history.id}`);
  };
  
  // Handler for editing a medical history
  const handleEditMedicalHistory = (history: MedicalHistory) => {
    navigate(`/medical-histories/${history.id}?edit=true`);
  };
  
  // Handler for initiating medical history deletion
  const handleDeleteMedicalHistory = (history: MedicalHistory) => {
    setHistoryToDelete(history);
    setDeleteDialogOpen(true);
  };
  
  // Handler for confirming medical history deletion
  const confirmDelete = async () => {
    if (historyToDelete) {
      try {
        await executeDelete(historyToDelete.id);
        // Refresh medical histories list after deletion
        fetchMedicalHistories();
        setDeleteDialogOpen(false);
        setHistoryToDelete(null);
      } catch (error) {
        console.error('Error deleting medical history:', error);
      }
    }
  };
  
  return (
    <PageContainer title="Medical Histories">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            label="Search medical histories"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by disease or patient..."
            sx={{ width: '300px' }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              id="status-filter"
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="active">Active Only</MenuItem>
              <MenuItem value="resolved">Resolved Only</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => navigate('/medical-histories/new')}
        >
          Add New Medical History
        </Button>
      </Box>
      
      <DataTable
        columns={columns}
        data={filteredHistories || []}
        isLoading={loading}
        error={error}
        keyExtractor={(item) => item.id}
        onView={handleViewMedicalHistory}
        onEdit={handleEditMedicalHistory}
        onDelete={handleDeleteMedicalHistory}
      />
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Medical History</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this medical history record for 
            {historyToDelete?.patient ? ` ${historyToDelete.patient.firstName} ${historyToDelete.patient.lastName}` : ''}? 
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

export default MedicalHistories; 