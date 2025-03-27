interface IBuildingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBuildingSelect: (imageUrl: string) => void;
}

const styles: Record<string, React.CSSProperties> = {
  "building-modal": {
    position: "fixed",
    zIndex: 1,
    left: 0,
    top: 0,
    width: "100%",
    height: "100%",
    overflow: "auto",
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  "modal-content": {
    backgroundColor: "#fefefe",
    margin: "15% auto",
    padding: "20px",
    border: "1px solid #888",
    width: "80%",
    maxWidth: "500px",
  },
  "close-button": {
    color: "#aaa",
    float: "right",
    fontSize: "28px",
    fontWeight: "bold",
  },
  "building-options": {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  "building-option": {
    width: "50px",
    height: "50px",
    cursor: "pointer",
    border: "1px solid #ccc",
    padding: "2px",
    boxSizing: "border-box",
  },
};

export default function BuildingModal({
  isOpen,
  onClose,
  onBuildingSelect,
}: IBuildingModalProps) {
  if (!isOpen) return null;

  const buildingOptions = [
    "https://placehold.co/50/FF5733/FFFFFF?text=Build1",
    "https://placehold.co/50/3371FF/FFFFFF?text=Build2",
    "https://placehold.co/50/33FF57/FFFFFF?text=Build3",
    "https://placehold.co/50/FFFF33/000000?text=Build4",
  ];

  return (
    <div style={styles["building-modal"]}>
      <div style={styles["modal-content"]}>
        <span style={styles["close-button"]} onClick={onClose}>
          &times;
        </span>
        <h3>Select building</h3>
        <div style={styles["building-options"]}>
          {buildingOptions.map((imageUrl, index) => (
            <img
              key={index}
              src={imageUrl}
              alt={`Option ${index + 1}`}
              style={styles["building-option"]}
              onClick={() => {
                onBuildingSelect(imageUrl);
                onClose();
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
