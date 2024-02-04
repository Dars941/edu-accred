/* eslint-disable react/prop-types */
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './Pages/AdminDashBoard';
import Login from './Pages/Login';
import Staff from './Components/AdminDashBoardItem/Staff';
import Department from './Components/AdminDashBoardItem/Department';
import Student from './Components/AdminDashBoardItem/Student';
import StudentDashboard from './Pages/StudentDashBoard';
import Subject from './Components/StudentDashBoardItem/Subject'; // Uncomment this line
import Studentdel from './Components/StudentDashBoardItem/Student'; // Uncomment this line
import StaffDashBoard from './Pages/StaffDashBoard';
import StaffAdvisor from './Components/StaffDashBoardItem/StaffAdvisor';
import NbaReport from './Components/StaffDashBoardItem/nbareport'
const App = () => {
  const currentUser = true;

  const ProtectedRoute = ({ element }) => {
    return currentUser ? element : <Navigate to="/login" />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={<ProtectedRoute element={<AdminDashboard />} />}
        >
          <Route index element={<Staff />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/department" element={<Department />} />
          <Route path="/student" element={<Student />} />
        </Route>

        <Route path="/studentdashboard" element={<StudentDashboard />}>
          {/* Use relative paths */}
          <Route index element={<Navigate to="./subject" />} />
          <Route path="subject" element={<Subject />} />
          <Route path="studentdel" element={<Studentdel />} />
        </Route>

        <Route path="/staffdashboard" element={<StaffDashBoard />}>
          {/* Use relative paths */}
          <Route index element={<Navigate to="./staffadvisor" />} />
          <Route path="staffadvisor" element={<StaffAdvisor />} />
          <Route path="nbareport" element={<NbaReport />} />
        </Route>

        <Route path="/logout" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default App;
