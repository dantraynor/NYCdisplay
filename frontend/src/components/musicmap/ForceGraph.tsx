import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { getMockArtistData } from './mockData';

interface ForceGraphProps {
  centerArtist: string;
  onSelectArtist: (artistName: string) => void;
}

interface Node {
  id: string;
  name: string;
  group: number;
  size: number;
  isCenter?: boolean;
}

interface Link {
  source: string;
  target: string;
  value: number;
}

const ForceGraph: React.FC<ForceGraphProps> = ({ centerArtist, onSelectArtist }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [svgWidth, setSvgWidth] = useState(800);
  const [svgHeight, setSvgHeight] = useState(600);
  const [graphData, setGraphData] = useState<{ nodes: Node[], links: Link[] }>({ nodes: [], links: [] });
  const [, setLoading] = useState(true);
  
  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current?.parentElement) {
        setSvgWidth(svgRef.current.parentElement.clientWidth);
        setSvgHeight(Math.max(svgRef.current.parentElement.clientHeight, 600));
      }
    };
    
    window.addEventListener('resize', updateDimensions);
    updateDimensions();
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  
  // Fetch data for the center artist
  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        setLoading(true);
        // In a real app, replace this with an API call
        const data = getMockArtistData(centerArtist);
        setGraphData(data);
      } catch (error) {
        console.error('Error fetching artist data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (centerArtist) {
      fetchArtistData();
    }
  }, [centerArtist]);
  
  // Initialize and update the force graph
  useEffect(() => {
    if (!svgRef.current || !graphData.nodes.length) return;
    
    // Clear previous graph
    d3.select(svgRef.current).selectAll("*").remove();
    
    const svg = d3.select(svgRef.current);
    
    // Define color scale
    const colorScale = d3.scaleOrdinal()
      .domain([0, 1, 2, 3, 4].map(String))
      .range(['#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', '#F97316']);
    
    // Create tooltip
    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'absolute hidden p-2 bg-gray-800 text-white text-sm rounded shadow-lg z-50 pointer-events-none')
      .style('opacity', 0);
    
    // Create simulation
    const simulation = d3.forceSimulation(graphData.nodes as d3.SimulationNodeDatum[])
      .force('link', d3.forceLink(graphData.links)
        .id((d: any) => d.id)
        .distance(d => 100 / (d as any).value) // Closer for higher similarity
      )
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(svgWidth / 2, svgHeight / 2))
      .force('collision', d3.forceCollide().radius((d: any) => d.size * 6 + 10));
    
    // Create links
    const link = svg.append('g')
      .selectAll('line')
      .data(graphData.links)
      .enter()
      .append('line')
      .attr('stroke', '#E5E7EB')
      .attr('stroke-width', (d) => d.value * 0.5)
      .attr('stroke-opacity', 0.6);
    
    // Create node groups
    const node = svg.append('g')
      .selectAll('.node')
      .data(graphData.nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .call(d3.drag<SVGGElement, Node>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))
      .on('click', (event, d) => {
        event.stopPropagation();
        onSelectArtist(d.name);
      })
      .on('mouseover', (event, d) => {
        tooltip.transition()
          .duration(200)
          .style('opacity', 0.9)
          .style('display', 'block');
          
        tooltip.html(`<div class="font-medium">${d.name}</div>`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', () => {
        tooltip.transition()
          .duration(500)
          .style('opacity', 0)
          .style('display', 'none');
      });
    
    // Add circles to nodes
    node.append('circle')
      .attr('r', d => d.isCenter ? 15 : 5 + d.size * 2)
      .attr('fill', d => d.isCenter ? '#4F46E5' : colorScale(d.group.toString()))
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1.5);
    
    // Add artist names
    node.append('text')
      .attr('dx', d => d.isCenter ? 0 : 12)
      .attr('dy', 4)
      .attr('text-anchor', d => d.isCenter ? 'middle' : 'start')
      .attr('fill', d => d.isCenter ? '#ffffff' : '#4B5563')
      .attr('font-size', d => d.isCenter ? '12px' : '11px')
      .attr('font-weight', d => d.isCenter ? 'bold' : 'normal')
      .text(d => d.name)
      .attr('pointer-events', 'none');
    
    // Set up the simulation tick function
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);
      
      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });
    
    // Zoom functionality
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 5])
      .on('zoom', (event) => {
        svg.selectAll('g').attr('transform', event.transform);
      });
    
    svg.call(zoom);
    
    // Drag functions
    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }
    
    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }
    
    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
    
    return () => {
      simulation.stop();
      tooltip.remove();
    };
  }, [graphData, svgWidth, svgHeight, onSelectArtist]);
  
  return (
    <div className="w-full h-[70vh] relative overflow-hidden bg-gray-50 rounded-lg">
      <svg
        ref={svgRef}
        className="w-full h-full"
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      />
      <div className="absolute bottom-3 right-3 bg-white bg-opacity-90 p-2 rounded-md text-xs text-gray-500">
        Tip: Scroll to zoom, drag to move nodes
      </div>
    </div>
  );
};

export default ForceGraph;
