import React from "react";
import dynamic from "next/dynamic";

const Workbench = dynamic(() => import("./Workbench"), { ssr: false });

export default function WorkbenchPage({workspace}: {workspace: any}) {
  return <Workbench workspace={workspace}/>;
}
