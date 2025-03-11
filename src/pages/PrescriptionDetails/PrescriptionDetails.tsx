import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  CircularProgress, 
  Button,
  Divider,
  useTheme
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import GetAppIcon from '@mui/icons-material/GetApp';
import PageContainer from '../../components/layout/PageContainer/PageContainer';
import PrescriptionForm from '../../components/prescription/PrescriptionForm/PrescriptionForm';
import { useApi } from '../../hooks/useApi';
import { getPrescriptionById, updatePrescription, createPrescription, getPrescriptionPdf } from '../../api/prescriptionApi';
import { Prescription } from '../../types';
import { formatDate } from '../../utils/dateUtils';

/**
 * PrescriptionDetails page component
 * Shows details for a specific prescription and allows editing
 */
const PrescriptionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isEditing, setIsEditing] = useState(searchParams.get('edit') === 'true');
  const theme = useTheme();
  
  // Check if it's a new prescription either by id or by the path
  const isNewPrescription = id === 'new' || location.pathname === '/prescriptions/new';
  
  // API hooks
  const { 
    data: prescription, 
    loading, 
    error, 
    execute: fetchPrescription 
  } = useApi<Prescription, [number]>(getPrescriptionById);
  
  const { 
    loading: updateLoading, 
    execute: executeUpdate 
  } = useApi<void, [number, Prescription]>(updatePrescription);
  
  const {
    loading: downloadLoading,
    execute: executeDownload
  } = useApi<Blob, [number]>(getPrescriptionPdf);
  
  const {
    error: createError,
    execute: executeCreate
  } = useApi<Prescription, [Omit<Prescription, 'id'>]>(createPrescription);
  
  // Fetch prescription data when component mounts or ID changes
  useEffect(() => {
    if (id && !isNewPrescription) {
      fetchPrescription(parseInt(id, 10));
    }
  }, [id, fetchPrescription, isNewPrescription]);
  
  // Handle edit button click
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  // Handle form cancel
  const handleCancel = () => {
    setIsEditing(false);
    if (isNewPrescription) {
      navigate('/prescriptions');
    }
  };
  
  /**
   * Handle form submit
   */
  const handleSubmit = async (formData: Prescription | Omit<Prescription, 'id'>) => {
    try {
      if (isNewPrescription) {
        // Create new prescription
        const newPrescription = await executeCreate(formData as Omit<Prescription, 'id'>);
        if (newPrescription) {
          navigate(`/prescriptions/${newPrescription.id}`);
        }
      } else if (id) {
        // Update existing prescription
        const prescriptionId = parseInt(id, 10);
        await executeUpdate(prescriptionId, { ...formData, id: prescriptionId } as Prescription);
        fetchPrescription(prescriptionId);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving prescription:', error);
    }
  };
  
  /**
   * Handle download prescription as PDF
   */
  const handleDownloadPdf = async () => {
    if (id && id !== 'new') {
      try {
        const blob = await executeDownload(parseInt(id, 10));
        
        // Create a temporary URL for the blob
        if (blob) {
          const url = window.URL.createObjectURL(blob);
          
          // Create a link element to download the file
          const a = document.createElement('a');
          a.href = url;
          a.download = `prescription_${id}.pdf`;
          document.body.appendChild(a);
          a.click();
          
          // Clean up
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
      } catch (error) {
        console.error('Error downloading prescription PDF:', error);
        alert('Failed to download PDF. Please try again later.');
      }
    }
  };
  
  // If new prescription (id === 'new'), show form directly
  if (isNewPrescription) {
    // Get examinationId and patientId from location state if they exist
    const examinationId = location.state?.examinationId;
    const patientId = location.state?.patientId;
    
    return (
      <PageContainer title="New Prescription">
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/prescriptions')}
          sx={{ mb: 3 }}
        >
          Back to Prescriptions
        </Button>
        
        <Paper 
          sx={{ 
            p: 3, 
            borderRadius: 2,
            boxShadow: 3,
            backgroundImage: `linear-gradient(to right, ${theme.palette.background.paper}, ${theme.palette.primary.dark}10)`
          }}
        >
          <PrescriptionForm
            onCancel={handleCancel}
            onSubmit={handleSubmit}
            prescription={examinationId ? { examinationId, patientId } as Partial<Prescription> as Prescription : undefined}
          />
          
          {createError && (
            <Typography color="error" sx={{ mt: 2 }}>
              Error creating prescription: {createError.message}
            </Typography>
          )}
        </Paper>
      </PageContainer>
    );
  }
  
  // If loading, show loading indicator
  if (loading && !prescription) {
    return (
      <PageContainer title="Prescription Details">
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }
  
  // If error, show error message
  if (error) {
    return (
      <PageContainer title="Prescription Details">
        <Typography color="error">
          Error loading prescription: {error.message}
        </Typography>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/prescriptions')}
          sx={{ mt: 2 }}
        >
          Back to Prescriptions
        </Button>
      </PageContainer>
    );
  }
  
  // If no prescription, show message
  if (!prescription) {
    return (
      <PageContainer title="Prescription Details">
        <Typography>Prescription not found</Typography>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/prescriptions')}
          sx={{ mt: 2 }}
        >
          Back to Prescriptions
        </Button>
      </PageContainer>
    );
  }
  
  if (isEditing) {
    return (
      <PageContainer title="Edit Prescription">
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => setIsEditing(false)}
          sx={{ mb: 3 }}
        >
          Back to Details
        </Button>
        
        <PrescriptionForm
          prescription={prescription}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
          isSubmitting={updateLoading}
        />
      </PageContainer>
    );
  }
  
  return (
    <PageContainer title="Prescription Details">
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate('/prescriptions')}
        sx={{ mb: 3 }}
      >
        Back to Prescriptions
      </Button>
      
      <Box mb={3}>
        <Paper sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="h5" gutterBottom>
                {prescription.medication}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                {prescription.dosage}
              </Typography>
            </Box>
            <Box display="flex" gap={2}>
              <Button 
                variant="outlined" 
                startIcon={<EditIcon />} 
                onClick={handleEdit}
              >
                Edit
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<GetAppIcon />}
                onClick={handleDownloadPdf}
                disabled={downloadLoading}
              >
                Download PDF
              </Button>
            </Box>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">
                Patient
              </Typography>
              <Typography variant="body1">
                {prescription.patient 
                  ? `${prescription.patient.firstName} ${prescription.patient.lastName}` 
                  : 'Unknown Patient'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">
                Doctor
              </Typography>
              <Typography variant="body1">
                {prescription.doctor 
                  ? `${prescription.doctor.firstName} ${prescription.doctor.lastName}` 
                  : 'Unknown Doctor'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">
                Prescription Date
              </Typography>
              <Typography variant="body1">
                {formatDate(prescription.prescriptionDate)}
              </Typography>
            </Grid>
            {prescription.examination && (
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Related Examination
                </Typography>
                <Button 
                  variant="text" 
                  color="primary"
                  size="small"
                  onClick={() => navigate(`/examinations/${prescription.examinationId}`)}
                >
                  View Examination
                </Button>
              </Grid>
            )}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="textSecondary">
                Instructions
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                {prescription.instructions || 'No instructions provided'}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </PageContainer>
  );
};

export default PrescriptionDetails; 