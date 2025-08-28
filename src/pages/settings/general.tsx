import SettingsLayout from "@/components/settings/SettingsLayout";
import SettingsGeneral from "@/components/settings/SettingsGeneral";
import { useRouter } from "next/router";
import { FiArrowLeft } from "react-icons/fi";
export default function GeneralSettingsPage() {
   const router = useRouter();
  return (
    <SettingsLayout>
      <button
        className="flex items-center gap-2 text-gray-700 hover:text-black mb-6 text-base font-medium"
        onClick={() => router.push('/dashboard')}
        type="button"
      >
        <FiArrowLeft className="text-xl" />
        Back to Dashboard
      </button>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">General</h1>
      <SettingsGeneral />
    </SettingsLayout>
  );
}
