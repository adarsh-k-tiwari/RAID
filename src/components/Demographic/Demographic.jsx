import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import './Demographic.css';
import { DemographicData } from '../../Data/Data.js';

const Demographic = () => {
  const svgRef = useRef();
  const [data, setData] = useState([]);
  const [view, setView] = useState('death');

  useEffect(() => {
    setData(DemographicData);
  }, []);

  // Fetch data from the server and using D3.js to build the staked bar chart
  useEffect(() => {
    if (!data.length) return;

    d3.select(svgRef.current).selectAll('*').remove();

    const keys = [...new Set(data.map(d => d.race))];
    const years = [...new Set(data.map(d => d.year))];

    const color = d3.scaleOrdinal()
      .domain(keys)
      .range(["#FCCA74", "#CBAACB", "#EC8995", "#FFD1BA", "#A03D5D", "#B4E1D7"]);

    // Formatting data for stacked bar chart
    const formatted = years.map(year => {
      const entry = { year };
      data.filter(d => d.year === year).forEach(d => {
        entry[d.race] = view === 'death' ? d.deaths : d.serious_injuries;
      });
      return entry;
    });
    
    // Creating stacked data bars
    const stackedData = d3.stack().keys(keys)(formatted);

    const containerWidth = svgRef.current.clientWidth;
    const margin = { top: 60, right: 50, bottom: 50, left: 50 },
      width = containerWidth - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .domain(years)
      .range([0, width])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(formatted, d =>
        keys.reduce((sum, key) => sum + (d[key] || 0), 0)
      )])
      .nice()
      .range([height, 0]);

    // X Axis
    svg.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.format('d')))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    // Y Axis
    svg.append('g')
      .call(d3.axisLeft(y));

    // Grid lines
    svg.append('g')
      .attr('class', 'grid-lines')
      .call(d3.axisLeft(y)
        .tickSize(-width)
        .tickFormat('')
      )
      .style('stroke-dasharray', '3,3')
      .style('stroke-opacity', 0.2)
      .select('.domain')
      .remove();

    // Axis Labels
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 5)
      .attr('text-anchor', 'middle')
      .text('Year of Incidents')
      .style('font-size', '14px');

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 10)
      .attr('x', -height / 2)
      .attr('text-anchor', 'middle')
      .text(view === 'death' ? 'Number of Deaths' : 'Number of Serious Injuries')
      .style('font-size', '14px');

    const tooltip = d3.select('#demographic-tooltip');

    // Bars
    svg.selectAll('.layer')
      .data(stackedData)
      .join('g')
      .attr('fill', d => color(d.key))
      .selectAll('rect')
      .data(d => d)
      .join('rect')
      .attr('x', d => x(d.data.year))
      .attr('y', d => y(d[1]))
      .attr('height', d => y(d[0]) - y(d[1]))
      .attr('width', x.bandwidth())
      .attr('class', 'bar')
      .on('mouseover', (event, d) => {
        tooltip
          .style('opacity', 1)
          .html(`
            Year: ${d.data.year}<br>
            ${keys.map(key => `${key}: ${d.data[key] || 0}`).join('<br>')}
          `)
          .style('left', `${event.pageX}px`)
          .style('top', `${event.pageY}px`);
      })
      .on('mousemove', (event) => {
        tooltip
          .style('left', `${event.pageX - 1150}px`)
          .style('top', `${event.pageY - 100}px`);
      })
      .on('mouseout', () => {
        tooltip.style('opacity', 0);
      });

    // Legend
    const itemsPerRow = 3;
    const legend = svg.selectAll('.legend')
      .data(keys)
      .enter().append('g')
      .attr('class', 'legend')
      .attr('transform', (d, i) => {
        const row = Math.floor(i / itemsPerRow);
        const col = i % itemsPerRow;
        return `translate(${col * 120 + 20 }, ${-margin.top + 10 + row * 20})`;
      });

    legend.append('rect')
      .attr('width', 15)
      .attr('height', 15)
      .style('fill', d => color(d));

    legend.append('text')
      .attr('x', 20)
      .attr('y', 12)
      .text(d => d.replace('_', ' '))
      .style('font-size', '12px');
  }, [data, view]);

  return (
    <div className="demographic-container">
      {/* Dynamically changing the title of bar chart */}
      <h2 className="text-xl font-semibold mb-4">{view === 'death' ? 'Deaths' : 'Serious Injuries'} by Race Over Time</h2>
      <div className="mb-4 flex gap-4 justify-center">
        {/* Toggle button to switch between Death and Serious Injuries */}
        <button
          className={`demographic-toggle-button ${view === 'death' ? 'active' : 'inactive'}`}
          onClick={() => setView('death')}
        >
          Deaths
        </button>
        <button
          className={`demographic-toggle-button ${view === 'injury' ? 'active' : 'inactive'}`}
          onClick={() => setView('injury')}
        >
          Serious Injuries
        </button>
      </div>
      <svg ref={svgRef} className="demographic-chart w-full" />
      <div className="demographic-tooltip" id="demographic-tooltip"></div>
    </div>
  );
};

export default Demographic;
