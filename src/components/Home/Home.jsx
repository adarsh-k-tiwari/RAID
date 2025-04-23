import React from "react";
import "./Home.css";

const Home = () => {
  return (
    <div className="Home">
      <h1>Roadway Analytics & Incident Dashboard</h1>
      <strong>Welcome to RAID - Roadway Analytics & Incident Dashboard, your go-to web app for real-time traffic incident updates in Austin, TX. With dynamic visualizations powered by D3.js and a responsive design built with React.js, RAID provides you with up-to-the-minute data on roadway incidents, helping you stay informed and navigate the city more efficiently. Whether you're a commuter, traveler, or city planner, RAID offers an intuitive interface to track traffic events and enhance your planning and decision-making.</strong>
      <p><strong>Our mission is to provide a comprehensive platform for analyzing traffic incidents, understanding their impact on urban mobility, and ultimately contributing to safer and more efficient roadways.</strong></p>
      <p><strong>Traffic accidents are a critical issue in urban environments, often leading to congestion, injuries, and fatalities. With increasing advancements in real-time data collection, the ability to visualize and analyze accident patterns can significantly enhance traffic management strategies and commuter safety.</strong></p>

      <strong>Reasons for Choosing This Domain:</strong>
        <ol>
            <li>Traffic congestion and road safety are growing concerns worldwide. Austin's rapid growth due to the influx of tech companies has led to increased traffic and potentially more accidents. This project aims to visualize and analyze traffic accident data to identify patterns, high-risk areas, and potential contributing factors. The insights gained could inform authorities, planners, and commuters to make informed decisions.</li>
            <li>Real-time data analysis has become a crucial component of modern transportation systems, allowing for proactive safety measures.</li>

        </ol>
    </div>
  );
};

export default Home;
