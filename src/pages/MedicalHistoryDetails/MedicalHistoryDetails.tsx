import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  CircularProgress, 
  Button,
  Chip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import PageContainer from '../../components/layout/PageContainer/PageContainer';
import MedicalHistoryForm from '../../components/medicalHistory/MedicalHistoryForm/MedicalHistoryForm';
import { useApi } from '../../hooks/useApi';
import { getMedicalHistoryById, updateMedicalHistory, createMedicalHistory } from '../../api/medicalHistoryApi';
import { MedicalHistory } from '../../types';
import { formatDate } from '../../utils/dateUtils';

/**
 * MedicalHistoryDetails page component
 * Shows details for a specific medical history record and allows editing
 */
const MedicalHistoryDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isEditing, setIsEditing] = useState(searchParams.get('edit') === 'true');
  
  // Check if it's a new medical history entry either by id or by the path
  const isNewMedicalHistory = id === 'new' || location.pathname === '/medical-histories/new';
  
  // API hooks
  const { 
    data: medicalHistory, 
    loading, 
    error, 
    execute: fetchMedicalHistory 
  } = useApi<MedicalHistory, [number]>(getMedicalHistoryById);
  
  const { 
    loading: updateLoading, 
    execute: executeUpdate 
  } = useApi<void, [number, MedicalHistory]>(updateMedicalHistory);

  const {
    error: createError,
    execute: executeCreate
  } = useApi<MedicalHistory, [Omit<MedicalHistory, 'id'>]>(createMedicalHistory);
  
  // Fetch medical history data when component mounts or ID changes
  useEffect(() => {
    if (id && !isNewMedicalHistory) {
      fetchMedicalHistory(parseInt(id, 10));
    }
  }, [id, fetchMedicalHistory, isNewMedicalHistory]);
  
  // Handle edit button click
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  // Handle form cancel
  const handleCancel = () => {
    setIsEditing(false);
    if (isNewMedicalHistory) {
      navigate('/medical-histories');
    }
  };
  
  // Handle form submit
  const handleSubmit = async (formData: MedicalHistory | Omit<MedicalHistory, 'id'>) => {
    try {
      if (isNewMedicalHistory) {
        // Create new medical history
        const newMedicalHistory = await executeCreate(formData as Omit<MedicalHistory, 'id'>);
        if (newMedicalHistory) {
          navigate(`/medical-histories/${newMedicalHistory.id}`);
        }
      } else if (id) {
        // Update existing medical history
        const medicalHistoryId = parseInt(id, 10);
        await executeUpdate(medicalHistoryId, { ...formData, id: medicalHistoryId } as MedicalHistory);
        fetchMedicalHistory(medicalHistoryId);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving medical history:', error);
    }
  };
  
  // If new medical history, show form directly
  if (isNewMedicalHistory) {
    const patientId = location.state?.patientId;
    
    return (
      <PageContainer title="New Medical History">
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/medical-histories')}
          sx={{ mb: 3 }}
        >
          Back to Medical Histories
        </Button>
        
        <Paper sx={{ p: 3 }}>
          <MedicalHistoryForm
            onCancel={handleCancel}
            onSubmit={handleSubmit}
            medicalHistory={patientId ? { patientId } as Partial<MedicalHistory> as MedicalHistory : undefined}
          />
          
          {createError && (
            <Typography color="error" sx={{ mt: 2 }}>
              Error creating medical history: {createError.message}
            </Typography>
          )}
        </Paper>
      </PageContainer>
    );
  }
  
  // If loading, show loading indicator
  if (loading && !medicalHistory) {
    return (
      <PageContainer title="Medical History Details">
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }
  
  // If error, show error message
  if (error) {
    return (
      <PageContainer title="Medical History Details">
        <Typography color="error">
          Error loading medical history: {error.message}
        </Typography>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/medical-histories')}
          sx={{ mt: 2 }}
        >
          Back to Medical Histories
        </Button>
      </PageContainer>
    );
  }
  
  // If no medical history, show message
  if (!medicalHistory) {
    return (
      <PageContainer title="Medical History Details">
        <Typography>Medical history record not found</Typography>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/medical-histories')}
          sx={{ mt: 2 }}
        >
          Back to Medical Histories
        </Button>
      </PageContainer>
    );
  }
  
  if (isEditing) {
    return (
      <PageContainer title="Edit Medical History">
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => setIsEditing(false)}
          sx={{ mb: 3 }}
        >
          Back to Details
        </Button>
        
        <MedicalHistoryForm
          medicalHistory={medicalHistory}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
          isSubmitting={updateLoading}
        />
      </PageContainer>
    );
  }
  
  return (
    <PageContainer title="Medical History Details">
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate('/medical-histories')}
        sx={{ mb: 3 }}
      >
        Back to Medical Histories
      </Button>
      
      <Box mb={3}>
        <Paper sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="h5" gutterBottom>
                {medicalHistory.diseaseName}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                {medicalHistory.endDate ? (
                  <Chip label="Resolved" color="success" size="small" />
                ) : (
                  <Chip label="Active" color="warning" size="small" />
                )}
              </Box>
            </Box>
            <Button 
              variant="outlined" 
              startIcon={<EditIcon />} 
              onClick={handleEdit}
            >
              Edit
            </Button>
          </Box>
          
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">
                Patient
              </Typography>
              <Typography variant="body1">
                {medicalHistory.patient 
                  ? `${medicalHistory.patient.firstName} ${medicalHistory.patient.lastName}` 
                  : 'Unknown Patient'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">
                Start Date
              </Typography>
              <Typography variant="body1">
                {formatDate(medicalHistory.startDate)}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">
                End Date
              </Typography>
              <Typography variant="body1">
                {medicalHistory.endDate ? formatDate(medicalHistory.endDate) : 'Ongoing'}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </PageContainer>
  );
};

export default MedicalHistoryDetails; 