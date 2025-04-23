import React from "react";
import TopLocations from "../TopLocations/TopLocations";
import Updates from "../Updates/Updates";
import "./RightSide.css";

const RightSide = () => {
  return (
    <div className="RightSide">
      <div>
        <Updates />
      </div>
      <div>
        <TopLocations />
      </div>
    </div>
  );
};

export default RightSide;
