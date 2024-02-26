// StaffDashboard.js

import { useEffect, useState } from 'react';

function StaffDashboard() {
  const [staffEmail, setStaffEmail] = useState('');

  useEffect(() => {
    // Fetch staff email from session storage
    const userEmail = sessionStorage.getItem('userEmail');
    setStaffEmail(userEmail);
  }, []);

  return (
    <div>
      <h1>Welcome to Staff Dashboard</h1>
      <p>Email: {staffEmail}</p>
    </div>
  );
}

export default StaffDashboard;
    