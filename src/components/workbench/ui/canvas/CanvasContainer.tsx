import { FC, RefObject } from 'react';

interface CanvasContainerProps {
  containerRef: RefObject<HTMLDivElement>;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (event: React.DragEvent<HTMLDivElement>) => void;
  children?: React.ReactNode;
}

const CanvasContainer: FC<CanvasContainerProps> = ({
  containerRef,
  onDrop,
  onDragOver,
  onDragLeave,
  children
}) => {
  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingLeft: 240, // match LayerPanel width
        paddingRight: 320, // match RightPanel width
        boxSizing: "border-box",
      }}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      <canvas id="fabricCanvas" style={{ border: "1px solid #ccc", display: "block", background: "#fff" }}></canvas>
      {children}
    </div>
  );
};

export default CanvasContainer;
