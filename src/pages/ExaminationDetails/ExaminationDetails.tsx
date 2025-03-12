import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Tab, 
  Tabs, 
  CircularProgress, 
  Button,
  Card,
  CardContent
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import PageContainer from '../../components/layout/PageContainer/PageContainer';
import ExaminationForm from '../../components/examination/ExaminationForm/ExaminationForm';
import MedicalImagesGallery from '../../components/examination/MedicalImagesGallery/MedicalImagesGallery';
import { useApi } from '../../hooks/useApi';
import { getExaminationDetails, updateExamination, createExamination } from '../../api/examinationApi';
import { Examination } from '../../types';
import { formatDate, formatDateTime } from '../../utils/dateUtils';

// Tab panel interface
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

/**
 * TabPanel component for the tabbed interface
 */
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`examination-tabpanel-${index}`}
      aria-labelledby={`examination-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

/**
 * ExaminationDetails page component
 * Shows details for a specific examination including related prescriptions and medical images
 */
const ExaminationDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(searchParams.get('edit') === 'true');
  
  // Check if it's a new examination either by id or by the path
  const isNewExamination = id === 'new' || location.pathname === '/examinations/new';
  
  // API hooks
  const { 
    data: examination, 
    loading, 
    error, 
    execute: fetchExamination 
  } = useApi<Examination, [number]>(getExaminationDetails);
  
  const { 
    loading: updateLoading, 
    execute: executeUpdate 
  } = useApi<void, [number, Examination]>(updateExamination);
  
  const {
    error: createError,
    execute: executeCreate
  } = useApi<Examination, [Omit<Examination, 'id'>]>(createExamination);
  
  // Fetch examination data when component mounts or ID changes
  useEffect(() => {
    if (id && !isNewExamination) {
      fetchExamination(parseInt(id, 10));
    }
  }, [id, fetchExamination, isNewExamination]);
  
  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle edit button click
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  // Handle form cancel
  const handleCancel = () => {
    setIsEditing(false);
    if (isNewExamination) {
      navigate('/examinations');
    }
  };
  
  // Handle form submit
  const handleSubmit = async (formData: Examination | Omit<Examination, 'id'>) => {
    try {
      if (isNewExamination) {
        // Check if formData already has an ID (meaning it was already created by the form component)
        if ('id' in formData) {
          // If the data already has an ID, it means the API call was already made
          // by the child component, so we just navigate to the details page
          navigate(`/examinations/${formData.id}`);
        } else {
          // Only create if not already created
          const newExamination = await executeCreate(formData as Omit<Examination, 'id'>);
          if (newExamination) {
            navigate(`/examinations/${newExamination.id}`);
          }
        }
      } else if (id) {
        // Update existing examination
        const examinationId = parseInt(id, 10);
        await executeUpdate(examinationId, { ...formData, id: examinationId } as Examination);
        fetchExamination(examinationId);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving examination:', error);
    }
  };
  
  // If it's a new examination, show the form
  if (isNewExamination) {
    return (
      <PageContainer title="New Examination">
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/examinations')}
          sx={{ mb: 3 }}
        >
          Back to Examinations
        </Button>
        
        <Paper sx={{ p: 3 }}>
          <ExaminationForm
            onCancel={handleCancel}
            onSubmit={handleSubmit}
          />
          
          {createError && (
            <Typography color="error" sx={{ mt: 2 }}>
              Error creating examination: {createError.message}
            </Typography>
          )}
        </Paper>
      </PageContainer>
    );
  }
  
  // If loading, show loading indicator
  if (loading && !examination) {
    return (
      <PageContainer title="Examination Details">
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }
  
  // If error, show error message
  if (error) {
    return (
      <PageContainer title="Examination Details">
        <Typography color="error">
          Error loading examination: {error.message}
        </Typography>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/examinations')}
          sx={{ mt: 2 }}
        >
          Back to Examinations
        </Button>
      </PageContainer>
    );
  }
  
  // If no examination, show message
  if (!examination) {
    return (
      <PageContainer title="Examination Details">
        <Typography>Examination not found</Typography>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/examinations')}
          sx={{ mt: 2 }}
        >
          Back to Examinations
        </Button>
      </PageContainer>
    );
  }
  
  if (isEditing) {
    return (
      <PageContainer title="Edit Examination">
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => setIsEditing(false)}
          sx={{ mb: 3 }}
        >
          Back to Details
        </Button>
        
        <ExaminationForm
          examination={examination}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
          isSubmitting={updateLoading}
        />
      </PageContainer>
    );
  }
  
  return (
    <PageContainer title="Examination Details">
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate('/examinations')}
        sx={{ mb: 3 }}
      >
        Back to Examinations
      </Button>
      
      <Box mb={3}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="h5" gutterBottom>
                {examination.type} Examination
              </Typography>
              <Typography variant="body1" color="textSecondary" gutterBottom>
                {formatDateTime(examination.examinationDateTime)}
              </Typography>
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
                {examination.patient 
                  ? `${examination.patient.firstName} ${examination.patient.lastName}` 
                  : 'Unknown Patient'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">
                Doctor
              </Typography>
              <Typography variant="body1">
                {examination.doctor 
                  ? `${examination.doctor.firstName} ${examination.doctor.lastName}` 
                  : 'Unknown Doctor'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="textSecondary">
                Notes
              </Typography>
              <Typography variant="body1">
                {examination.notes || 'No notes provided'}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="examination details tabs"
          >
            <Tab label="Medical Images" id="tab-0" aria-controls="tabpanel-0" />
            <Tab label="Prescriptions" id="tab-1" aria-controls="tabpanel-1" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Medical Images
          </Typography>
          {examination.id && (
            <MedicalImagesGallery examinationId={examination.id} />
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Prescriptions
          </Typography>
          {examination.prescriptions && examination.prescriptions.length > 0 ? (
            <Grid container spacing={2}>
              {examination.prescriptions.map((prescription) => (
                <Grid item xs={12} sm={6} key={prescription.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1">{prescription.medication}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Dosage: {prescription.dosage}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Prescribed: {formatDate(prescription.prescriptionDate)}
                      </Typography>
                      <Typography variant="body2">
                        {prescription.instructions}
                      </Typography>
                      <Button 
                        variant="contained" 
                        size="small" 
                        sx={{ mt: 1 }}
                        // View/PDF functionality will be implemented separately
                      >
                        View PDF
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography>No prescriptions available</Typography>
          )}
          
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2 }}
            // Create prescription functionality will be implemented separately
          >
            Create Prescription
          </Button>
        </TabPanel>
      </Box>
    </PageContainer>
  );
};

export default ExaminationDetails; 