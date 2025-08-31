import dynamic from "next/dynamic";
import { workspaceApi } from '@/firebase/workspace';
import { userStore } from "@/recoil";
import { useRecoilValue } from "recoil";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const Workbench = dynamic(() => import("../components/workbench/Workbench"), { ssr: false });

export default function WorkbenchPage() {
  const [workspace, setWorkspace] = useState<any>(null);
  const [wsLoading, setWsLoading] = useState(true);
  const user = useRecoilValue(userStore) as { email: string } ;
  const router = useRouter();
  const { workspaceId } = router.query;

  useEffect(() => {
    if (!workspaceId) return;
    setWsLoading(true);
    workspaceApi.getWorkspaceByID(workspaceId as string)
      .then(ws => setWorkspace(ws))
      .finally(() => setWsLoading(false));
  }, [workspaceId]);

  if (wsLoading) {
    return <div className="flex items-center justify-center min-h-screen text-gray-500">Loading workspace...</div>;
  }
  if (!workspace) {
     return <div className="flex items-center justify-center min-h-screen text-red-500">Workspace not found.</div>;
  }
  return <Workbench workspace={workspace} />;
}
