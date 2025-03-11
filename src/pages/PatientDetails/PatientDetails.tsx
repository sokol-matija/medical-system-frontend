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
  Chip, 
  Card, 
  CardContent,
  useTheme
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import PageContainer from '../../components/layout/PageContainer/PageContainer';
import PatientForm from '../../components/patient/PatientForm/PatientForm';
import DataTable from '../../components/common/DataTable/DataTable';
import { useApi } from '../../hooks/useApi';
import { getPatientDetails, updatePatient, createPatient } from '../../api/patientApi';
import { Patient, MedicalHistory, Examination, Prescription } from '../../types';
import { formatDate, formatDateTime, calculateAge } from '../../utils/dateUtils';

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
      id={`patient-tabpanel-${index}`}
      aria-labelledby={`patient-tab-${index}`}
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
 * PatientDetails page component
 * Shows details for a specific patient including medical history, examinations, and prescriptions
 */
const PatientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(searchParams.get('edit') === 'true');
  
  // Check if it's a new patient either by id or by the path
  const isNewPatient = id === 'new' || location.pathname === '/patients/new';
  
  console.log("PatientDetails component rendering with id:", id);
  console.log("Is new patient?", isNewPatient);
  console.log("Current path:", location.pathname);
  console.log("Location state:", location.state);
  
  // API hooks
  const { 
    data: patient, 
    loading, 
    error, 
    execute: fetchPatient 
  } = useApi<Patient, [number]>(getPatientDetails);
  
  const { 
    loading: updateLoading, 
    execute: executeUpdate 
  } = useApi<void, [number, Patient]>(updatePatient);
  
  const {
    error: createError,
    execute: executeCreate
  } = useApi<Patient, [Omit<Patient, 'id'>]>(createPatient);
  
  const theme = useTheme();
  
  // Fetch patient data when component mounts or ID changes
  useEffect(() => {
    console.log("useEffect for fetching patient data running with id:", id);
    if (id && !isNewPatient) {
      console.log("Fetching existing patient data for id:", id);
      fetchPatient(parseInt(id, 10));
    } else if (isNewPatient) {
      console.log("New patient case - not fetching data");
    }
  }, [id, fetchPatient, isNewPatient]);
  
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
    console.log("Form cancel handler called");
    setIsEditing(false);
    if (isNewPatient) {
      console.log("Cancelling new patient form, navigating to /patients");
      navigate('/patients');
    }
  };
  
  // Handle form submit
  const handleSubmit = async (formData: Patient | Omit<Patient, "id">) => {
    try {
      console.log("Form submitted with data:", formData);
      if (isNewPatient) {
        console.log("Creating new patient...");
        // Create new patient
        const newPatient = await executeCreate(formData as Omit<Patient, 'id'>);
        console.log("API response for new patient:", newPatient);
        if (newPatient) {
          console.log("New patient created successfully, redirecting to:", `/patients/${newPatient.id}`);
          navigate(`/patients/${newPatient.id}`);
        }
      } else if (id) {
        console.log("Updating existing patient with ID:", id);
        // Update existing patient
        const patientId = parseInt(id, 10);
        const patientWithId = {
          ...formData,
          id: patientId
        };
        
        await executeUpdate(patientId, patientWithId as Patient);
        console.log("Patient updated successfully");
        fetchPatient(patientId);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving patient:', error);
    }
  };
  
  // Handle adding new medical history
  const handleAddMedicalHistory = () => {
    if (patient) {
      navigate('/medical-histories/new', {
        state: { patientId: patient.id }
      });
    }
  };

  // Handle adding new examination
  const handleAddExamination = () => {
    if (patient) {
      navigate('/examinations/new', {
        state: { patientId: patient.id }
      });
    }
  };

  // Handle adding new prescription
  const handleAddPrescription = () => {
    if (patient) {
      navigate('/prescriptions/new', {
        state: { patientId: patient.id }
      });
    }
  };
  
  // If new patient (id === 'new'), show form directly
  if (isNewPatient) {
    console.log("Rendering new patient form");
    return (
      <PageContainer title="New Patient">
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/patients')}
          sx={{ mb: 3 }}
        >
          Back to Patients
        </Button>
        
        <PatientForm
          onCancel={handleCancel}
          onSubmit={handleSubmit}
          initialValues={location.state?.patientData}
        />
        
        {createError && (
          <Typography color="error" sx={{ mt: 2 }}>
            Error creating patient: {createError.message}
          </Typography>
        )}
      </PageContainer>
    );
  }
  
  // If loading, show loading indicator
  if (loading && !patient) {
    return (
      <PageContainer title="Patient Details">
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }
  
  // If error, show error message
  if (error) {
    return (
      <PageContainer title="Patient Details">
        <Typography color="error">
          Error loading patient: {error.message}
        </Typography>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/patients')}
          sx={{ mt: 2 }}
        >
          Back to Patients
        </Button>
      </PageContainer>
    );
  }
  
  // If no patient, show message
  if (!patient) {
    return (
      <PageContainer title="Patient Details">
        <Typography>Patient not found</Typography>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/patients')}
          sx={{ mt: 2 }}
        >
          Back to Patients
        </Button>
      </PageContainer>
    );
  }
  
  // Medical history column definitions
  const medicalHistoryColumns = [
    { key: 'diseaseName' as keyof MedicalHistory, label: 'Disease' },
    { 
      key: 'startDate' as keyof MedicalHistory, 
      label: 'Start Date',
      render: (row: MedicalHistory) => formatDate(row.startDate)
    },
    { 
      key: 'endDate' as keyof MedicalHistory, 
      label: 'End Date',
      render: (row: MedicalHistory) => row.endDate ? formatDate(row.endDate) : 'Ongoing'
    },
    {
      key: 'id' as keyof MedicalHistory,
      label: 'Status',
      render: (row: MedicalHistory) => 
        row.endDate ? (
          <Chip label="Resolved" color="success" size="small" />
        ) : (
          <Chip label="Active" color="warning" size="small" />
        )
    }
  ];
  
  // Examinations column definitions
  const examinationColumns = [
    { key: 'type' as keyof Examination, label: 'Type' },
    { 
      key: 'examinationDateTime' as keyof Examination, 
      label: 'Date & Time',
      render: (row: Examination) => formatDateTime(row.examinationDateTime)
    },
    { 
      key: 'doctor' as keyof Examination, 
      label: 'Doctor',
      render: (row: Examination) => 
        row.doctor ? `${row.doctor.firstName} ${row.doctor.lastName}` : 'Unknown'
    },
    { key: 'notes' as keyof Examination, label: 'Notes' }
  ];
  
  // Prescriptions column definitions
  const prescriptionColumns = [
    { key: 'medication' as keyof Prescription, label: 'Medication' },
    { key: 'dosage' as keyof Prescription, label: 'Dosage' },
    { key: 'instructions' as keyof Prescription, label: 'Instructions' },
    { 
      key: 'prescriptionDate' as keyof Prescription, 
      label: 'Date',
      render: (row: Prescription) => formatDate(row.prescriptionDate)
    },
    { 
      key: 'doctor' as keyof Prescription, 
      label: 'Doctor',
      render: (row: Prescription) => 
        row.doctor ? `${row.doctor.firstName} ${row.doctor.lastName}` : 'Unknown'
    }
  ];
  
  return (
    <PageContainer title={isEditing ? 'Edit Patient' : 'Patient Details'}>
      {/* Back button */}
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate('/patients')}
        sx={{ mb: 3 }}
      >
        Back to Patients
      </Button>
      
      {isEditing ? (
        // Edit form
        <Paper sx={{ p: 3 }}>
          <PatientForm
            initialValues={patient}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={updateLoading}
          />
        </Paper>
      ) : (
        // Patient details
        <>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h5" component="h2">
                {patient.firstName} {patient.lastName}
              </Typography>
              <Button 
                startIcon={<EditIcon />}
                variant="outlined"
                onClick={handleEdit}
              >
                Edit
              </Button>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Personal Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          OIB
                        </Typography>
                        <Typography variant="body1">
                          {patient.personalIdNumber}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Gender
                        </Typography>
                        <Typography variant="body1">
                          {patient.gender === 'M' ? 'Male' : 'Female'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Date of Birth
                        </Typography>
                        <Typography variant="body1">
                          {formatDate(patient.dateOfBirth)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Age
                        </Typography>
                        <Typography variant="body1">
                          {calculateAge(patient.dateOfBirth)} years
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Medical Statistics
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Active Conditions
                        </Typography>
                        <Typography variant="body1">
                          {patient.medicalHistories?.filter(history => !history.endDate).length || 0}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Past Conditions
                        </Typography>
                        <Typography variant="body1">
                          {patient.medicalHistories?.filter(history => history.endDate).length || 0}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Total Examinations
                        </Typography>
                        <Typography variant="body1">
                          {patient.examinations?.length || 0}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Total Prescriptions
                        </Typography>
                        <Typography variant="body1">
                          {patient.prescriptions?.length || 0}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Tabs for Medical History, Examinations, and Prescriptions */}
          <Paper sx={{ p: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                aria-label="patient details tabs"
              >
                <Tab label="Medical History" />
                <Tab label="Examinations" />
                <Tab label="Prescriptions" />
              </Tabs>
            </Box>
            
            {/* Medical History Tab */}
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleAddMedicalHistory}
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
                  Add Medical History
                </Button>
              </Box>
              <DataTable
                columns={medicalHistoryColumns}
                data={patient.medicalHistories || []}
                keyExtractor={(item) => item.id}
                onView={(item) => navigate(`/medical-histories/${item.id}`)}
                onEdit={(item) => navigate(`/medical-histories/${item.id}?edit=true`)}
                onDelete={(item) => console.log('Delete medical history', item)}
              />
            </TabPanel>
            
            {/* Examinations Tab */}
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleAddExamination}
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
                  Add Examination
                </Button>
              </Box>
              <DataTable
                columns={examinationColumns}
                data={patient.examinations || []}
                keyExtractor={(item) => item.id}
                onView={(item) => navigate(`/examinations/${item.id}`)}
                onEdit={(item) => navigate(`/examinations/${item.id}?edit=true`)}
                onDelete={(item) => console.log('Delete examination', item)}
              />
            </TabPanel>
            
            {/* Prescriptions Tab */}
            <TabPanel value={tabValue} index={2}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleAddPrescription}
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
                  Add Prescription
                </Button>
              </Box>
              <DataTable
                columns={prescriptionColumns}
                data={patient.prescriptions || []}
                keyExtractor={(item) => item.id}
                onView={(item) => navigate(`/prescriptions/${item.id}`)}
                onEdit={(item) => navigate(`/prescriptions/${item.id}?edit=true`)}
                onDelete={(item) => console.log('Delete prescription', item)}
              />
            </TabPanel>
          </Paper>
        </>
      )}
      
      {/* TODO: Add dialogs for adding/editing medical history, examinations, and prescriptions */}
    </PageContainer>
  );
};

export default PatientDetails; 