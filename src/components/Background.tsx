import { useEffect } from "react";
import * as d3 from "d3";

type IBackgroundProps = {
  svgref: React.RefObject<SVGSVGElement | null>;
};

export default function Background({ svgref }: IBackgroundProps) {
  useEffect(() => {
    if (svgref.current) {
      // init d3 axis grid lines
      const bg = d3.select(svgref.current);
      const w = 500;
      const h = 500;
      const cellSize = 20;

      bg.attr("width", w).attr("height", h);
      bg.selectAll(".axis-y")
        .data(d3.range(0, w, cellSize))
        .enter()
        .append("line")
        .attr("class", "grid-line axis-y")
        .style("stroke", "lightgray")
        .attr("x1", (d) => d)
        .attr("x2", (d) => d)
        .attr("y1", 0)
        .attr("y2", h);

      bg.selectAll(".axis-x")
        .data(d3.range(0, h, cellSize))
        .enter()
        .append("line")
        .attr("class", "grid-line axis-x")
        .style("stroke", "lightgray")
        .attr("x1", 0)
        .attr("x2", w)
        .attr("y1", (d) => d)
        .attr("y2", (d) => d);
    }
  }, [svgref]);
  return <></>;
}
