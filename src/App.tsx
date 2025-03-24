import { useRef } from "react";
import Background from "./components/Background";

import "./App.css";

function App() {
  const svgRef = useRef<SVGSVGElement | null>(null);

  return (
    <>
      <svg id="editor" ref={svgRef}>
        <defs>
          <marker
            id="arrow"
            viewBox="0 -5 10 10"
            refX="10"
            refY="0"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M0,-5L10,0L0,5" fill="black" />
          </marker>
        </defs>
      </svg>
      <Background svgRef={svgRef} />
    </>
  );
}

export default App;
