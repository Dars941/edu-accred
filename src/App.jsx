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

const App = () => {
  const currentUser = true;

  const ProtectedRoute = ({ children }) => {
    return currentUser ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
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
        </Route>

        <Route path="studentdashboard" element={<StudentDashboard />}>
          <Route index element={<Navigate to="subject" />} />
          <Route path="subject" element={<Subject />} />
          <Route path="studentdel" element={<Studentdel />} />
        </Route>

        <Route path="staffdashboard" element={<StaffDashBoard />}>
          <Route index element={<Navigate to="staffadvisor" />} />
          <Route path="staffadvisor" element={<StaffAdvisor />} />
          <Route path="nbareport" element={<NbaReport />} />
        </Route>

        <Route path="logout" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default App;
