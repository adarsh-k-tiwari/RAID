import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";
import Logo from "../imgs/logo.png";
import { SidebarData } from "../Data/Data";
import { UilBars } from "@iconscout/react-unicons";
import { motion } from "framer-motion";

const Sidebar = () => {
  const location = useLocation();
  const [selected, setSelected] = useState(0);
  const [expanded, setExpaned] = useState(true)

  useEffect(() => {
    const currentIndex = SidebarData.findIndex(item => item.path === location.pathname);
    if (currentIndex !== -1) {
      setSelected(currentIndex);
    }
  }, [location.pathname]);

  const sidebarVariants = {
    true: {
      left : '0'
    },
    false:{
      left : '-60%'
    }
  }

  return (
    <>
      <div className="bars" style={expanded?{left: '60%'}:{left: '5%'}} onClick={()=>setExpaned(!expanded)}>
        <UilBars />
      </div>
    <motion.div className='sidebar'
    variants={sidebarVariants}
    animate={window.innerWidth<=768?`${expanded}`:''}
    >
      {/* RAID logo */}
      <div className="logo">
        <img src={Logo} alt="logo" />
        <span>
          R A <span>I D</span>
        </span>
      </div>

      {/* Showing content for active menu */}
      <div className="menu">
        {SidebarData.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <Link to={item.path} key={index} className="menuItem">
              <div
                className={selected === index ? "menuItem active" : "menuItem"}
                key={index}
                onClick={() => setSelected(index)}
              >
                <item.icon />
                <span>{item.heading}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </motion.div>
    </>
  );
};

export default Sidebar;
