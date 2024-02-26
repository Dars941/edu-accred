import React from 'react';
import StaffNavBar from '../Components/NavBar/StaffNavBar';
import SideBar from '../Components/SideBar/StaffSideBar';
import { Outlet, useLocation } from 'react-router-dom';

const StaffDashBoard = () => {
  const location = useLocation();
  const email = location.state ? location.state.email : null;

  return (
    <>
      <StaffNavBar />
      <div className='flex'>
        <SideBar email={email} /> {/* Pass email prop to the SideBar component */}
        <Outlet />
      </div>
    </>
  );
}

export default StaffDashBoard;
