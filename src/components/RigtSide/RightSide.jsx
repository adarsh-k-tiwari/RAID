import React from "react";
import TopLocations from "../TopLocations/TopLocations";
import Updates from "../Updates/Updates";
import "./RightSide.css";

const RightSide = () => {
  return (
    <div className="RightSide">
      <div className="Updates">
        <Updates />
      </div>
      <div className="TopLocations">
        <TopLocations />
      </div>
    </div>
  );
};

export default RightSide;
