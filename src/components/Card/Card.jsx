import React, { useState, useEffect } from "react";
import "./Card.css";
import { motion, AnimateSharedLayout } from "framer-motion";
import { UilTimes } from "@iconscout/react-unicons";
import Chart from "react-apexcharts";

const Card = (props) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <AnimateSharedLayout>
      {expanded ? (
        <><div className="backdrop" onClick={() => setExpanded(false)}></div>
        <ExpandedCard param={props} setExpanded={() => setExpanded(false)} />
        </>
      ) : (
        <CompactCard param={props} setExpanded={() => setExpanded(true)} />
      )}
    </AnimateSharedLayout>
  );
};

function CompactCard({ param, setExpanded }) {
  const Png = param.png;
  
  const formatValue = (title, value) => {
    if (title === "Compensation Cost") {
      value = parseFloat(value).toFixed(2) / 1000;
      return `$${Number(value).toLocaleString()}B`;
    }
    return Number(value).toLocaleString();
  };

  return (
    <motion.div
      className="CompactCard"
      style={{
        background: param.color.backGround,
        boxShadow: param.color.boxShadow,
      }}
      layoutId="expandableCard"
      onClick={setExpanded}
    >
      <div className="radialBar">
        <Png className="iconStyle" />
        <span>{param.title}</span>
      </div>
      <div className="detail">
        <span className="valueText">{formatValue(param.title, param.value)}</span>
        <span className="yearText">in {new Date().getFullYear()}</span>
      </div>
    </motion.div>
  );
}

function ExpandedCard({ param, setExpanded }) {
  const data = {
    options: {
      chart: {
        type: "area",
        height: "auto",
      },
      dropShadow: {
        enabled: false,
        enabledOnSeries: undefined,
        top: 0,
        left: 0,
        blur: 3,
        color: "#000",
        opacity: 0.35,
      },
      fill: {
        colors: ["#fff"],
        type: "gradient",
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
        colors: ["white"],
      },
      tooltip: {
        x: {
          format: "MMM",
        },
      },
      grid: {
        show: true,
      },
      xaxis: {
        type: "category",
        labels: {
          style: {
            fontSize: "16px",
            fontWeight: "bold"
          }
        },
        title: {
          text: "Months",
          style: {
            fontSize: "18px",
            fontWeight: "bold"
          }
        },
        categories: [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ],
      },
      yaxis : {
        labels: {
          style: {
            fontSize: "14px",
            fontWeight: "bold"
          }
        },
        maxWidth: "25px",
      } 
    },
  };

  return (
    <motion.div
      className="ExpandedCard"
      style={{
        background: param.color.backGround,
        boxShadow: param.color.boxShadow,
      }}
      layoutId="expandableCard"
    >
      <div style={{ alignSelf: "flex-end", cursor: "pointer", color: "white" }}>
        <UilTimes onClick={setExpanded} />
      </div>
      <span>{param.title}</span>
      <div className="chartContainer">
        <Chart options={data.options} series={param.series} type="area" />
      </div>
      {/* <span>in {new Date().getFullYear()}</span> */}
    </motion.div>
  );
}

export default Card;
