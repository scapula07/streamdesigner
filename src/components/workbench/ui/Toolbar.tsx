import React, { useState } from "react";

import ToolbarLeft from "./ToolbarLeft";
import ToolbarMain from "./ToolbarMain";
import ToolbarSecondary from "./ToolbarSecondary";
import ToolbarRight from "./ToolbarRight";

type ToolbarProps = {
  workspace: any;
  active: string;
  setActive: (tool: string) => void;
  imageLoaded: boolean;
  onShapeAdd?: (shape: string) => void;
  onAddText?: () => void;
  isStreaming?: boolean;
  onStreamToggle?: () => void;
};

export default function Toolbar(props: ToolbarProps) {
  const { workspace, active, setActive, imageLoaded, onShapeAdd, onAddText } = props;
  const [size, setSize] = useState(4);
  const [opacity, setOpacity] = useState(100);

  return (
    <>
      <div className="flex justify-between w-full px-2 mx-auto mt-4">
        <ToolbarLeft />
        <div className="flex-1 flex flex-col items-center">
          <ToolbarMain active={active} setActive={setActive} onShapeAdd={onShapeAdd} onAddText={onAddText} />
          <div className="h-2" />
          {imageLoaded && (
            <ToolbarSecondary 
              active={active} 
              setActive={setActive}
              isStreaming={props.isStreaming || false}
              onStreamToggle={props.onStreamToggle || (() => {})}
            />
          )}
        </div>
        <ToolbarRight />
      </div>
    </>
  );
}
