import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import * as d3 from "d3";
import "./Map.css";


mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_GL_ACCESS_TOKEN;

export default function TrafficMap() {
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [accidentData, setAccidentData] = useState([]);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5432';
  
  // Fetch accident data from the backend API
  // useEffect(() => {
  //   const fetchAccidentData = async () => {
  //     try {
  //       const response = await fetch(`${BACKEND_URL}/api/traffic_accidents`);
  //       // console.log("Response from API:", response);
  //       const data = await response.json();
  //       setAccidentData(data);
  //     } catch (error) {
  //       console.error("Error fetching accident data:", error);
  //     }
  //   };

  //   fetchAccidentData();

  //   // Auto-refresh API every 10 minutes
  //   const intervalId = setInterval(() => {
  //     console.log("Fetching new accident data...");
  //     fetchAccidentData();
  //   }, 600000);

  //   return () => clearInterval(intervalId);
  // }, []);

  useEffect(() => {
    const fetchAccidentData = async () => {
      const url = `https://data.austintexas.gov/resource/dx9v-zd7x.json?$where=traffic_report_status_date_time>'${new Date(
        Date.now() - 24 * 60 * 60 * 1000
      ).toISOString()}'`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        setAccidentData(data);
      } catch (error) {
        console.error("Error fetching accident data:", error);
      }
    };

    fetchAccidentData(); // Initial fetch

    // Auto-refresh API every 10 minutes
    const intervalId = setInterval(() => {
      console.log("Fetching new accident data...");
      fetchAccidentData();
    }, 600000); // 600,000ms = 10 minutes

    return () => clearInterval(intervalId);
  }, []);

  // Initialize the map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const newMap = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [-97.73, 30.28],
      zoom: 13,
    });

    newMap.addControl(new mapboxgl.NavigationControl());
    newMap.on("load", () => setMap(newMap));

    return () => newMap.remove();
  }, []);

  // Use D3.js to overlay accident data on the map
  useEffect(() => {
    if (map && accidentData.length > 0) {
      const updateOverlay = () => {
        const container = map.getContainer();
        d3.select(container).select("svg").remove();

        const svg = d3.select(container)
          .append("svg")
          .attr("class", "d3-overlay")
          .style("position", "absolute")
          .style("top", "0")
          .style("left", "0")
          .style("width", "100%")
          .style("height", "100%")
          .style("pointer-events", "none");

        const circles = svg.selectAll("circle")
          .data(accidentData)
          .enter()
          .append("circle")
          .attr("pointer-events", "all") 
          .attr("r", 5)
          .attr("fill", "red")
          .attr("stroke", "white")
          .attr("stroke-width", 1)
          .on("mouseover", (event, d) => {
            const tooltip = d3.select("#tooltip");
            const date = new Date(d.published_date).toLocaleString("en-US", {
              dateStyle: "medium",
              timeStyle: "short"
            });
            tooltip
              .style("display", "block")
              .html(`
                <strong>Issue:</strong> ${d.issue_reported || "N/A"}<br/>
                <strong>Address:</strong> ${d.address || "Unknown"}<br/>
                <strong>Date & Time:</strong> ${date || "N/A"}
              `);
          })
          .on("mousemove", (event) => {
            const offsetY = event.clientY < window.innerHeight / 2 ? -250 : -350;
            const tooltip = d3.select("#tooltip");

            tooltip
              .style("left", event.pageX - 200 + "px")
              .style("top", event.pageY + offsetY + "px");
                })
                .on("mouseout", () => {
                  d3.select("#tooltip").style("display", "none");
                });
          

        const updatePositions = () => {
          circles.attr("cx", d => {
            if (!d.longitude || !d.latitude) return null;
            const pos = map.project([parseFloat(d.longitude), parseFloat(d.latitude)]);
            return pos.x;
          })
          .attr("cy", d => {
            if (!d.longitude || !d.latitude) return null;
            const pos = map.project([parseFloat(d.longitude), parseFloat(d.latitude)]);
            return pos.y;
          });
        };

        updatePositions();
        map.on("move", updatePositions);
      };

      updateOverlay();
    }
  }, [map, accidentData]);

  return (
    <div className="map-container">
      <div ref={mapContainerRef} className="mapboxgl-map"></div>
      <div id="tooltip"></div>
    </div>
  );
}

