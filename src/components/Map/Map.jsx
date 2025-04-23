import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import * as d3 from "d3";
import "./Map.css";

import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';

import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';


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
    }, 300000); // 300,000ms = 5 minutes

    return () => clearInterval(intervalId);
  }, []);

  // Initialize the map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const newMap = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/navigation-day-v1", // https://docs.mapbox.com/api/maps/styles/
      center: [-97.73, 30.28],
      zoom: 13,
    });

    newMap.addControl(
        new MapboxGeocoder({
            accessToken: mapboxgl.accessToken,
            mapboxgl: mapboxgl
        })
    );
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
          .attr("fill", d => d.traffic_report_status === 'ACTIVE' ? 'red' : 'green') // Updated fill color based on status
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
          <strong>Date & Time:</strong> ${date || "N/A"}<br/>
          <strong>Status:</strong> ${d.traffic_report_status === 'ACTIVE' ? 'Active' : 'Resolved'}<br/>
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
        
          // // Create overlay container
            // Calculate statistics
            const totalAccidents = accidentData.length;
            const activeAccidents = accidentData.filter(f => f.traffic_report_status === 'ACTIVE').length;
            const archivedAccidents = accidentData.filter(f => f.traffic_report_status === 'ARCHIVED').length;

            // Remove existing stats overlay if it exists
            d3.select(container).select("#stats-overlay-svg").remove();

            // Create SVG overlay for stats
            const statsSvg = d3.select(container)
            .append("svg")
            .attr("id", "stats-overlay-svg")
            .attr("class", "stats-overlay") // Use the existing CSS class for styling
            .style("position", "absolute")
            .style("top", "10px")
            .style("left", "10px")
            .style("pointer-events", "none") // Allow map interaction underneath
            .attr("width", 200) // Adjust width as needed
            .attr("height", 110); // Adjust height as needed

            // Add a background rectangle (optional, styling can be done via CSS)
            statsSvg.append("rect")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("fill", "rgba(255, 255, 255, 0.8)") // Semi-transparent white background
            .attr("rx", 5) // Rounded corners
            .attr("ry", 5);

            // Add text elements
            const textPadding = 15;
            const lineHeight = 20;

            statsSvg.append("text")
            .attr("x", textPadding)
            .attr("y", textPadding + 5) // Adjust vertical position
            .attr("font-weight", "bold")
            .text("Last 24 Hours");

            statsSvg.append("line") // Separator line
            .attr("x1", textPadding - 5)
            .attr("y1", textPadding + lineHeight * 0.8)
            .attr("x2", 200 - textPadding + 5)
            .attr("y2", textPadding + lineHeight * 0.8)
            .attr("stroke", "#ccc")
            .attr("stroke-width", 1);

            statsSvg.append("text")
            .attr("x", textPadding)
            .attr("y", textPadding + lineHeight * 1.8)
            .html(`Total Accidents: <tspan font-weight="bold">${totalAccidents}</tspan>`);

            statsSvg.append("text")
            .attr("x", textPadding)
            .attr("y", textPadding + lineHeight * 2.8)
            .html(`Active (Red): <tspan font-weight="bold">${activeAccidents}</tspan>`);

            statsSvg.append("text")
            .attr("x", textPadding)
            .attr("y", textPadding + lineHeight * 3.8)
            .html(`Resolved (Green): <tspan font-weight="bold">${archivedAccidents}</tspan>`);
          

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
