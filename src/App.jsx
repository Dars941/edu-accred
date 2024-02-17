import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Link, Navigate } from 'react-router-dom';

import AdminDashboard from './Pages/AdminDashBoard';
import Login from './Pages/Login';
import Staff from './Components/AdminDashBoardItem/Staff';
import Department from './Components/AdminDashBoardItem/Department';
import Student from './Components/AdminDashBoardItem/Student';
import StudentDashboard from './Pages/StudentDashBoard';
import Subject from './Components/StudentDashBoardItem/Subject';
import Studentdel from './Components/StudentDashBoardItem/Student';
import StaffDashBoard from './Pages/StaffDashBoard';
import StaffAdvisor from './Components/StaffDashBoardItem/StaffAdvisor';
import NbaReport from './Components/StaffDashBoardItem/nbareport'; 
import Syllabus from './Components/StaffDashBoardItem/syllabus';
import Scheme from './Components/StaffDashBoardItem/Branch/Scheme';
import Studentlist from './Components/AdminDashBoardItem/Studentlist';
import Batchlist from './Components/AdminDashBoardItem/Batchlist'
import Departmentlist from './Components/AdminDashBoardItem/Departmentlist';
import Stafflist from './Components/AdminDashBoardItem/Stafflist'
import COmapping from './Components/StaffDashBoardItem/COmapping'; 
import AcedemicCalender from './Components/StaffDashBoardItem/acedemicCalender';
const App = () => {
  const currentUser = true;

  const ProtectedRoute = ({ children }) => {
    return currentUser ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} /> 
       
   
        <Route path="/admindashboard/logout" element={<Navigate to="/" />} />
        <Route path="/studentdashboard/logout" element={<Navigate to="/" />} />
        <Route path="/staffdashboard/logout" element={<Navigate to="/" />} />

        <Route
          path="/admindashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<Staff />} />
          <Route path="staff" element={<Staff />} />
          <Route path="department" element={<Department />} />
          <Route path="student" element={<Student />} />
          <Route path="student list" element={<Studentlist />} />
          <Route path="batch list" element={<Batchlist />} />
          <Route path="department list" element={<Departmentlist />} />
          <Route path="staff list" element={<Stafflist />} />
        </Route>

        <Route path="studentdashboard" element={<StudentDashboard />}>
          <Route index element={<Navigate to="subject" />} />
          <Route path="subject" element={<Subject />} />
          <Route path="studentdel" element={<Studentdel />} />
        </Route>

        <Route path="staffdashboard" element={<StaffDashBoard />}>
          <Route index element={<Navigate to="Mission Vision" />} />
          <Route path="Mission Vision" element={<StaffAdvisor />} /> 
          <Route path="syllabus" element={<Syllabus />} />

          <Route path="nbareport" element={<NbaReport />} />
          <Route path="Branch/Scheme" element={<Scheme />} /> 
          <Route path="studentlist" element={<Studentlist />} />
          <Route path="CO mapping" element={<COmapping />} />
          <Route path="acedemic calender" element={<AcedemicCalender />} />
        </Route>

        <Route path="logout" element={<Login />} />
        
      </Routes>
    </Router>
  );
};

export default App;
