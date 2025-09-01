import React from "react";
import WorkbenchHeader from "./ui/WorkbenchHeader";
import Toolbar from "./ui/Toolbar";
import LayerPanel from "./ui/LayerPanel";
import CanvasArea from "./ui/CanvasArea";
import RightPanel from "./ui/RightPanel";
import GenerationHistory from "./ui/GenerationHistory";

export default function Workbench({workspace}: {workspace: any}) {
  const [active, setActive] = React.useState("");
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [canUndo, setCanUndo] = React.useState(false);
  const [canRedo, setCanRedo] = React.useState(false);
  const [undoRedoState, setUndoRedoState] = React.useState<{
    onUndo?: () => void;
    onRedo?: () => void;
    onAddText?: () => void;
  }>({});

  // Function to handle activation of text tool
  const handleTextToolClick = () => {
    setActive("Text"); // Switch to text mode
    if (undoRedoState.onAddText) {
      undoRedoState.onAddText();
    }
  };
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* <WorkbenchHeader /> */}
      <div className="absolute top-0 left-0 w-full z-20">
        {/* <Toolbar workspace={workspace} active={active} setActive={setActive} imageLoaded={imageLoaded} /> */}
      </div>
      <div className="relative flex-1 w-full h-full">
         <CanvasArea 
            workspace={workspace} 
            active={active} 
            setActive={setActive} 
            imageLoaded={imageLoaded} 
            setImageLoaded={setImageLoaded}
            setCanUndo={setCanUndo}
            setCanRedo={setCanRedo}
            setUndoRedoState={setUndoRedoState}
          />
        <div className="absolute left-0 top-20 h-full z-10">
          <LayerPanel 
            workspace={workspace}
            onUndo={undoRedoState.onUndo}
            onRedo={undoRedoState.onRedo}
            onAddText={handleTextToolClick}
            canUndo={canUndo}
            canRedo={canRedo}
          />
        </div>
        <GenerationHistory workspace={workspace}/>
        <div className="absolute right-0 top-20 h-full z-10 px-4">
          <RightPanel workspace={workspace}/>
        </div>
      </div>
    </div>
  );
}
