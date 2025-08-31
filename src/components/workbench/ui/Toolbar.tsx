import React, { useState } from "react";

import ToolbarLeft from "./ToolbarLeft";
import ToolbarMain from "./ToolbarMain";
import ToolbarSecondary from "./ToolbarSecondary";
import ToolbarRight from "./ToolbarRight";

export default function Toolbar({workspace}: {workspace: any}) {
  const [active, setActive] = useState("Draw");
  const [size, setSize] = useState(4);
  const [opacity, setOpacity] = useState(100);

  return (
    <>
      <div className="flex justify-between w-full px-2 mx-auto mt-4">
        <ToolbarLeft />
        <div className="flex-1 flex flex-col items-center">
          <ToolbarMain active={active} setActive={setActive} />
          <div className="h-2" />
          <ToolbarSecondary active={active} setActive={setActive} size={size} setSize={setSize} opacity={opacity} setOpacity={setOpacity} />
        </div>
        <ToolbarRight />
      </div>
    </>
  );
}
