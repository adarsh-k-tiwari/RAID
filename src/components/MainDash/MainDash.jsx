import React from "react";
import Cards from "../Cards/Cards";
import Map from "../Map/Map";

import "./MainDash.css";

// MainDash component that serves as the main dashboard for the application
const MainDash = () => {
  return (
    <div className="MainDash">
      <h1>Roadway Analytics & Incident Dashboard</h1>
      <Cards />
      <Map />
    </div>
  );
};

export default MainDash;
