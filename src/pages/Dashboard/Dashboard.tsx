import React, { useEffect, useState, useMemo, useCallback } from 'react';
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
  useTheme,
  Slider,
  Chip,
  Stack,
  IconButton,
  Tooltip as MuiTooltip
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
  Cell,
  AreaChart,
  Area,
  ReferenceLine
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
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
import { formatDate, getAge } from '../../utils/dateUtils';
import PersonIcon from '@mui/icons-material/Person';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import MedicationIcon from '@mui/icons-material/Medication';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import TimelineIcon from '@mui/icons-material/Timeline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
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
  
  // State for patient age distribution
  const [patientAgeDistribution, setPatientAgeDistribution] = useState<{ age: number; count: number }[]>([]);
  const [ageStats, setAgeStats] = useState({ mean: 0, median: 0, mode: 0, range: [0, 100] });
  const [selectedAgeRange, setSelectedAgeRange] = useState<[number, number]>([0, 100]);
  const [chartAnimation, setChartAnimation] = useState(false);
  
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
      const examinationStats = Array.from(countByType.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count); // Sort by count descending
      
      // Calculate patient age distribution
      if (patients.length > 0) {
        // Get ages from birth dates
        const ages = patients.map(patient => {
          return getAge(new Date(patient.dateOfBirth));
        });
        
        // Count patients by age
        const ageCount = new Map<number, number>();
        ages.forEach(age => {
          const count = ageCount.get(age) || 0;
          ageCount.set(age, count + 1);
        });
        
        // Fill in missing ages for smoother distribution
        const minAge = Math.min(...ages);
        const maxAge = Math.max(...ages);
        
        const ageDistribution: { age: number; count: number }[] = [];
        for (let age = minAge; age <= maxAge; age++) {
          ageDistribution.push({
            age,
            count: ageCount.get(age) || 0
          });
        }
        
        // Calculate age statistics
        const mean = Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length);
        
        // Median
        const sortedAges = [...ages].sort((a, b) => a - b);
        const middle = Math.floor(sortedAges.length / 2);
        const median = sortedAges.length % 2 === 0
          ? Math.round((sortedAges[middle - 1] + sortedAges[middle]) / 2)
          : sortedAges[middle];
        
        // Mode (most common age)
        let maxCount = 0;
        let mode = 0;
        ageCount.forEach((count, age) => {
          if (count > maxCount) {
            maxCount = count;
            mode = age;
          }
        });
        
        setPatientAgeDistribution(ageDistribution);
        setAgeStats({ 
          mean, 
          median, 
          mode, 
          range: [minAge, maxAge] 
        });
        setSelectedAgeRange([minAge, maxAge]);
        
        // Start animation
        setChartAnimation(true);
      }
      
      // Get recent examinations (last 10)
      const sortedExaminations = [...examinations].sort((a, b) => 
        new Date(b.examinationDateTime).getTime() - new Date(a.examinationDateTime).getTime()
      );
      
      // Get recent prescriptions (last 10)
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
      setRecentExaminations(sortedExaminations.slice(0, 10));
      setRecentPrescriptions(sortedPrescriptions.slice(0, 10));
    }
  }, [patients, doctors, examinations, medicalHistories, prescriptions]);

  // Filter dashboard data based on age range selection
  const handleAgeRangeChange = (_event: Event, newValue: number | number[]) => {
    setSelectedAgeRange(newValue as [number, number]);
  };
  
  // Colors for charts
  const BAR_COLORS = ['#3B82F6', '#4F46E5', '#00C6FF', '#60A5FA', '#8884d8', '#82ca9d'];
  const GENDER_COLORS = ['#00C6FF', '#FF5E93'];
  const AREA_GRADIENT_COLORS = ['#14B8A6', '#0D9488', '#0F766E'];
  
  // Check if all data is loading
  const isLoading = loadingPatients || loadingDoctors || loadingExaminations || 
    loadingMedicalHistories || loadingPrescriptions;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
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
  
  // Memoize filtered examination data based on age range
  const filteredPatients = useMemo(() => {
    if (!patients) return [];
    return patients.filter(patient => {
      const age = getAge(new Date(patient.dateOfBirth));
      return age >= selectedAgeRange[0] && age <= selectedAgeRange[1];
    });
  }, [patients, selectedAgeRange]);
  
  // Reset the age distribution chart animation
  const resetChartAnimation = useCallback(() => {
    setChartAnimation(false);
    setTimeout(() => setChartAnimation(true), 100);
  }, []);

  return (
    <PageContainer title="Dashboard">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <Box mb={3}>
            <Typography variant="h4" gutterBottom sx={{ 
              fontWeight: 'bold',
              background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
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
          <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ mb: 2 }}>
            {/* Statistics Cards */}
            <Grid item xs={6} sm={4} md={2.4} lg={2.4}>
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
            <Grid item xs={6} sm={4} md={2.4} lg={2.4}>
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
            <Grid item xs={6} sm={4} md={2.4} lg={2.4}>
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
            <Grid item xs={6} sm={6} md={2.4} lg={2.4}>
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
            <Grid item xs={6} sm={6} md={2.4} lg={2.4}>
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
          </Grid>
        )}

        {!isLoading && (
          <Box sx={{ pr: { xs: 0, md: 1 } }}>
            <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
              {/* Row 1: Patient Age Distribution (full width) */}
              <Grid item xs={12}>
                <motion.div variants={itemVariants}>
                  <Paper sx={{ 
                    p: { xs: 1.5, sm: 2, md: 2.5 }, 
                    height: '100%', 
                    minHeight: { xs: 400, md: 450 },
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.4)', 
                    borderRadius: 3,
                    bgcolor: 'rgba(17, 24, 39, 0.98)',
                    border: '1px solid rgba(99, 102, 241, 0.1)',
                    overflow: 'hidden',
                    position: 'relative',
                    '&:hover': {
                      boxShadow: '0 15px 30px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
                      transition: 'all 0.3s ease-in-out'
                    }
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      mb: 2
                    }}>
                      <Typography variant="h6" sx={{ 
                        fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                        color: '#E2E8F0',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <TimelineIcon sx={{ color: AREA_GRADIENT_COLORS[0] }} />
                        Patient Age Distribution
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={resetChartAnimation}
                        sx={{ color: AREA_GRADIENT_COLORS[0] }}
                      >
                        <RefreshIcon />
                      </IconButton>
                    </Box>
                    
                    {patientAgeDistribution.length > 0 ? (
                      <>
                        <Box sx={{ width: '100%', height: { xs: 220, sm: 240, md: 280 }, position: 'relative' }}>
                          <AnimatePresence>
                            {chartAnimation && (
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 1.5, ease: "easeInOut" }}
                                style={{ 
                                  position: 'absolute', 
                                  top: 0, 
                                  left: 0, 
                                  height: '100%', 
                                  pointerEvents: 'none',
                                  overflow: 'hidden',
                                  zIndex: 5
                                }}
                              >
                                <ResponsiveContainer width="100%" height="100%">
                                  <AreaChart
                                    data={patientAgeDistribution}
                                    margin={{ top: 15, right: 0, left: 0, bottom: 0 }}
                                  >
                                    <defs>
                                      <linearGradient id="ageGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={AREA_GRADIENT_COLORS[0]} stopOpacity={0.8} />
                                        <stop offset="50%" stopColor={AREA_GRADIENT_COLORS[1]} stopOpacity={0.5} />
                                        <stop offset="100%" stopColor={AREA_GRADIENT_COLORS[2]} stopOpacity={0.2} />
                                      </linearGradient>
                                    </defs>
                                    <XAxis 
                                      dataKey="age" 
                                      tick={{ fontSize: 11, fill: '#E2E8F0' }}
                                      stroke="#718096"
                                      strokeWidth={0.5}
                                    />
                                    <YAxis 
                                      tick={{ fontSize: 11, fill: '#E2E8F0' }}
                                      stroke="#718096"
                                      strokeWidth={0.5}
                                    />
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                                    <Tooltip 
                                      contentStyle={{ 
                                        backgroundColor: '#1F2937', 
                                        border: `1px solid ${AREA_GRADIENT_COLORS[0]}`,
                                        color: '#E2E8F0',
                                        borderRadius: '4px',
                                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
                                      }}
                                      formatter={(value) => [`${value} patients`, 'Count']}
                                      labelFormatter={(value) => `Age: ${value} years`}
                                    />
                                    <ReferenceLine 
                                      x={ageStats.median} 
                                      stroke="#FCD34D"
                                      strokeWidth={2}
                                      strokeDasharray="3 3"
                                      label={{
                                        value: `Median: ${ageStats.median}`,
                                        position: 'insideBottomRight',
                                        fill: '#FCD34D',
                                        fontSize: 10,
                                        fontWeight: 'bold'
                                      }}
                                    />
                                    <ReferenceLine 
                                      x={ageStats.mean} 
                                      stroke="#F472B6"
                                      strokeWidth={2}
                                      strokeDasharray="3 3"
                                      label={{
                                        value: `Mean: ${ageStats.mean}`,
                                        position: 'insideTop',
                                        fill: '#F472B6',
                                        fontSize: 10,
                                        fontWeight: 'bold'
                                      }}
                                    />
                                    <Area 
                                      type="monotone" 
                                      dataKey="count" 
                                      stroke={AREA_GRADIENT_COLORS[0]} 
                                      strokeWidth={3}
                                      fill="url(#ageGradient)"
                                      animationDuration={1500}
                                      activeDot={{ 
                                        r: 6,
                                        stroke: '#FFFFFF',
                                        strokeWidth: 1,
                                        fill: AREA_GRADIENT_COLORS[0]
                                      }}
                                    />
                                  </AreaChart>
                                </ResponsiveContainer>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </Box>
                        
                        <Box sx={{ px: 1, mt: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <Stack 
                            direction="row" 
                            spacing={1} 
                            sx={{ 
                              justifyContent: 'center', 
                              mb: 1.5,
                              flexWrap: 'wrap',
                              gap: 1,
                              '& .MuiChip-root': {
                                fontWeight: 'bold',
                                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                                height: 24
                              }
                            }}
                          >
                            <Chip 
                              label={`Median: ${ageStats.median} years`} 
                              size="small" 
                              sx={{ 
                                bgcolor: 'rgba(252, 211, 77, 0.2)', 
                                color: '#FCD34D',
                                borderRadius: '4px',
                                border: '1px solid rgba(252, 211, 77, 0.3)',
                                fontSize: { xs: '0.7rem', sm: '0.75rem' }
                              }} 
                            />
                            <Chip 
                              label={`Mean: ${ageStats.mean} years`} 
                              size="small" 
                              sx={{ 
                                bgcolor: 'rgba(244, 114, 182, 0.2)', 
                                color: '#F472B6',
                                borderRadius: '4px',
                                border: '1px solid rgba(244, 114, 182, 0.3)',
                                fontSize: { xs: '0.7rem', sm: '0.75rem' }
                              }} 
                            />
                            <Chip 
                              label={`Mode: ${ageStats.mode} years`} 
                              size="small" 
                              sx={{ 
                                bgcolor: 'rgba(20, 184, 166, 0.2)', 
                                color: AREA_GRADIENT_COLORS[0],
                                borderRadius: '4px',
                                border: `1px solid rgba(20, 184, 166, 0.3)`,
                                fontSize: { xs: '0.7rem', sm: '0.75rem' }
                              }} 
                            />
                            <Chip 
                              label={`Selected: ${filteredPatients.length} patients`} 
                              size="small" 
                              sx={{ 
                                bgcolor: 'rgba(96, 165, 250, 0.2)', 
                                color: '#60A5FA',
                                borderRadius: '4px',
                                border: '1px solid rgba(96, 165, 250, 0.3)',
                                fontSize: { xs: '0.7rem', sm: '0.75rem' }
                              }} 
                            />
                          </Stack>
                          
                          <Box sx={{ px: { xs: 1, sm: 2 }, mt: 'auto' }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Typography variant="body2" sx={{ color: '#E2E8F0', minWidth: 24, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                                {selectedAgeRange[0]}
                              </Typography>
                              <Slider
                                value={selectedAgeRange}
                                onChange={handleAgeRangeChange}
                                valueLabelDisplay="auto"
                                min={ageStats.range[0]}
                                max={ageStats.range[1]}
                                sx={{
                                  color: AREA_GRADIENT_COLORS[0],
                                  height: 4,
                                  '& .MuiSlider-thumb': {
                                    borderRadius: '50%',
                                    width: 14,
                                    height: 14,
                                    backgroundColor: '#fff',
                                    border: `2px solid ${AREA_GRADIENT_COLORS[0]}`,
                                    boxShadow: '0 0 0 5px rgba(20, 184, 166, 0.1)',
                                    '&:hover': {
                                      boxShadow: '0 0 0 8px rgba(20, 184, 166, 0.2)',
                                    }
                                  },
                                  '& .MuiSlider-valueLabel': {
                                    backgroundColor: AREA_GRADIENT_COLORS[0],
                                    borderRadius: '4px',
                                    padding: '1px 5px',
                                    fontSize: '0.65rem',
                                    fontWeight: 'bold'
                                  }
                                }}
                                disableSwap
                              />
                              <Typography variant="body2" sx={{ color: '#E2E8F0', minWidth: 24, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                                {selectedAgeRange[1]}
                              </Typography>
                            </Stack>
                          </Box>
                        </Box>
                      </>
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
                        <Typography variant="body1" sx={{ color: '#E2E8F0' }}>
                          No patient age data available
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </motion.div>
              </Grid>
              
              {/* Row 2: Examinations by Type and Patient Gender Distribution */}
              <Grid item xs={12} md={6}>
                <motion.div variants={itemVariants}>
                  <Paper sx={{ 
                    p: { xs: 1.5, sm: 2, md: 2.5 }, 
                    height: '100%',
                    minHeight: { xs: 450, md: 500 },
                    display: 'flex',
                    flexDirection: 'column', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.4)', 
                    borderRadius: 3,
                    bgcolor: 'rgba(17, 24, 39, 0.98)',
                    border: '1px solid rgba(99, 102, 241, 0.1)',
                    overflow: 'hidden',
                    '&:hover': {
                      boxShadow: '0 15px 30px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
                      transition: 'all 0.3s ease-in-out'
                    }
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      mb: 2 
                    }}>
                      <Typography variant="h6" sx={{ 
                        fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                        color: '#E2E8F0',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <MonitorHeartIcon sx={{ color: BAR_COLORS[0] }} />
                        Examinations by Type
                      </Typography>
                      <MuiTooltip title="Shows distribution of examination types across the system">
                        <InfoOutlinedIcon sx={{ color: '#A0AEC0', fontSize: '1.1rem' }} />
                      </MuiTooltip>
                    </Box>
                    {examinationsByType.length > 0 ? (
                      <Box sx={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'auto' }}>
                        <ResponsiveContainer width="100%" height="100%" minWidth={350}>
                          <BarChart
                            data={examinationsByType}
                            margin={{ top: 10, right: 20, left: 0, bottom: 60 }}
                            barGap={4}
                            barCategoryGap="20%"
                            style={{ fontFamily: theme.typography.fontFamily }}
                          >
                            <defs>
                              {BAR_COLORS.map((color, index) => (
                                <linearGradient
                                  key={`gradient-${index}`}
                                  id={`barGradient${index}`}
                                  x1="0"
                                  y1="0"
                                  x2="0"
                                  y2="1"
                                >
                                  <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                                  <stop offset="100%" stopColor={color} stopOpacity={0.6} />
                                </linearGradient>
                              ))}
                              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.3" />
                              </filter>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" vertical={false} />
                            <XAxis 
                              dataKey="name" 
                              tick={{ fontSize: 11, fill: '#E2E8F0' }}
                              angle={-45}
                              textAnchor="end"
                              height={60}
                              stroke="#718096"
                              strokeWidth={0.5}
                              tickMargin={10}
                            />
                            <YAxis 
                              tick={{ fontSize: 11, fill: '#E2E8F0' }}
                              stroke="#718096"
                              strokeWidth={0.5}
                              tickMargin={8}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#1F2937', 
                                border: '1px solid #3B82F6',
                                color: '#E2E8F0',
                                fontWeight: 'bold',
                                borderRadius: '4px',
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
                              }}
                              labelStyle={{ color: '#E2E8F0', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '4px', marginBottom: '4px' }}
                              formatter={(value) => [`${value} examinations`, 'Count']}
                              cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                            />
                            <Legend 
                              wrapperStyle={{ 
                                fontSize: 11, 
                                color: '#E2E8F0',
                                paddingTop: 10,
                                paddingBottom: 5,
                                width: '90%',
                                marginLeft: 'auto',
                                marginRight: 'auto'
                              }}
                              formatter={() => 'Examination Count'}
                              iconType="circle"
                            />
                            <Bar 
                              dataKey="count" 
                              name="Examination Count"
                              radius={[4, 4, 0, 0]}
                              background={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                              animationDuration={1500}
                              animationEasing="ease-out"
                            >
                              {examinationsByType.map((_entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={`url(#barGradient${index % BAR_COLORS.length})`}
                                  filter="url(#shadow)"
                                />
                              ))}
                            </Bar>
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
                    p: { xs: 1.5, sm: 2, md: 2.5 }, 
                    height: '100%',
                    minHeight: { xs: 450, md: 500 },
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.4)', 
                    borderRadius: 3,
                    bgcolor: 'rgba(17, 24, 39, 0.98)',
                    border: '1px solid rgba(99, 102, 241, 0.1)',
                    overflow: 'hidden',
                    '&:hover': {
                      boxShadow: '0 15px 30px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
                      transition: 'all 0.3s ease-in-out'
                    }
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      mb: 1.5
                    }}>
                      <Typography variant="h6" sx={{ 
                        fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                        color: '#E2E8F0',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <PersonIcon sx={{ color: GENDER_COLORS[0] }} />
                        Patient Gender Distribution
                      </Typography>
                    </Box>
                    
                    {patients && patients.length > 0 ? (
                      <Box sx={{ width: '100%', height: 300, display: 'flex', justifyContent: 'center' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <defs>
                              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                                <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#000" floodOpacity="0.5" />
                              </filter>
                            </defs>
                            <Pie
                              data={[
                                { name: 'Male', value: patients.filter(p => p.gender === 'M').length },
                                { name: 'Female', value: patients.filter(p => p.gender === 'F').length }
                              ]}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={90}
                              innerRadius={40}
                              paddingAngle={5}
                              fill="#8884d8"
                              dataKey="value"
                              filter="url(#shadow)"
                              label={({ name, percent, cx, cy, midAngle, innerRadius, outerRadius, index }) => {
                                const RADIAN = Math.PI / 180;
                                const radius = 25 + innerRadius + (outerRadius - innerRadius) * 0.5;
                                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                
                                return (
                                  <g>
                                    <text 
                                      x={x} 
                                      y={y} 
                                      fill={GENDER_COLORS[index % GENDER_COLORS.length]} 
                                      textAnchor={x > cx ? 'start' : 'end'} 
                                      dominantBaseline="central"
                                      fontWeight="bold"
                                      fontSize="14"
                                      filter="url(#shadow)"
                                    >
                                      {`${name}`}
                                    </text>
                                    <text 
                                      x={x} 
                                      y={y + 20} 
                                      fill="#FFFFFF" 
                                      textAnchor={x > cx ? 'start' : 'end'} 
                                      dominantBaseline="central"
                                      fontWeight="bold"
                                      fontSize="14"
                                    >
                                      {`${(percent * 100).toFixed(0)}%`}
                                    </text>
                                  </g>
                                );
                              }}
                            >
                              {[
                                { name: 'Male', value: patients.filter(p => p.gender === 'M').length },
                                { name: 'Female', value: patients.filter(p => p.gender === 'F').length }
                              ].map((_entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={GENDER_COLORS[index % GENDER_COLORS.length]} 
                                  stroke="#1A202C"
                                  strokeWidth={2}
                                />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#1F2937', 
                                border: '1px solid #3B82F6',
                                color: '#E2E8F0',
                                fontWeight: 'bold',
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
                              }}
                              itemStyle={{ color: '#FFFFFF' }}
                              formatter={(value, name, props) => {
                                const index = props.dataKey === 'value' ? props.payload.index : 0;
                                return [
                                  <span style={{ color: GENDER_COLORS[index % GENDER_COLORS.length], fontWeight: 'bold' }}>
                                    {value} patients
                                  </span>,
                                  <span style={{ color: GENDER_COLORS[index % GENDER_COLORS.length], fontWeight: 'bold' }}>
                                    {name}
                                  </span>
                                ];
                              }}
                            />
                            <Legend 
                              layout="horizontal"
                              verticalAlign="bottom"
                              align="center"
                              iconType="circle"
                              iconSize={15}
                              formatter={(value, _entry, index) => (
                                <span style={{ 
                                  color: GENDER_COLORS[index % GENDER_COLORS.length], 
                                  fontWeight: 'bold',
                                  fontSize: '14px',
                                  textShadow: '0px 0px 2px rgba(0, 0, 0, 0.5)'
                                }}>
                                  {value}
                                </span>
                              )}
                              wrapperStyle={{ 
                                paddingTop: 20,
                                bottom: 0
                              }}
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
              
              {/* Row 3: Recent Examinations and Recent Prescriptions */}
              <Grid item xs={12} md={6}>
                <motion.div variants={itemVariants}>
                  <Paper sx={{ 
                    p: { xs: 1.5, sm: 2, md: 2.5 }, 
                    height: '100%',
                    minHeight: { xs: 400, md: 450 },
                    maxHeight: { xs: 500, md: 600 },
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.4)', 
                    borderRadius: 3,
                    bgcolor: 'rgba(17, 24, 39, 0.98)',
                    border: '1px solid rgba(99, 102, 241, 0.1)',
                    overflow: 'hidden',
                    '&:hover': {
                      boxShadow: '0 15px 30px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
                      transition: 'all 0.3s ease-in-out'
                    }
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      mb: 1.5
                    }}>
                      <Typography variant="h6" sx={{ 
                        fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                        color: '#E2E8F0',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <MonitorHeartIcon sx={{ color: '#d32f2f' }} />
                        Recent Examinations
                      </Typography>
                    </Box>
                    
                    <List sx={{ flex: 1, overflow: 'auto', maxHeight: 'calc(100% - 50px)' }}>
                      {recentExaminations.length > 0 ? (
                        recentExaminations.map((exam, index) => (
                          <motion.div
                            key={exam.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <ListItemButton 
                              onClick={() => navigate(`/examinations/${exam.id}`)}
                              divider={index < recentExaminations.length - 1}
                              sx={{
                                borderRadius: 1,
                                my: 0.5,
                                py: 1,
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
                  </Paper>
                </motion.div>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <motion.div variants={itemVariants}>
                  <Paper sx={{ 
                    p: { xs: 1.5, sm: 2, md: 2.5 }, 
                    height: '100%',
                    minHeight: { xs: 400, md: 450 },
                    maxHeight: { xs: 500, md: 600 },
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.4)', 
                    borderRadius: 3,
                    bgcolor: 'rgba(17, 24, 39, 0.98)',
                    border: '1px solid rgba(99, 102, 241, 0.1)',
                    overflow: 'hidden',
                    '&:hover': {
                      boxShadow: '0 15px 30px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
                      transition: 'all 0.3s ease-in-out'
                    }
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      mb: 1.5
                    }}>
                      <Typography variant="h6" sx={{ 
                        fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                        color: '#E2E8F0',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <MedicationIcon sx={{ color: '#9c27b0' }} />
                        Recent Prescriptions
                      </Typography>
                    </Box>
                    
                    <List sx={{ flex: 1, overflow: 'auto', maxHeight: 'calc(100% - 50px)' }}>
                      {recentPrescriptions.length > 0 ? (
                        recentPrescriptions.map((prescription, index) => (
                          <motion.div
                            key={prescription.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <ListItemButton 
                              onClick={() => navigate(`/prescriptions/${prescription.id}`)}
                              divider={index < recentPrescriptions.length - 1}
                              sx={{
                                borderRadius: 1,
                                my: 0.5,
                                py: 1,
                                transition: 'all 0.2s',
                                '&:hover': {
                                  backgroundColor: `${theme.palette.secondary.main}30`,
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
                  </Paper>
                </motion.div>
              </Grid>
            </Grid>
          </Box>
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
        borderRadius: 3, 
        height: '100%',
        transition: 'all 0.3s',
        bgcolor: 'rgba(17, 24, 39, 0.98)',
        border: '1px solid rgba(99, 102, 241, 0.05)',
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
              fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1.1rem' },
              color: '#E2E8F0'
            }}
          >
            {title}
          </Typography>
          {icon && (
            <Box sx={{ 
              color: 'white', 
              bgcolor: color, 
              p: { xs: 0.5, sm: 0.75 }, 
              borderRadius: '50%',
              display: 'flex',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)'
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
            mt: 1,
            fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
          }}
        >
          {new Intl.NumberFormat().format(value)}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default Dashboard;