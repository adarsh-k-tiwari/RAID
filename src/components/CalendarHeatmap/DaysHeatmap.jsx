import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import './DaysHeatmap.css';

const DaysHeatmap = () => {
  const svgRefDays = useRef();
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('/api/traffic_accidents')
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => console.error('Error fetching traffic accident data:', err));
  }, []);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const counts = d3.rollup(
      data,
      v => v.length,
      d => {
        const date = new Date(d.published_date);
        return `${date.getFullYear()}-${date.getDay()}`;
      }
    );

    const allEntries = Array.from(counts, ([key, count]) => {
      const [year, day] = key.split('-').map(Number);
      return { year, day, count };
    });

    const years = Array.from(new Set(allEntries.map(d => d.year))).sort();
    const days = d3.range(0, 7);

    const dayLabels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const margin = { top: 60, right: 120, bottom: 60, left: 100 };
    const cellSize = 46;
    const adjustedCellSize = 42;
    const width = years.length * cellSize + margin.left + margin.right;
    const height = days.length * cellSize + margin.top + margin.bottom;

    const maxCount = d3.max(allEntries, d => d.count);
    const color = d3.scaleLinear()
      .domain([0, maxCount])
      .range(["#FCCA74", "#A03D5D"]);

    d3.select(svgRefDays.current).selectAll("*").remove();

    const svg = d3.select(svgRefDays.current)
      .attr("width", width)
      .attr("height", height);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Draw heatmap cells — X = year, Y = day
    g.selectAll("rect")
      .data(allEntries)
      .enter()
      .append("rect")
      .attr("x", d => years.indexOf(d.year) * cellSize + 5)
      .attr("y", d => d.day * cellSize)
      .attr("width", adjustedCellSize)
      .attr("height", adjustedCellSize)
      .attr("fill", d => color(d.count))
      .append("title")
      .text(d => `${dayLabels[d.day]} ${d.year}: ${d.count} incidents`);

    // X-axis: Years
    const xScale = d3.scaleBand()
      .domain(years)
      .range([0, years.length * cellSize]);

    const xAxis = d3.axisTop(xScale);
    g.append("g")
      .attr("transform", "translate(0, -5)")
      .call(xAxis)
      .selectAll("text")
      .style("text-anchor", "start")
      .attr("transform", "rotate(-45)");

    // Y-axis: Days of the Week
    const yScale = d3.scaleBand()
      .domain(days)
      .range([0, days.length * cellSize]);

    const yAxis = d3.axisLeft(yScale)
      .tickFormat(d => dayLabels[d]);

    g.append("g").call(yAxis);

    // Color legend
    const legendWidth = 10;
    const legendHeight = 320;

    const defs = svg.append("defs");
    const linearGradient = defs.append("linearGradient")
      .attr("id", "legend-gradient")
      .attr("x1", "0%")
      .attr("y1", "100%")
      .attr("x2", "0%")
      .attr("y2", "0%");

    linearGradient.selectAll("stop")
      .data(d3.ticks(0, maxCount, 10))
      .enter().append("stop")
      .attr("offset", d => `${(d / maxCount) * 100}%`)
      .attr("stop-color", d => color(d));

    svg.append("g")
      .attr("transform", `translate(${width - margin.right + 20}, ${margin.top})`)
      .append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#legend-gradient)");

    const legendScale = d3.scaleLinear()
      .domain([0, maxCount])
      .range([legendHeight, 0]);

    const legendAxis = d3.axisRight(legendScale)
      .ticks(5)
      .tickFormat(d3.format("~s"));

    svg.append("g")
      .attr("transform", `translate(${width - margin.right + 20 + legendWidth}, ${margin.top})`)
      .call(legendAxis);

  }, [data]);

  return (
    <div className="days-container">
      <h2 className="text-xl font-semibold mb-4">Accidents by Year & Day of Week</h2>
      <svg ref={svgRefDays} className="chart-days"></svg>
    </div>
  );
};

export default DaysHeatmap;
