import React from "react";
import WorkbenchHeader from "./ui/WorkbenchHeader";
import Toolbar from "./ui/Toolbar";
import LayerPanel from "./ui/LayerPanel";
import CanvasArea from "./ui/CanvasArea";
import RightPanel from "./ui/RightPanel";
import GenerationHistory from "./ui/GenerationHistory";

export default function Workbench({workspace}: {workspace: any}) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* <WorkbenchHeader /> */}
      <div className="absolute top-0 left-0 w-full z-20">
        <Toolbar workspace={workspace}/>
      </div>
      <div className="relative flex-1 w-full h-full">
         <CanvasArea workspace={workspace}/>
        <div className="absolute left-0 top-20 h-full z-10">
          <LayerPanel workspace={workspace}/>
        </div>
        <GenerationHistory workspace={workspace}/>
        <div className="absolute right-0 top-20 h-full z-10 px-4">
          <RightPanel workspace={workspace}/>
        </div>
      </div>
    </div>
  );
}
