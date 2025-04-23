import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import './CalendarHeatmap.css';

const CalendarHeatmap = () => {
  const svgRefCal = useRef();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/traffic_accidents')
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => console.error('Error fetching traffic accident data:', err));
  }, []);

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Step 1: Count accidents by year and month
    const counts = d3.rollup(
      data,
      v => v.length,
      d => {
        const date = new Date(d.published_date);
        return `${date.getFullYear()}-${date.getMonth()}`; // e.g., "2025-3"
      }
    );

    // Step 2: Prepare data for heatmap
    const allEntries = Array.from(counts, ([key, count]) => {
      const [year, month] = key.split('-').map(Number);
      return { year, month, count };
    });

    const years = Array.from(new Set(allEntries.map(d => d.year))).sort();
    const months = d3.range(0, 12); // 0 = Jan

    // SVG layout
    const margin = { top: 60, right: 120, bottom: 10, left: 60 };
    const cellSize = 40;
    const adjustedCellSize = 38;
    const width = months.length * cellSize + margin.left + margin.right;
    const height = years.length * cellSize + margin.top + margin.bottom;

    // Color scale
    const maxCount = d3.max(allEntries, d => d.count);
    // const color = d3.scaleSequential(d3.interpolateYlOrRd).domain([0, maxCount]);
    const color = d3.scaleLinear()
                    .domain([0, maxCount])
                    .range(["#FCCA74", "#A03D5D"]);

    d3.select(svgRefCal.current).selectAll("*").remove();

    const svg = d3.select(svgRefCal.current)
      .attr("width", width)
      .attr("height", height);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Draw heatmap cells
    g.selectAll("rect")
      .data(allEntries)
      .enter()
      .append("rect")
      .attr("x", d => d.month * cellSize + 2)
      .attr("y", d => years.indexOf(d.year) * cellSize - 2)
      .attr("width", adjustedCellSize)
      .attr("height", adjustedCellSize)
      .attr("fill", d => color(d.count))
      .append("title")
      .text(d => `${d3.timeFormat("%B")(new Date(2020, d.month))} ${d.year}: ${d.count} reports`)
      .on("mouseover", function () {
        d3.select(this).attr("opacity", 0.7);
      });


    // X-axis: Months
    const xScale = d3.scaleBand()
      .domain(months)
      .range([0, months.length * cellSize])
      .padding(0.1);

    const xAxis = d3.axisTop(xScale)
      .tickFormat(m => d3.timeFormat("%B")(new Date(2020, m, 1)));

    g.append("g")
      .attr("transform", "translate(0, -5)")
      .call(xAxis)
      .selectAll("text")
      .style("text-anchor", "start")
      .attr("transform", "rotate(-45)");

    // Y-axis: Years
    const yScale = d3.scaleBand()
      .domain(years)
      .range([0, years.length * cellSize]);

    const yAxis = d3.axisLeft(yScale);

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
      .attr("y2", "0%"); // Vertical gradient

    linearGradient.selectAll("stop")
      .data(d3.ticks(0, maxCount, 10))
      .enter().append("stop")
      .attr("offset", d => `${(d / maxCount) * 100}%`)
      .attr("stop-color", d => color(d));

    // Draw the gradient bar
    svg.append("g")
      .attr("transform", `translate(${width - margin.right + 20}, ${margin.top})`)
      .append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#legend-gradient)");

    // Legend scale and axis (vertical)
    const legendScale = d3.scaleLinear()
      .domain([0, maxCount])
      .range([legendHeight, 0]);

    const legendAxis = d3.axisRight(legendScale)
      .ticks(5)
      .tickFormat(d3.format("~s"));

    // Append vertical axis next to the gradient bar
    svg.append("g")
      .attr("transform", `translate(${width - margin.right + 20 + legendWidth}, ${margin.top})`)
      .call(legendAxis);


  }, [data]);

  return (
    <div className="cal-container">
      <h2 className="text-xl font-semibold mb-4">Monthly Accidents Heatmap</h2>
      <svg ref={svgRefCal} className="chart-cal"></svg>
    </div>
  );
};

export default CalendarHeatmap;
