import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import Login from '../pages/Login/Login';
import Dashboard from '../pages/Dashboard/Dashboard';
import Patients from '../pages/Patients/Patients';
import PatientDetails from '../pages/PatientDetails/PatientDetails';
import Doctors from '../pages/Doctors/Doctors';
import DoctorDetails from '../pages/DoctorDetails/DoctorDetails';
import Examinations from '../pages/Examinations/Examinations';
import ExaminationDetails from '../pages/ExaminationDetails/ExaminationDetails';
import MedicalHistories from '../pages/MedicalHistories/MedicalHistories';
import MedicalHistoryDetails from '../pages/MedicalHistoryDetails/MedicalHistoryDetails';
import Prescriptions from '../pages/Prescriptions/Prescriptions';
import PrescriptionDetails from '../pages/PrescriptionDetails/PrescriptionDetails';
import NotFound from '../pages/NotFound/NotFound';

/**
 * AppRoutes component
 * Defines all the routes for the application
 */
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      
      {/* Private routes */}
      <Route path="/" element={
        <PrivateRoute>
          <Outlet />
        </PrivateRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Patient routes */}
        <Route path="patients" element={<Patients />} />
        <Route path="patients/new" element={<PatientDetails />} />
        <Route path="patients/:id" element={<PatientDetails />} />
        
        {/* Doctor routes */}
        <Route path="doctors" element={<Doctors />} />
        <Route path="doctors/new" element={<DoctorDetails />} />
        <Route path="doctors/:id" element={<DoctorDetails />} />
        
        {/* Examination routes */}
        <Route path="examinations" element={<Examinations />} />
        <Route path="examinations/new" element={<ExaminationDetails />} />
        <Route path="examinations/:id" element={<ExaminationDetails />} />
        
        {/* Medical History routes */}
        <Route path="medical-histories" element={<MedicalHistories />} />
        <Route path="medical-histories/new" element={<MedicalHistoryDetails />} />
        <Route path="medical-histories/:id" element={<MedicalHistoryDetails />} />
        
        {/* Prescription routes */}
        <Route path="prescriptions" element={<Prescriptions />} />
        <Route path="prescriptions/new" element={<PrescriptionDetails />} />
        <Route path="prescriptions/:id" element={<PrescriptionDetails />} />
        
        {/* Catch all */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes; 