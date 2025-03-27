import { useRef, useEffect, useCallback, useState } from "react";
import * as d3 from "d3";
import { detectIntersection } from "@/utils/line";
import BuildingModal from "@/components/BuildingModal";

const styles: Record<string, React.CSSProperties> = {
  "btn-reset": {
    position: "fixed",
    top: "10px",
    right: "10px",
    padding: "10px",
    background: "white",
    border: "1px solid black",
    cursor: "pointer",
  },
  "btn-undo": {
    position: "fixed",
    top: "10px",
    right: "76px",
    padding: "10px",
    background: "white",
    border: "1px solid black",
    cursor: "pointer",
  },
  "btn-add-building": {
    position: "fixed",
    top: "10px",
    right: "142px",
    padding: "10px",
    background: "white",
    border: "1px solid black",
    cursor: "pointer",
  },
};

interface IBackgroundProps {
  svgRef: React.RefObject<SVGSVGElement | null>;
}

export default function Background({ svgRef }: IBackgroundProps) {
  const zoomGroupRef = useRef<SVGGElement>(null);
  const gridGroupRef = useRef<SVGGElement>(null);
  const buildingGroupRef = useRef<SVGGElement>(null);
  const draftLineRef = useRef<SVGGElement>(null);
  const [startPoint, setStartPoint] = useState<Point>({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [lines, setLines] = useState<Line[]>([]);
  const cellSize = 20;
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [isPlacingBuilding, setIsPlacingBuilding] = useState<boolean>(false);
  const buildingImageRef = useRef<HTMLImageElement>(null);

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

  const initViewport = useCallback(() => {
    const svg = d3.select(svgRef.current);
    const width = window.innerWidth;
    const height = window.innerHeight;
    svg.attr("width", width).attr("height", height);

    return svg;
  }, [svgRef]);

  const drawGrid = useCallback(() => {
    const svg = d3.select(svgRef.current);
    const width = Number(svg.attr("width"));
    const height = Number(svg.attr("height"));
    const gridGroup = d3.select(gridGroupRef.current);
    gridGroup.selectAll(".grid-line").remove();

    const transform = d3.zoomTransform(svgRef.current as SVGSVGElement);
    const x1 = transform.invertX(0);
    const x2 = transform.invertX(width);
    const y1 = transform.invertY(0);
    const y2 = transform.invertY(height);
    const startX = Math.floor(x1 / cellSize) * cellSize;
    const endX = Math.ceil(x2 / cellSize) * cellSize;
    const startY = Math.floor(y1 / cellSize) * cellSize;
    const endY = Math.ceil(y2 / cellSize) * cellSize;

    gridGroup
      .selectAll(".axis-y")
      .data(d3.range(startX, endX, cellSize))
      .enter()
      .insert("line", ".line")
      .attr("class", "grid-line axis-y")
      .attr("x1", (d: number) => d)
      .attr("x2", (d: number) => d)
      .attr("y1", y1)
      .attr("y2", y2);

    gridGroup
      .selectAll(".axis-x")
      .data(d3.range(startY, endY, cellSize))
      .enter()
      .insert("line", ".line")
      .attr("class", "grid-line axix-x")
      .attr("x1", x1)
      .attr("x2", x2)
      .attr("y1", (d: number) => d)
      .attr("y2", (d: number) => d);
  }, [cellSize, svgRef]);

  const checkIntersections = useCallback(() => {
    const intersectionPoints: Point[] = [];
    for (let i = 0; i < lines.length; i++) {
      for (let j = i + 1; j < lines.length; j++) {
        const intersection = detectIntersection(lines[i], lines[j]);
        if (intersection) {
          intersectionPoints.push(intersection);
        }
      }
    }

    d3.select(zoomGroupRef.current).selectAll(".intersection-circle").remove();
    d3.select(zoomGroupRef.current)
      .selectAll(".intersection-circle")
      .data(intersectionPoints)
      .enter()
      .append("circle")
      .attr("class", "intersection-circle")
      .attr("cx", (d: Point) => d.x)
      .attr("cy", (d: Point) => d.y)
      .attr("r", 3)
      .attr("fill", "currentColor");
  }, [lines]);

  const handleBuildingSelect = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setIsPlacingBuilding(true);
  };

  const handleCancelBuildingPlacement = () => {
    setSelectedImageUrl(null);
    setIsPlacingBuilding(false);
    if (buildingImageRef.current) {
      d3.select(buildingImageRef.current).remove();
      buildingImageRef.current = null;
    }
  };

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = initViewport();
    // avoid re-render `g`
    if (!zoomGroupRef.current) {
      const zoomGroup = svg.append("g");
      zoomGroupRef.current = zoomGroup.node();

      // grid line group & building group
      const gridGroup = zoomGroup.append("g");
      gridGroupRef.current = gridGroup.node();
      const buildingGroup = zoomGroup.append("g");
      buildingGroupRef.current = buildingGroup.node();
    }

    drawGrid();

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 5])
      .on("zoom", (event: any) => {
        d3.select(zoomGroupRef.current).attr("transform", event.transform);
        drawGrid();
      });

    zoom(svg as d3.Selection<SVGSVGElement, unknown, null, any>);
    svg.on("click", (event: MouseEvent) => {
      const [mouseX, mouseY] = d3.pointer(event);
      const snappedPoint = snapToGrid(mouseX, mouseY);

      if (isPlacingBuilding && selectedImageUrl) {
        d3.select(buildingGroupRef.current)
          .append("image")
          .attr("href", selectedImageUrl)
          .attr("x", snappedPoint.x - cellSize / 2)
          .attr("y", snappedPoint.y - cellSize / 2)
          .attr("width", cellSize * 2)
          .attr("height", cellSize * 2);
        handleCancelBuildingPlacement();
        return;
      }

      if (!startPoint.x && !startPoint.y) {
        setStartPoint(snappedPoint);
        setIsDrawing(true);
      } else {
        const endPoint = snapToGrid(mouseX, mouseY);
        const newLine: Line = {
          x1: startPoint.x,
          y1: startPoint.y,
          x2: endPoint.x,
          y2: endPoint.y,
        };

        // draw line & arrow
        d3.select(zoomGroupRef.current)
          .append("line")
          .attr("class", "line")
          .attr("marker-end", "url(#arrow)")
          .attr("x1", startPoint.x)
          .attr("y1", startPoint.y)
          .attr("x2", endPoint.x)
          .attr("y2", endPoint.y);

        setLines((prevLines) => [...prevLines, newLine]);
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
      if (isPlacingBuilding && selectedImageUrl) {
        const [mouseX, mouseY] = d3.pointer(event);
        const snappedPoint = snapToGrid(mouseX, mouseY);

        if (!buildingImageRef.current) {
          const image = d3
            .select(buildingGroupRef.current)
            .append("image")
            .attr("href", selectedImageUrl)
            .attr("width", cellSize * 2)
            .attr("height", cellSize * 2)
            .style("pointer-events", "none");
          buildingImageRef.current =
            image.node() as unknown as HTMLImageElement;
        }

        d3.select(buildingImageRef.current)
          .attr("x", snappedPoint.x - cellSize / 2)
          .attr("y", snappedPoint.y - cellSize / 2);
        return;
      }

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
  }, [
    drawGrid,
    svgRef,
    snapToGrid,
    startPoint,
    isDrawing,
    initViewport,
    isPlacingBuilding,
    selectedImageUrl,
  ]);

  useEffect(() => {
    window.onresize = () => {
      const svg = d3.select(svgRef.current);
      const width = window.innerWidth;
      const height = window.innerHeight;
      svg.attr("width", width).attr("height", height);
      drawGrid();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleCancelBuildingPlacement();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.onresize = null;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [svgRef, drawGrid]);

  useEffect(() => {
    checkIntersections();
  }, [lines, checkIntersections]);

  const reset = () => {
    if (svgRef.current) {
      const zoomG = d3.select(zoomGroupRef.current);
      zoomG.selectAll(".line").remove();
      zoomG.selectAll(".intersection-circle").remove();
      d3.select(buildingGroupRef.current).selectAll("image").remove();
      setLines([]);
    }
  };

  const undo = () => {
    if (svgRef.current) {
      const gLines = d3.select(zoomGroupRef.current).selectAll(".line").nodes();
      const lastLine = gLines[gLines.length - 1];
      if (lastLine) {
        d3.select(lastLine).remove();
        setLines((prevLines) => prevLines.slice(0, -1));
      }
    }
  };

  return (
    <>
      <div className="actions">
        <button onClick={reset} style={styles["btn-reset"]}>
          Reset
        </button>
        <button onClick={undo} style={styles["btn-undo"]}>
          Undo
        </button>
        <button
          onClick={() => setIsModalOpen(true)}
          style={styles["btn-add-building"]}
        >
          Add Building
        </button>
      </div>
      <BuildingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onBuildingSelect={handleBuildingSelect}
      />
    </>
  );
}
