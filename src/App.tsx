import { useRef } from "react";
import Background from "./components/Background";

import "./App.css";

function App() {
  const svgRef = useRef<SVGSVGElement | null>(null);

  return (
    <>
      <svg id="editor" ref={svgRef}></svg>
      <Background svgRef={svgRef} />
    </>
  );
}

export default App;
