import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import './TravelMode.css';

const TravelMode = () => {
  const svgRef = useRef();
  const [data, setData] = useState([]);
  const [view, setView] = useState('death');
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL 

  // Fetch data from backend API
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/travel_mode`)
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => console.error('Error fetching travel mode data:', err));
  }, []);

  // Use D3.js to plot the bar chart
  useEffect(() => {
    if (!data.length) return;
  
    d3.select(svgRef.current).selectAll('*').remove();
  
    const metricGroups = {
      death: [
        'motor_vehicle_death',
        'bicycle_death',
        'pedestrian_death',
        'motorcycle_death',
        'micromobility_death',
        'other_death',
      ],
      injury: [
        'motor_vehicle_serious_injury',
        'bicycle_serious_injury',
        'pedestrian_serious_injury',
        'motorcycle_serious_injury',
        'micromobility_serious_injury',
        'other_serious_injury',
      ],
    };
  
    const keys = metricGroups[view];
    const color = d3.scaleOrdinal()
      .domain(keys)
      .range(["#FCCA74", "#CBAACB", "#EC8995", "#FFD1BA", "#A03D5D", "#B4E1D7"]);
  
    const containerWidth = svgRef.current.clientWidth;
    const margin = { top: 50, right: 30, bottom: 50, left: 50 },
          width = containerWidth - margin.left - margin.right,
          height = 300 - margin.top - margin.bottom - 60;
  
    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
    const x = d3.scalePoint()
      .domain(data.map(d => d.crash_year))
      .range([0, width]);
  
    const y = d3.scaleLinear()
      .domain([
        0,
        d3.max(data, d =>
          d3.max(keys, key => +d[key])
        ),
      ])
      .nice()
      .range([height, 0]);
  
    // X Axis
    svg.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(x).tickValues(x.domain().filter((_, i) => i % 2 === 0)));
  
    // Y Axis
    svg.append('g')
      .call(d3.axisLeft(y));
  
    // Horizontal grid lines
    svg.append('g')
      .attr('class', 'grid-lines')
      .call(d3.axisLeft(y)
        .tickSize(-width)
        .tickFormat(''))
      .style('stroke-dasharray', '3,3')
      .style('stroke-opacity', 0.2)
      .select('.domain')
      .remove();
  
    // Line generator
    const line = d3.line()
      .x(d => x(d.crash_year))
      .y(d => y(d.value));

    const tooltip = d3.select('#travel-mode-tooltip');
  
    keys.forEach((key) => {
      const lineData = data.map(d => ({ crash_year: d.crash_year, value: +d[key] }));
  
      svg.append("path")
        .datum(lineData)
        .attr("fill", "none")
        .attr("stroke", color(key))
        .attr("stroke-width", 2.5)
        .attr("d", line);
  
      // Add data points
      svg.selectAll(`.dot-${key}`)
        .data(lineData)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.crash_year))
        .attr("cy", d => y(d.value))
        .attr("r", 3)
        .attr("fill", color(key))
        .on('mouseover', (event, d) => {
          tooltip
            .style('opacity', 1)
            .html(`
              <strong>${key.replace(/_(death|serious_injury)/, '').replace(/_/g, ' ')}</strong><br/>
              Year: ${d.crash_year}<br/>
              Count: ${d.value}
            `)
            .style('left', `${event.pageX}px`)
            .style('top', `${event.pageY}px`);
        })
        .on('mousemove', (event) => {
          tooltip
            .style('left', `${event.pageX - 400}px`)
            .style('top', `${event.pageY - 200}px`);
        })
        .on('mouseout', () => {
          tooltip.style('opacity', 0);
        });
    });
  
    // Y axis label
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -40)
      .attr('x', -height / 2)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text(view === 'death' ? 'Number of Deaths' : 'Number of Serious Injuries')
      .style('font-size', '10px');

  
    // X axis label
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height + 30)
      .attr('text-anchor', 'middle')
      .text('Year of Incidents')
      .style('font-size', '10px');
    
    
    // Legend
    const itemsPerRow = 3;
    const legend = svg.selectAll('.legend')
      .data(keys)
      .enter().append('g')
      .attr('class', 'legend')
      .attr('transform', (d, i) => {
        const row = Math.floor(i / itemsPerRow);
        const col = i % itemsPerRow;
        return `translate(${col * 110 - 80}, ${row * 20 - 50})`;
      });
  
    legend.append('rect')
      .attr('x', 110)
      .attr('y', 0)
      .attr('width', 15)
      .attr('height', 15)
      .style('fill', d => color(d));
  
    legend.append('text')
      .attr('x', 130)
      .attr('y', 12)
      .text(d => d.replace(view === 'death' ? '_death' : '_serious_injury', '').replace('_', ' '))
      .style('font-size', '12px')
      .attr("class", "legend");
  }, [data, view]);
  

  return (
    <div className="container">
      {/* Toggle button for showing death and serious injuries */}
      <h2 className="text-xl font-semibold mb-4">{view === 'death' ? 'Deaths' : 'Serious Injuries'} by Travel Mode</h2>
      <div className="travel-mode-tooltip" id="travel-mode-tooltip"></div>
      <div className="mb-4 flex gap-4 justify-center">
        <button
          className={`toggle-button ${view === 'death' ? 'active' : 'inactive'}`}
          onClick={() => setView('death')}
        >
          Deaths
        </button>
        <button
          className={`toggle-button ${view === 'injury' ? 'active' : 'inactive'}`}
          onClick={() => setView('injury')}
        >
          Serious Injuries
        </button>
      </div>

      <svg ref={svgRef} className="chart"></svg>
    </div>
  );
};

export default TravelMode;
