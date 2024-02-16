import { useState } from 'react';
import { AiOutlineArrowLeft } from 'react-icons/ai';
import { RiDashboardFill } from 'react-icons/ri';
import { TiGroupOutline } from "react-icons/ti";
import { FcDepartment } from "react-icons/fc";
// import { FaPersonChalkboard } from "react-icons/fa6";
import { PiStudent } from "react-icons/pi";
import { IoIosLogOut } from "react-icons/io";
import { useNavigate } from 'react-router-dom';

const SideBar = () => {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  const Menus = [
    // { title: 'staff' },
    // { title: 'department' },
    // // { title: 'Staff advisor' },
    // { title: 'student' },
    { title: 'student list' },
    { title: 'batch list' },
    { title: 'department list' }, 
    { title: 'staf list' }, 
    { title: 'logout' },
  ];

  const Icons = [
    <PiStudent key="student" />,

    <TiGroupOutline key='Staff'/>,
    <FcDepartment key='Department'/>,
    // <FaPersonChalkboard key="Staff Advisor" />,
    
    <IoIosLogOut key="logout" />,
    <RiDashboardFill key="dashboard" />,
    <RiDashboardFill key="dashboard" />,
    <RiDashboardFill key="dashboard" />,
    <RiDashboardFill key="dashboard" />,
    <RiDashboardFill key="dashboard" />,
  ];

  let containerClass = 'bg-white p-5 pt-8 fixed top-0 left-0 overflow-y-auto';
  if (open) {
    containerClass += ' w-[17rem] max-h-screen';
  } else {
    containerClass += ' w-20';
  }
  containerClass += ' relative duration-300';

  const handleMenuItemClick = (path) => {
    navigate(`/admindashboard/${path}`);
  };

  return (
    <div className=" md:flex">
      <div className={containerClass}>
        <AiOutlineArrowLeft
          onClick={() => {
            setOpen(!open);
          }}
          className={`sm :  bg-white text-dark-purple text-3xl rounded-full absolute md : hidden -right-3 top-9 border border-dark-purple cursor-pointer ${!open && 'rotate-180'}`}
        ></AiOutlineArrowLeft>
        <div></div>
        <ul className="pb-3 pt-3 ">
          {Menus.map((menuitem, index) => (
            <li
              key={index}
              className="text-light-grey  flex pl-[30px] items-center text-sm gap-x-4 cursor-pointer p-2 hover:bg-text-hover-bg mt-2 rounded-lg hover:text-text-hover-color"
              onClick={() => handleMenuItemClick(menuitem.title.toLowerCase())}
            >
              <span className="text-l block float-left text-4xl">{Icons[index]}</span>
              <span className={`${!open && 'hidden '}`}>{menuitem.title}</span>
            </li>
          ))}
          <li className=''></li>
        </ul>
      </div>
    </div>
  );
};

export default SideBar;
