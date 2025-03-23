import { useRef, useEffect, useCallback, useState } from "react";
import * as d3 from "d3";

interface IBackgroundProps {
  svgRef: React.RefObject<SVGSVGElement | null>;
}

export default function Background({ svgRef }: IBackgroundProps) {
  const zoomGroupRef = useRef<SVGGElement>(null);
  const draftLineRef = useRef<SVGGElement>(null);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const cellSize = 20;

  const snapToGrid = useCallback(
    (x: number, y: number) => {
      const transform = d3.zoomTransform(svgRef.current as SVGSVGElement);
      const transformedPoint = transform.invert([x, y]);
      return {
        x: Math.round(transformedPoint[0] / cellSize) * cellSize,
        y: Math.round(transformedPoint[1] / cellSize) * cellSize,
      };
    },
    [svgRef]
  );

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
      .insert("line", ".line")
      .attr("class", "grid-line axis-y")
      .attr("x1", (d: number) => d)
      .attr("x2", (d: number) => d)
      .attr("y1", y1)
      .attr("y2", y2);

    zoomGroup
      .selectAll(".axis-x")
      .data(d3.range(startY, endY, cellSize))
      .enter()
      .insert("line", ".line")
      .attr("class", "grid-line axix-x")
      .attr("x1", x1)
      .attr("x2", x2)
      .attr("y1", (d: number) => d)
      .attr("y2", (d: number) => d);
    console.warn("kekek 22", 22);
  }, [cellSize, svgRef]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = window.innerWidth;
    const height = window.innerHeight;
    svg.attr("width", width).attr("height", height);

    if (!zoomGroupRef.current) {
      // init zoom function
      const zoomGroup = svg.append("g");
      zoomGroupRef.current = zoomGroup.node();
    }
    drawGrid();

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 5])
      .on("zoom", (event: any) => {
        d3.select(zoomGroupRef.current).attr("transform", event.transform);
        drawGrid();
      });

    svg.call(zoom);
    svg.on("click", (event: MouseEvent) => {
      const [mouseX, mouseY] = d3.pointer(event);
      const snappedPoint = snapToGrid(mouseX, mouseY);

      if (!startPoint.x && !startPoint.y) {
        setStartPoint(snappedPoint);
        setIsDrawing(true);
      } else {
        const endPoint = snapToGrid(mouseX, mouseY);
        console.warn("kekek 1", 1);
        setTimeout(() => {
          d3.select(zoomGroupRef.current)
            .append("line")
            .attr("class", "line")
            .attr("x1", startPoint.x)
            .attr("y1", startPoint.y)
            .attr("x2", endPoint.x)
            .attr("y2", endPoint.y);
        }, 0);

        setStartPoint({ x: 0, y: 0 });
        setIsDrawing(false);
        // remove draft dashed line
        if (draftLineRef.current) {
          d3.select(draftLineRef.current).remove();
          draftLineRef.current = null;
        }
      }
    });

    svg.on("mousemove", (event: MouseEvent) => {
      if (!isDrawing) return;

      const [mouseX, mouseY] = d3.pointer(event);
      const currentMousePoint = snapToGrid(mouseX, mouseY);

      if (!draftLineRef.current) {
        const previewLine = d3
          .select(zoomGroupRef.current)
          .append("line")
          .attr("class", "draft-line line");
        draftLineRef.current = previewLine.node() as SVGGElement;
      }

      d3.select(draftLineRef.current)
        .attr("x1", startPoint.x)
        .attr("y1", startPoint.y)
        .attr("x2", currentMousePoint.x)
        .attr("y2", currentMousePoint.y);
    });

    return () => {
      svg.on("click", null);
      svg.on("mousemove", null);
    };
  }, [drawGrid, svgRef, snapToGrid, startPoint, isDrawing]);

  return <></>;
}
