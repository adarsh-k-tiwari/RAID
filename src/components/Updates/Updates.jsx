import React, { useEffect, useState } from "react";
import "./Updates.css";
import logo from "../../imgs/austin.png"; 
import travis from "../../imgs/travis-1.png";
import { text } from "d3";

const Updates = () => {
  const [updatesData, setUpdatesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to calculate "time ago"
  const calculateTimeAgo = (dateString) => {
    const publishedDate = new Date(dateString);
    const now = new Date();
    const diffInMs = now - publishedDate;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    if (diffInMinutes < 1) return "just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  // Fetch data from the backend API
  useEffect(() => {
    const fetchUpdatesData = async () => {
      const url = `https://data.austintexas.gov/resource/dx9v-zd7x.json?$order=published_date DESC&$limit=8`;
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch updates data");
        }
        const data = await response.json();
        
        const formattedData = data.map((item) => ({
          img: item.agency?.toLowerCase().includes('austin') ? logo : travis,
          agency: item.agency || "Unknown Agency",
          description: `${item.issue_reported || "Incident"} at ${item.address || "Unknown Location"}`,
          time: calculateTimeAgo(item.published_date),
        }));
        setUpdatesData(formattedData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching updates data:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchUpdatesData();

    const intervalId = setInterval(() => {
      fetchUpdatesData();
    }, 60000); // Fetch new data every 60 seconds
    return () => clearInterval(intervalId); // Cleanup interval on component unmount

  }, []);

  if (loading) return <div className="Updates">Loading...</div>;
  if (error) return <div className="Updates">Error: {error}</div>;

  return (
    <div className="Updates">
      <h2>Live Incident Updates</h2>
      {updatesData.map((update, index) => (
        <div className="update" key={index}>
          <img src={update.img} alt="profile" />
          <div className="noti">
            <div style={{ marginBottom: "0.5rem" }}>
              <span>{update.agency}</span>
              <span> {update.description}</span>
            </div>
            <span>{update.time}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Updates;
