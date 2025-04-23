// Cards.jsx
import React, { useState, useEffect } from "react";
import "./Cards.css";
import Card from "../Card/Card";
import { UilHeartbeat , UilHospital, UilCar, UilDollarAlt } from "@iconscout/react-unicons";

// Cards component that fetches and displays card data
// It uses the Card component to display individual cards with data
const Cards = () => {
  const [cardsData, setCardsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch card data from the server when the component mounts
  useEffect(() => {
    const fetchCardData = async () => {
      try {
        const response = await fetch('/api/cards-data');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setCardsData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching card data:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchCardData();
  }, []);

  if (loading) return <div className="Cards">Loading...</div>;
  if (error) return <div className="Cards">Error: {error}</div>;

  return (
    <div className="Cards">
      {cardsData.map((card, id) => {
        return (
          <div className="parentContainer" key={id}>
            <Card
              title={card.title}
              color={getCardColor(card.title)}
              value={card.value}
              png={getCardIcon(card.title)}
              series={card.series}
            />
          </div>
        );
      })}
    </div>
  );
};

// Helper function to determine card color based on title
const getCardColor = (title) => {
  switch (title) {
    case "Fatalities":
      return { backGround: "linear-gradient(180deg, #C4A3D5   0%,rgb(225, 152, 235)   100%)", boxShadow: "0px 10px 20px 0px #e0c6f5" };
    case "Total Crashes":
      return { backGround: "linear-gradient(180deg,rgb(236, 137, 149) 0%,rgb(225, 132, 141) 100%)", boxShadow: "0px 10px 20px 0px #FDC0C7" };
    case "Serious Injuries":
      return { backGround: "linear-gradient(180deg,  rgb(252, 202, 116) 0%,  rgb(225, 195, 142) 100%)", boxShadow: "0px 10px 20px 0px #F9D59B" };
    case "Compensation Cost":
      return { backGround: "linear-gradient(180deg,rgb(239, 146, 180)  0%,rgb(225, 146, 185)   100%)", boxShadow: "0px 10px 20px 0px rgb(240, 170, 205)" };
    default:
      return { backGround: "linear-gradient(180deg, #bb67ff 0%, #c484f3 100%)", boxShadow: "0px 10px 20px 0px #e0c6f5" };
  }
};

// Helper function to determine card icon based on title
const getCardIcon = (title) => {
  switch (title) {
    case "Fatalities":
      return UilHeartbeat
    case "Total Crashes":
      return UilHospital
    case "Serious Injuries":
      return UilCar
    case "Compensation Cost":
      return UilDollarAlt
    default:
      return (props) => <div {...props}>📊</div>;
  }
};

export default Cards;
