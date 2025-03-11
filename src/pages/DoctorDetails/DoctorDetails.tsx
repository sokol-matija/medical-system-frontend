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
  List,
  ListItemText,
  ListItemButton,
  useTheme
} from '@mui/material';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import DateRangeIcon from '@mui/icons-material/DateRange';
import PageContainer from '../../components/layout/PageContainer/PageContainer';
import { useApi } from '../../hooks/useApi';
import { getDoctorDetails, createDoctor, updateDoctor } from '../../api/doctorApi';
import { Doctor } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import DoctorForm from '../../components/doctor/DoctorForm/DoctorForm';

/**
 * DoctorDetails page component
 * Shows details for a specific doctor and allows editing
 */
const DoctorDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isEditing, setIsEditing] = useState(searchParams.get('edit') === 'true');
  const theme = useTheme();
  
  // Check if it's a new doctor either by id or by the path
  const isNewDoctor = id === 'new' || location.pathname === '/doctors/new';
  
  // API hooks
  const { 
    data: doctor, 
    loading, 
    error, 
    execute: fetchDoctor 
  } = useApi<Doctor, [number]>(getDoctorDetails);
  
  const {
    error: createError,
    execute: executeCreate 
  } = useApi<Doctor, [Omit<Doctor, 'id'>]>(createDoctor);
  
  const { 
    error: updateError,
    execute: executeUpdate 
  } = useApi<void, [number, Doctor]>(updateDoctor);
  
  // Fetch doctor data when component mounts or ID changes
  useEffect(() => {
    if (id && !isNewDoctor) {
      fetchDoctor(parseInt(id, 10));
    }
  }, [id, fetchDoctor, isNewDoctor]);
  
  // Handle edit button click
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  // Handle form cancel
  const handleCancel = () => {
    setIsEditing(false);
    if (isNewDoctor) {
      navigate('/doctors');
    }
  };
  
  // Handle form submit
  const handleSubmit = async (formData: Doctor | Omit<Doctor, 'id'>) => {
    try {
      if (isNewDoctor) {
        // Create new doctor
        const newDoctor = await executeCreate(formData as Omit<Doctor, 'id'>);
        if (newDoctor) {
          navigate(`/doctors/${newDoctor.id}`);
        }
      } else if (id) {
        // Update existing doctor
        const doctorId = parseInt(id, 10);
        await executeUpdate(doctorId, { ...formData, id: doctorId } as Doctor);
        fetchDoctor(doctorId);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving doctor:', error);
    }
  };
  
  // Container and item animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  // If new doctor, show form directly
  if (isNewDoctor) {
    return (
      <PageContainer title="New Doctor">
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/doctors')}
          sx={{ mb: 3 }}
        >
          Back to Doctors
        </Button>
        
        <DoctorForm
          onCancel={handleCancel}
          onSubmit={handleSubmit}
          initialValues={location.state?.doctorData}
        />
        
        {createError && (
          <Typography color="error" sx={{ mt: 2 }}>
            Error creating doctor: {createError.message}
          </Typography>
        )}
      </PageContainer>
    );
  }
  
  // If loading, show loading indicator
  if (loading && !doctor) {
    return (
      <PageContainer title="Doctor Details">
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  // If error, show error message
  if (error) {
    return (
      <PageContainer title="Doctor Details">
        <Box sx={{ p: 3 }}>
          <Typography color="error">
            Error loading doctor details: {error.message}
          </Typography>
          <Button 
            sx={{ mt: 2 }} 
            variant="contained" 
            onClick={() => navigate('/doctors')}
          >
            Back to Doctors
          </Button>
        </Box>
      </PageContainer>
    );
  }
  
  const examinations = doctor?.examinations || [];
  
  return (
    <PageContainer title="Doctor Details">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button 
            component={motion.button}
            variants={itemVariants}
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/doctors')}
          >
            Back to Doctors
          </Button>
          
          {!isEditing && (
            <Button 
              component={motion.button}
              variants={itemVariants}
              startIcon={<EditIcon />}
              variant="outlined"
              onClick={handleEdit}
            >
              Edit
            </Button>
          )}
        </Box>

        {isEditing ? (
          <Paper 
            component={motion.div}
            variants={itemVariants}
            sx={{ p: 3, mb: 3 }}
          >
            <DoctorForm
              initialValues={doctor || undefined}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
            
            {updateError && (
              <Typography color="error" sx={{ mt: 2 }}>
                Error updating doctor: {updateError.message}
              </Typography>
            )}
          </Paper>
        ) : (
          <>
            <Paper 
              component={motion.div}
              variants={itemVariants}
              sx={{ 
                p: 3, 
                mb: 3,
                backgroundImage: `linear-gradient(to right, ${theme.palette.background.paper}, ${theme.palette.primary.dark}15)`,
                borderLeft: `4px solid ${theme.palette.primary.main}`
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PersonIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    <Typography variant="h6">
                      Dr. {doctor?.firstName} {doctor?.lastName}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Specialization:</strong> {doctor?.specialization}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocalHospitalIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    <Typography variant="h6">
                      Summary
                    </Typography>
                  </Box>
                  
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Total Examinations:</strong> {examinations.length}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
            
            <Paper 
              component={motion.div}
              variants={itemVariants}
              sx={{ p: 3 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DateRangeIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="h6">
                  Recent Examinations
                </Typography>
              </Box>
              
              {examinations.length > 0 ? (
                <List>
                  {examinations.slice(0, 5).map((examination, index) => (
                    <React.Fragment key={examination.id}>
                      <ListItemButton 
                        onClick={() => navigate(`/examinations/${examination.id}`)}
                        sx={{ 
                          borderRadius: 1,
                          '&:hover': {
                            backgroundColor: `${theme.palette.primary.main}15`
                          }
                        }}
                      >
                        <ListItemText
                          primary={`${examination.type} Examination`}
                          secondary={
                            <>
                              <Typography component="span" variant="body2" color="text.secondary">
                                {formatDate(examination.examinationDateTime)}
                              </Typography>
                              <br />
                              <Typography component="span" variant="body2" color="text.secondary">
                                Patient: {examination.patient 
                                  ? `${examination.patient.firstName} ${examination.patient.lastName}` 
                                  : 'Unknown'}
                              </Typography>
                            </>
                          }
                        />
                      </ListItemButton>
                      {index < examinations.slice(0, 5).length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  No examinations found.
                </Typography>
              )}
              
              {examinations.length > 5 && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => navigate(`/doctors/${doctor?.id}/examinations`)}
                  >
                    View All Examinations
                  </Button>
                </Box>
              )}
            </Paper>
          </>
        )}
      </motion.div>
    </PageContainer>
  );
};

export default DoctorDetails; 