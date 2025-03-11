import React, { useEffect, useState } from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  CircularProgress, 
  Paper,
  List,
  ListItemText,
  ListItemButton,
  Button,
  useTheme
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { motion } from 'framer-motion';
import PageContainer from '../../components/layout/PageContainer/PageContainer';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import { getPatients } from '../../api/patientApi';
import { getDoctors } from '../../api/doctorApi';
import { getExaminations } from '../../api/examinationApi';
import { getMedicalHistories } from '../../api/medicalHistoryApi';
import { getPrescriptions } from '../../api/prescriptionApi';
import { Patient, Examination, MedicalHistory, Prescription, Doctor } from '../../types';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/dateUtils';
import PersonIcon from '@mui/icons-material/Person';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import MedicationIcon from '@mui/icons-material/Medication';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import { getExaminationTypeDescription } from '../../utils/examinationUtils';

/**
 * Dashboard component - landing page of the application
 * Displays summary statistics and recent activity
 */
const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalExaminations: 0,
    activeConditions: 0,
    totalPrescriptions: 0
  });
  
  const [examinationsByType, setExaminationsByType] = useState<{ name: string; count: number }[]>([]);
  const [recentExaminations, setRecentExaminations] = useState<Examination[]>([]);
  const [recentPrescriptions, setRecentPrescriptions] = useState<Prescription[]>([]);
  
  // API hooks for fetching data
  const { data: patients, loading: loadingPatients, execute: fetchPatients } = useApi<Patient[], []>(getPatients);
  const { data: doctors, loading: loadingDoctors, execute: fetchDoctors } = useApi<Doctor[], []>(getDoctors);
  const { data: examinations, loading: loadingExaminations, execute: fetchExaminations } = useApi<Examination[], []>(getExaminations);
  const { data: medicalHistories, loading: loadingMedicalHistories, execute: fetchMedicalHistories } = useApi<MedicalHistory[], []>(getMedicalHistories);
  const { data: prescriptions, loading: loadingPrescriptions, execute: fetchPrescriptions } = useApi<Prescription[], []>(getPrescriptions);
  
  // Fetch data when component mounts
  useEffect(() => {
    fetchPatients();
    fetchDoctors();
    fetchExaminations();
    fetchMedicalHistories();
    fetchPrescriptions();
  }, [fetchPatients, fetchDoctors, fetchExaminations, fetchMedicalHistories, fetchPrescriptions]);
  
  // Update stats when data is loaded
  useEffect(() => {
    if (patients && doctors && examinations && medicalHistories && prescriptions) {
      // Calculate statistics
      const activeConditionsCount = medicalHistories.filter(history => !history.endDate).length;
      
      // Count examinations by type
      const countByType = new Map<string, number>();
      examinations.forEach(exam => {
        // Convert type number to readable name
        const typeName = getExaminationTypeDescription(exam.type as unknown as number);
        const count = countByType.get(typeName) || 0;
        countByType.set(typeName, count + 1);
      });
      
      // Convert to array for chart
      const examinationStats = Array.from(countByType.entries()).map(([name, count]) => ({
        name,
        count
      }));
      
      // Get recent examinations (last 5)
      const sortedExaminations = [...examinations].sort((a, b) => 
        new Date(b.examinationDateTime).getTime() - new Date(a.examinationDateTime).getTime()
      );
      
      // Get recent prescriptions (last 5)
      const sortedPrescriptions = [...prescriptions].sort((a, b) => 
        new Date(b.prescriptionDate).getTime() - new Date(a.prescriptionDate).getTime()
      );
      
      // Update state
      setStats({
        totalPatients: patients.length,
        totalDoctors: doctors.length,
        totalExaminations: examinations.length,
        activeConditions: activeConditionsCount,
        totalPrescriptions: prescriptions.length
      });
      
      setExaminationsByType(examinationStats);
      setRecentExaminations(sortedExaminations.slice(0, 5));
      setRecentPrescriptions(sortedPrescriptions.slice(0, 5));
    }
  }, [patients, doctors, examinations, medicalHistories, prescriptions]);

  // Colors for charts
  const COLORS = ['#3B82F6', '#4F46E5', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  // Check if all data is loading
  const isLoading = loadingPatients || loadingDoctors || loadingExaminations || 
    loadingMedicalHistories || loadingPrescriptions;

  // Container animation variants
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

  // Item animation variants
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <PageContainer title="Dashboard">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <Box mb={4}>
            <Typography variant="h4" gutterBottom sx={{ 
              fontWeight: 'bold',
              background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
              fontSize: { xs: '1.75rem', sm: '2.125rem' }
            }}>
              Welcome, {user?.username || 'User'}
            </Typography>
            <Typography variant="body1" sx={{ color: '#E2E8F0' }}>
              Medical System Dashboard - Your daily overview
            </Typography>
          </Box>
        </motion.div>
        
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {/* Statistics Cards */}
            <Grid item xs={6} sm={6} md={2.4}>
              <motion.div variants={itemVariants}>
                <StatCard
                  title="Patients"
                  value={stats.totalPatients}
                  color={theme.palette.primary.main}
                  onClick={() => navigate('/patients')}
                  icon={<PersonIcon fontSize="large" />}
                />
              </motion.div>
            </Grid>
            <Grid item xs={6} sm={6} md={2.4}>
              <motion.div variants={itemVariants}>
                <StatCard
                  title="Doctors"
                  value={stats.totalDoctors}
                  color={theme.palette.secondary.main}
                  onClick={() => navigate('/doctors')}
                  icon={<MedicalServicesIcon fontSize="large" />}
                />
              </motion.div>
            </Grid>
            <Grid item xs={6} sm={6} md={2.4}>
              <motion.div variants={itemVariants}>
                <StatCard
                  title="Examinations"
                  value={stats.totalExaminations}
                  color="#d32f2f"
                  onClick={() => navigate('/examinations')}
                  icon={<MonitorHeartIcon fontSize="large" />}
                />
              </motion.div>
            </Grid>
            <Grid item xs={6} sm={6} md={2.4}>
              <motion.div variants={itemVariants}>
                <StatCard
                  title="Active Conditions"
                  value={stats.activeConditions}
                  color="#ff9800"
                  onClick={() => navigate('/medical-histories')}
                  icon={<HealthAndSafetyIcon fontSize="large" />}
                />
              </motion.div>
            </Grid>
            <Grid item xs={6} sm={6} md={2.4}>
              <motion.div variants={itemVariants}>
                <StatCard
                  title="Prescriptions"
                  value={stats.totalPrescriptions}
                  color="#9c27b0"
                  onClick={() => navigate('/prescriptions')}
                  icon={<MedicationIcon fontSize="large" />}
                />
              </motion.div>
            </Grid>
            
            {/* Charts */}
            <Grid item xs={12} md={6}>
              <motion.div variants={itemVariants}>
                <Paper sx={{ 
                  p: { xs: 1, sm: 2 }, 
                  height: '100%', 
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)', 
                  borderRadius: 2,
                  bgcolor: 'rgba(26, 32, 44, 0.98)'
                }}>
                  <Typography variant="h6" gutterBottom sx={{ 
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                    color: '#E2E8F0',
                    fontWeight: 'bold'
                  }}>
                    Examinations by Type
                  </Typography>
                  {examinationsByType.length > 0 ? (
                    <Box sx={{ width: '100%', height: 300, overflowX: 'auto' }}>
                      <ResponsiveContainer width="100%" height="100%" minWidth={350}>
                        <BarChart
                          data={examinationsByType}
                          margin={{ top: 20, right: 20, left: 10, bottom: 60 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                          <XAxis 
                            dataKey="name" 
                            tick={{ fontSize: 12, fill: '#E2E8F0' }}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                          />
                          <YAxis 
                            tick={{ fontSize: 12, fill: '#E2E8F0' }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1F2937', 
                              border: '1px solid #3B82F6',
                              color: '#E2E8F0'
                            }}
                            labelStyle={{ color: '#E2E8F0', fontWeight: 'bold' }}
                          />
                          <Legend 
                            wrapperStyle={{ 
                              fontSize: 12, 
                              color: '#E2E8F0',
                              paddingTop: 20,
                              width: '90%',
                              marginLeft: 'auto',
                              marginRight: 'auto'
                            }}
                            formatter={(value) => <span style={{ color: '#E2E8F0' }}>{value}</span>}
                          />
                          <Bar dataKey="count" fill={theme.palette.primary.main} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
                      <Typography variant="body1" sx={{ color: '#E2E8F0' }}>
                        No examination data available
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </motion.div>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <motion.div variants={itemVariants}>
                <Paper sx={{ 
                  p: { xs: 1, sm: 2 }, 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)', 
                  borderRadius: 2,
                  bgcolor: 'rgba(26, 32, 44, 0.98)'
                }}>
                  <Typography variant="h6" gutterBottom sx={{ 
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                    color: '#E2E8F0',
                    fontWeight: 'bold'
                  }}>
                    Patient Gender Distribution
                  </Typography>
                  {patients && patients.length > 0 ? (
                    <Box sx={{ width: '100%', height: 300, display: 'flex', justifyContent: 'center' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Male', value: patients.filter(p => p.gender === 'M').length },
                              { name: 'Female', value: patients.filter(p => p.gender === 'F').length }
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            outerRadius={80}
                            fill={theme.palette.primary.main}
                            dataKey="value"
                            label={({ name, percent, index }) => {
                              const color = COLORS[index % COLORS.length];
                              return (
                                <text x={0} y={0} fill={color} textAnchor="middle" dominantBaseline="central" fontWeight="bold">
                                  {`${name}: ${(percent * 100).toFixed(0)}%`}
                                </text>
                              );
                            }}
                          >
                            {[
                              { name: 'Male', value: patients.filter(p => p.gender === 'M').length },
                              { name: 'Female', value: patients.filter(p => p.gender === 'F').length }
                            ].map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1F2937', 
                              border: '1px solid #3B82F6',
                              color: '#E2E8F0'
                            }}
                            labelStyle={{ color: '#E2E8F0', fontWeight: 'bold' }}
                          />
                          <Legend 
                            formatter={(value) => <span style={{ color: '#FFBB28', fontWeight: 'bold' }}>{value}</span>}
                            wrapperStyle={{ paddingTop: 20 }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
                      <Typography variant="body1" sx={{ color: '#E2E8F0' }}>
                        No patient data available
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </motion.div>
            </Grid>
            
            {/* Recent Activity */}
            <Grid item xs={12} md={6}>
              <motion.div variants={itemVariants}>
                <Paper sx={{ 
                  p: 2, 
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)', 
                  borderRadius: 2,
                  bgcolor: 'rgba(26, 32, 44, 0.98)'
                }}>
                  <Typography variant="h6" gutterBottom sx={{ 
                    color: '#E2E8F0',
                    fontWeight: 'bold',
                    fontSize: { xs: '1rem', sm: '1.25rem' }
                  }}>
                    Recent Examinations
                  </Typography>
                  <List>
                    {recentExaminations.length > 0 ? (
                      recentExaminations.map((exam, index) => (
                        <motion.div
                          key={exam.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <ListItemButton 
                            onClick={() => navigate(`/examinations/${exam.id}`)}
                            divider={index < recentExaminations.length - 1}
                            sx={{
                              borderRadius: 1,
                              my: 0.5,
                              transition: 'all 0.2s',
                              '&:hover': {
                                backgroundColor: `${theme.palette.primary.main}30`,
                                transform: 'translateX(5px)'
                              }
                            }}
                          >
                            <ListItemText
                              primary={
                                <Typography variant="subtitle2" sx={{ color: '#E2E8F0', fontWeight: 'medium' }}>
                                  {exam.patient ? `${exam.patient.firstName} ${exam.patient.lastName}` : 'Unknown Patient'}
                                </Typography>
                              }
                              secondary={
                                <>
                                  <Typography variant="body2" component="span" sx={{ color: '#9CA3AF' }}>
                                    {getExaminationTypeDescription(exam.type as unknown as number)} - {formatDate(exam.examinationDateTime)}
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: '#9CA3AF' }} noWrap>
                                    {exam.doctor ? `Dr. ${exam.doctor.firstName} ${exam.doctor.lastName}` : 'Unknown Doctor'}
                                  </Typography>
                                </>
                              }
                            />
                          </ListItemButton>
                        </motion.div>
                      ))
                    ) : (
                      <Typography variant="body1" sx={{ color: '#E2E8F0', p: 2, textAlign: 'center' }}>
                        No recent examinations
                      </Typography>
                    )}
                  </List>
                  {recentExaminations.length > 0 && (
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button 
                        variant="text" 
                        color="primary" 
                        onClick={() => navigate('/examinations')}
                        sx={{ 
                          transition: 'all 0.3s',
                          '&:hover': { transform: 'translateY(-2px)' },
                          color: '#3B82F6'
                        }}
                      >
                        View All Examinations
                      </Button>
                    </Box>
                  )}
                </Paper>
              </motion.div>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <motion.div variants={itemVariants}>
                <Paper sx={{ 
                  p: 2, 
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)', 
                  borderRadius: 2,
                  bgcolor: 'rgba(26, 32, 44, 0.98)'
                }}>
                  <Typography variant="h6" gutterBottom sx={{ 
                    color: '#E2E8F0',
                    fontWeight: 'bold',
                    fontSize: { xs: '1rem', sm: '1.25rem' }
                  }}>
                    Recent Prescriptions
                  </Typography>
                  <List>
                    {recentPrescriptions.length > 0 ? (
                      recentPrescriptions.map((prescription, index) => (
                        <motion.div
                          key={prescription.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <ListItemButton 
                            onClick={() => navigate(`/prescriptions/${prescription.id}`)}
                            divider={index < recentPrescriptions.length - 1}
                            sx={{
                              borderRadius: 1,
                              my: 0.5,
                              transition: 'all 0.2s',
                              '&:hover': {
                                backgroundColor: `${theme.palette.primary.main}30`,
                                transform: 'translateX(5px)'
                              }
                            }}
                          >
                            <ListItemText
                              primary={
                                <Typography variant="subtitle2" sx={{ color: '#E2E8F0', fontWeight: 'medium' }}>
                                  {prescription.patient ? `${prescription.patient.firstName} ${prescription.patient.lastName}` : 'Unknown Patient'}
                                </Typography>
                              }
                              secondary={
                                <>
                                  <Typography variant="body2" component="span" sx={{ color: '#9CA3AF' }}>
                                    {prescription.medication} - {formatDate(prescription.prescriptionDate)}
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: '#9CA3AF' }} noWrap>
                                    {prescription.doctor ? `Dr. ${prescription.doctor.firstName} ${prescription.doctor.lastName}` : 'Unknown Doctor'}
                                  </Typography>
                                </>
                              }
                            />
                          </ListItemButton>
                        </motion.div>
                      ))
                    ) : (
                      <Typography variant="body1" sx={{ color: '#E2E8F0', p: 2, textAlign: 'center' }}>
                        No recent prescriptions
                      </Typography>
                    )}
                  </List>
                  {recentPrescriptions.length > 0 && (
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button 
                        variant="text" 
                        color="primary" 
                        onClick={() => navigate('/prescriptions')}
                        sx={{ 
                          transition: 'all 0.3s',
                          '&:hover': { transform: 'translateY(-2px)' },
                          color: '#3B82F6'
                        }}
                      >
                        View All Prescriptions
                      </Button>
                    </Box>
                  )}
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        )}
      </motion.div>
    </PageContainer>
  );
};

/**
 * Props for the StatCard component
 */
interface StatCardProps {
  title: string;
  value: number;
  color: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

/**
 * StatCard component displays a statistic with a title and value
 */
const StatCard: React.FC<StatCardProps> = ({ title, value, color, icon, onClick }) => {
  return (
    <Card 
      sx={{ 
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
        borderRadius: 2, 
        height: '100%',
        transition: 'all 0.3s',
        bgcolor: 'rgba(26, 32, 44, 0.98)',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
          cursor: onClick ? 'pointer' : 'default'
        }
      }} 
      onClick={onClick}
    >
      <CardContent sx={{ position: 'relative', p: { xs: 1.5, sm: 2 } }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          mb: 1
        }}>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 'bold',
              fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' }
            }}
          >
            {title}
          </Typography>
          {icon && (
            <Box sx={{ 
              color: 'white', 
              bgcolor: color, 
              p: { xs: 0.5, sm: 1 }, 
              borderRadius: '50%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              {icon}
            </Box>
          )}
        </Box>
        <Typography 
          variant="h4" 
          component="div" 
          sx={{ 
            fontWeight: 'bold', 
            color,
            fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' }
          }}
        >
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default Dashboard; 