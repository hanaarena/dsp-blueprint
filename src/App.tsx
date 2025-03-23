import { useRef } from "react";
import Background from "./components/Background";

import "./App.css";

function App() {
  const svgRef = useRef<SVGSVGElement | null>(null);

  return (
    <>
      <svg id="board" ref={svgRef}></svg>
      <Background svgref={svgRef} />
    </>
  );
}

export default App;
