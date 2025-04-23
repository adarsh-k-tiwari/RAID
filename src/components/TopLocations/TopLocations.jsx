import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import './TopLocations.css';

const TopLocationsChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const svgRef = useRef();
  const containerRef = useRef();

  // Fetch data from backend API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/top_5');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
        setData(result);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to wrap long text into multiple lines if address is cutting off
  function wrapText(text, width) {
    text.each(function () {
      const text = d3.select(this);
      const words = text.text().split(/\s+/).reverse();
      let word;
      let line = [];
      const lineHeight = 1.1;
      const y = text.attr('y');
      const dy = parseFloat(text.attr('dy')) || 0;
      let tspan = text.text(null)
        .append('tspan')
        .attr('x', 0)
        .attr('y', y)
        .attr('dy', `${dy}em`);

      while ((word = words.pop())) {
        line.push(word);
        tspan.text(line.join(' '));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(' '));
          line = [word];
          tspan = text.append('tspan')
            .attr('x', 0)
            .attr('y', y)
            .attr('dy', `${lineHeight}em`)
            .text(word);
        }
      }
    });
  }

  // Use D3.js to plot the bar chart
  useEffect(() => {
    if (loading || error || !data.length) return;
    
    d3.select(svgRef.current).selectAll('*').remove();

    // Set dimensions and margins of canvas
    const margin = { top: 20, right: 30, bottom: 40, left: 150 };
    const containerWidth = containerRef.current.clientWidth;
    const width = containerWidth - margin.left - margin.right - 10;
    const height = 280 - margin.top - margin.bottom;

    const sortedData = [...data].sort((a, b) => a.count_address - b.count_address);

    // Create scales
    const x = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count_address) * 1.1])
      .range([0, width]);

    const y = d3.scaleBand()
      .domain(sortedData.map(d => d.address))
      .range([height, 0])
      .padding(0.3);

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add X axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5))
      .selectAll('text')
      .style('font-size', '12px');

    // Add X axis label
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom)
      .text('Number of Incidents')
      .style('font-size', '14px');

    svg.append('g')
      .call(d3.axisLeft(y))
      .selectAll('.tick text')
      .call(wrapText, margin.left - 10)
      .style('font-size', '12px')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'translate(-10,0)');

    // Define color scale based on values
    const colorScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count_address)])
      .range(['#BA5370', '#BA5370']);

    // Create and style the bars
    svg.selectAll('.bar')
      .data(sortedData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('y', d => y(d.address))
      .attr('height', y.bandwidth())
      .attr('x', 0)
      .attr('width', 0)
      .attr('fill', d => colorScale(d.count_address))
      .attr('rx', 4)
      .attr('ry', 4)
      .transition()
      .duration(800)
      .delay((d, i) => i * 100)
      .attr('width', d => x(d.count_address));

    // Add count labels inside the bars
    svg.selectAll('.count')
      .data(sortedData)
      .enter()
      .append('text')
      .attr('class', 'count')
      .attr('x', d => x(d.count_address) - 40)
      .attr('y', d => y(d.address) + y.bandwidth() / 2)
      .attr('dy', '.35em')
      .style('fill', 'white')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .style('text-anchor', 'start')
      .text(d => d.count_address)
      .style('opacity', 0)
      .transition()
      .duration(800)
      .delay((d, i) => i * 100 + 300)
      .style('opacity', 1);
  }, [data, loading, error]);

  if (loading) return <div className="chart-container">Loading...</div>;
  if (error) return <div className="chart-container">Error: {error}</div>;
  if (!data.length) return <div className="chart-container">No data available</div>;

  return (
    <div className="chart-container" ref={containerRef}>
      <h3>Top 5 Most Incident Locations</h3>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default TopLocationsChart;