import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

// Lazy load components for better performance
const Dashboard = lazy(() => import('../pages/Dashboard/Dashboard'));
const Patients = lazy(() => import('../pages/Patients/Patients'));
const PatientDetails = lazy(() => import('../pages/PatientDetails/PatientDetails'));
const Doctors = lazy(() => import('../pages/Doctors/Doctors'));
const DoctorDetails = lazy(() => import('../pages/DoctorDetails/DoctorDetails'));
const Examinations = lazy(() => import('../pages/Examinations/Examinations'));
const ExaminationDetails = lazy(() => import('../pages/ExaminationDetails/ExaminationDetails'));
const MedicalHistories = lazy(() => import('../pages/MedicalHistories/MedicalHistories'));
const MedicalHistoryDetails = lazy(() => import('../pages/MedicalHistoryDetails/MedicalHistoryDetails'));
const Prescriptions = lazy(() => import('../pages/Prescriptions/Prescriptions'));
const PrescriptionDetails = lazy(() => import('../pages/PrescriptionDetails/PrescriptionDetails'));
const Login = lazy(() => import('../pages/Login/Login'));
const NotFound = lazy(() => import('../pages/NotFound/NotFound'));

/**
 * Route configuration for the application
 * Defines all available routes and their corresponding components
 */
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Dashboard />,
  },
  {
    path: '/patients',
    element: <Patients />,
  },
  {
    path: '/patients/:id',
    element: <PatientDetails />,
  },
  {
    path: '/doctors',
    element: <Doctors />,
  },
  {
    path: '/doctors/:id',
    element: <DoctorDetails />,
  },
  {
    path: '/examinations',
    element: <Examinations />,
  },
  {
    path: '/examinations/:id',
    element: <ExaminationDetails />,
  },
  {
    path: '/medical-histories',
    element: <MedicalHistories />,
  },
  {
    path: '/medical-histories/:id',
    element: <MedicalHistoryDetails />,
  },
  {
    path: '/prescriptions',
    element: <Prescriptions />,
  },
  {
    path: '/prescriptions/:id',
    element: <PrescriptionDetails />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]; 