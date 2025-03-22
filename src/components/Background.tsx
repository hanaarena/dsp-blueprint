const style: Record<string, string | number> = {
  position: "absolute",
  zIndex: -1,
  width: "100%",
  height: "100%",
  left: 0,
  top: 0,
};

export default function Background() {
  return (
    <svg style={style}>
      <defs>
        <pattern
          id="gridPattern"
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
          patternContentUnits="userSpaceOnUse"
        >
          <line
            x1="10"
            y1="0"
            x2="10"
            y2="20"
            stroke="lightgray"
            stroke-width="1"
          />
          <line
            x1="0"
            y1="10"
            x2="20"
            y2="10"
            stroke="lightgray"
            stroke-width="1"
          />
        </pattern>
      </defs>

      <rect width="100%" height="100%" fill="url(#gridPattern)" />
    </svg>
  );
}
