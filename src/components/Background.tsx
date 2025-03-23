import { useRef, useEffect, useCallback } from "react";
import * as d3 from "d3";

interface IBackgroundProps {
  svgRef: React.RefObject<SVGSVGElement | null>;
}

export default function Background({ svgRef }: IBackgroundProps) {
  const zoomGroupRef = useRef<SVGGElement>(null);
  const cellSize = 20;

  // draw grid
  const drawGrid = useCallback(() => {
    const svg = d3.select(svgRef.current);
    const width = Number(svg.attr("width"));
    const height = Number(svg.attr("height"));

    const zoomGroup = d3.select(zoomGroupRef.current);
    zoomGroup.selectAll(".grid-line").remove();

    const transform = d3.zoomTransform(svgRef.current as SVGSVGElement);
    const x1 = transform.invertX(0);
    const x2 = transform.invertX(width);
    const y1 = transform.invertY(0);
    const y2 = transform.invertY(height);

    const startX = Math.floor(x1 / cellSize) * cellSize;
    const endX = Math.ceil(x2 / cellSize) * cellSize;
    const startY = Math.floor(y1 / cellSize) * cellSize;
    const endY = Math.ceil(y2 / cellSize) * cellSize;

    zoomGroup
      .selectAll(".axis-y")
      .data(d3.range(startX, endX, cellSize))
      .enter()
      .append("line")
      .attr("class", "grid-line axis-x")
      .attr("x1", (d: number) => d)
      .attr("x2", (d: number) => d)
      .attr("y1", y1)
      .attr("y2", y2);

    zoomGroup
      .selectAll(".axix-x")
      .data(d3.range(startY, endY, cellSize))
      .enter()
      .append("line")
      .attr("class", "grid-line axix-y")
      .attr("x1", x1)
      .attr("x2", x2)
      .attr("y1", (d: number) => d)
      .attr("y2", (d: number) => d);
  }, [cellSize, svgRef]);

  useEffect(() => {
    if (!svgRef.current) return;

    // remove duplicate `g`
    const _g = svgRef.current.querySelector("g");
    if (_g) {
      _g.remove();
    }
    const svg = d3.select(svgRef.current);
    const width = window.innerWidth;
    const height = window.innerHeight;
    svg.attr("width", width).attr("height", height);

    // init zoom function
    const zoomGroup = svg.append("g");
    zoomGroupRef.current = zoomGroup.node();
    drawGrid();

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 5])
      .on("zoom", (event: any) => {
        d3.select(zoomGroupRef.current).attr("transform", event.transform);
        drawGrid();
      });

    svg.call(zoom);
  }, [drawGrid, svgRef]);

  return <></>;
}
