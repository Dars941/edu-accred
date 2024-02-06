import { useState, useEffect } from 'react';
import { AiOutlineArrowLeft } from 'react-icons/ai';
import { TiGroupOutline } from 'react-icons/ti';
import { FcDepartment } from 'react-icons/fc';
import { IoIosLogOut } from 'react-icons/io';
import { Link, useNavigate } from 'react-router-dom';

const SideBar = () => {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  const Menus = [
    { title: 'staffadvisor', icon: <TiGroupOutline key='Staff' /> },
    { title: 'nbaReport', icon: <FcDepartment key='Department' /> },
    { title: 'logout', icon: <IoIosLogOut key='logout' /> },
  ];

  const toggleOpen = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  useEffect(() => {
    if (!open) {
      // Delayed execution to ensure state change takes effect
      const timeoutId = setTimeout(() => {
        toggleOpen();
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  }, [open]);

  let containerClass =
    'bg-white p-5 pt-8 fixed top-0 left-0 overflow-y-auto';
  if (open) {
    containerClass += ' w-[17rem] max-h-screen';
  } else {
    containerClass += ' w-20';
  }
  containerClass += ' relative duration-300';

  const handleMenuItemClick = (path) => {
    navigate(`/staffdashboard/${path}`);
    toggleOpen(); // Close the sidebar after navigation
  };

  return (
    <div className='md:flex'>
      <div className={containerClass}>
        <AiOutlineArrowLeft
          onClick={toggleOpen}
          className={`sm :  bg-white text-dark-purple text-3xl rounded-full absolute md : hidden -right-3 top-9 border border-dark-purple cursor-pointer ${!open && 'rotate-180'}`}
        ></AiOutlineArrowLeft>
        <div></div>
        <ul className='pb-3 pt-3 '>
          {Menus.map((menuitem) => (
            <li
              key={menuitem.title}
              className='text-light-grey  flex pl-[30px] items-center text-sm gap-x-4 cursor-pointer p-2 hover:bg-text-hover-bg mt-2 rounded-lg hover:text-text-hover-color'
              onClick={() => handleMenuItemClick(menuitem.title.toLowerCase())}
            >
              <Link
                to={`/${menuitem.title.toLowerCase()}`}
                className='text-l block float-left text-4xl'
              >
                {menuitem.icon}
              </Link>
              <span className={`${!open && 'hidden '}`}>
                {menuitem.title}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SideBar;
