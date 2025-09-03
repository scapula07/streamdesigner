import React, { useState, useEffect } from "react";
import { MdInfoOutline, MdRefresh, MdGridView } from "react-icons/md";
import { updatePrompt } from "@/lib/api";

type ControlNet = {
  model_id: string;
  conditioning_scale: number;
  preprocessor: string;
  enabled: boolean;
  control_guidance_start: number;
  control_guidance_end: number;
  preprocessor_params: {
    high_threshold?: number;
    low_threshold?: number;
    [key: string]: any;
  };
};

type PromptParams = {
  model_id: "stabilityai/sd-turbo" | "varb15/PerfectPhotonV2.1";
  prompt: string;
  negative_prompt: string;
  guidance_scale: number;
  num_inference_steps: number;
  width: number;
  height: number;
  use_lcm_lora: boolean;
  t_index_list: number[];
  controlnets: ControlNet[];
};

export default function Settings({ workspaceId, onUpdateSettings }: { 
  workspaceId?: string;
  onUpdateSettings?: (params: PromptParams) => void;
}) {
  const [params, setParams] = useState<PromptParams>({
    model_id: "stabilityai/sd-turbo",
    prompt: "",
    negative_prompt: "",
    guidance_scale: 7.5,
    num_inference_steps: 20,
    width: 512,
    height: 512,
    use_lcm_lora: true,
    t_index_list: [0],
    controlnets: [
      {
        model_id: "thibaud/controlnet-sd21-openpose-diffusers",
        conditioning_scale: 0.711,
        preprocessor: "pose_tensorrt",
        enabled: true,
        control_guidance_start: 0,
        control_guidance_end: 1,
        preprocessor_params: {}
      },
      {
        model_id: "thibaud/controlnet-sd21-hed-diffusers",
        conditioning_scale: 0.2,
        preprocessor: "soft_edge",
        enabled: true,
        control_guidance_start: 0,
        control_guidance_end: 1,
        preprocessor_params: {}
      },
      {
        model_id: "thibaud/controlnet-sd21-canny-diffusers",
        conditioning_scale: 0.2,
        preprocessor: "canny",
        enabled: true,
        control_guidance_start: 0,
        control_guidance_end: 1,
        preprocessor_params: {
          high_threshold: 200,
          low_threshold: 100
        }
      },
      {
        model_id: "thibaud/controlnet-sd21-depth-diffusers",
        conditioning_scale: 0.5,
        preprocessor: "depth_tensorrt",
        enabled: true,
        control_guidance_start: 0,
        control_guidance_end: 1,
        preprocessor_params: {}
      },
      {
        model_id: "thibaud/controlnet-sd21-color-diffusers",
        conditioning_scale: 0.2,
        preprocessor: "passthrough",
        enabled: true,
        control_guidance_start: 0,
        control_guidance_end: 1,
        preprocessor_params: {}
      }
    ]
  });

  const updateControlNet = (index: number, value: number) => {
    const newParams = { ...params };
    newParams.controlnets[index].conditioning_scale = value;
    setParams(newParams);
    onUpdateSettings?.(newParams);
  };

  const resetControls = () => {
    const newParams = { ...params };
    newParams.controlnets = newParams.controlnets.map(net => ({
      ...net,
      conditioning_scale: 0
    }));
    setParams(newParams);
    onUpdateSettings?.(newParams);
  };

  // Update t_index_list when num_inference_steps changes
  useEffect(() => {
    const newParams = { ...params };
    // Ensure t_index_list values are valid for the current num_inference_steps
    newParams.t_index_list = [0]; // Reset to default value
    setParams(newParams);
    onUpdateSettings?.(newParams);
  }, [params.num_inference_steps]);

  return (
    <aside className="w-80 bg-white text-gray-800 rounded-xl flex flex-col px-6 py-6 gap-6 max-h-[90vh] overflow-y-auto">
      <div>
        <h2 className="text-lg font-semibold mb-2 text-gray-900">Model Settings</h2>
        <div className="text-sm text-gray-500">Adjust the parameters to control the generation.</div>
      </div>
      
      <hr className="border-gray-200" />
      
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold">Control Nets</span>
          <MdInfoOutline className="text-gray-400" title="Control the influence of different aspects on the generation" />
        </div>
        <div className="flex flex-col gap-4">
          {params.controlnets.map((control, index) => (
            <div key={index} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span>{control.preprocessor.charAt(0).toUpperCase() + control.preprocessor.slice(1)}</span>
                <MdInfoOutline className="text-gray-400 text-xs" />
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={control.conditioning_scale}
                  onChange={(e) => updateControlNet(index, Number(e.target.value))}
                  className="ml-auto w-12 bg-gray-100 border border-gray-300 rounded px-2 py-1 text-right text-gray-800 text-xs"
                />
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={control.conditioning_scale}
                onChange={(e) => updateControlNet(index, Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
          ))}
          <button 
            onClick={resetControls}
            className="self-end mt-2 p-2 rounded bg-gray-100 hover:bg-gray-200 transition text-gray-700"
            title="Reset all controls"
          >
            <MdRefresh />
          </button>
        </div>
      </div>

      <hr className="border-gray-200" />

      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold">Generation Settings</span>
          <MdInfoOutline className="text-gray-400" title="Control how the AI generates and processes images" />
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <label className="text-sm text-gray-700">Guidance Scale (CFG)</label>
                <MdInfoOutline 
                  className="text-gray-400 text-xs" 
                  title="Controls how closely the generation follows your prompt. Higher values = stronger adherence to prompt, but potentially less natural results"
                />
              </div>
              <span className="text-xs text-gray-500">{params.guidance_scale}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={1}
                max={20}
                step={0.1}
                value={params.guidance_scale}
                onChange={(e) => setParams({ ...params, guidance_scale: Number(e.target.value) })}
                className="flex-1 accent-indigo-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <label className="text-sm text-gray-700">Inference Steps</label>
                <MdInfoOutline 
                  className="text-gray-400 text-xs" 
                  title="Number of denoising steps. More steps = higher quality but slower generation. For real-time streaming, lower values (20-30) are recommended"
                />
              </div>
              <span className="text-xs text-gray-500">{params.num_inference_steps}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={1}
                max={50}
                value={params.num_inference_steps}
                onChange={(e) => setParams({ ...params, num_inference_steps: Number(e.target.value) })}
                className="flex-1 accent-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <label className="text-sm text-gray-700">Width</label>
                <MdInfoOutline 
                  className="text-gray-400 text-xs" 
                  title="Output image width. Must be a multiple of 64. Larger sizes need more processing power"
                />
              </div>
              <input
                type="number"
                min={64}
                max={1024}
                step={64}
                value={params.width}
                onChange={(e) => {
                  const value = Math.round(Number(e.target.value) / 64) * 64;
                  setParams({ ...params, width: value });
                }}
                className="w-full bg-gray-100 border border-gray-300 rounded px-2 py-1 text-gray-800 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <label className="text-sm text-gray-700">Height</label>
                <MdInfoOutline 
                  className="text-gray-400 text-xs" 
                  title="Output image height. Must be a multiple of 64. Larger sizes need more processing power"
                />
              </div>
              <input
                type="number"
                min={64}
                max={1024}
                step={64}
                value={params.height}
                onChange={(e) => {
                  const value = Math.round(Number(e.target.value) / 64) * 64;
                  setParams({ ...params, height: value });
                }}
                className="w-full bg-gray-100 border border-gray-300 rounded px-2 py-1 text-gray-800 text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700">LCM LoRA</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{params.use_lcm_lora ? 'Enabled' : 'Disabled'}</span>
                <div className="relative inline-block w-8 h-4 rounded-full cursor-pointer">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={params.use_lcm_lora}
                    onChange={(e) => setParams({ ...params, use_lcm_lora: e.target.checked })}
                  />
                  <span className="absolute inset-0 rounded-full bg-gray-300 transition peer-checked:bg-indigo-500"></span>
                  <span className="absolute inset-0 w-3 h-3 m-0.5 rounded-full bg-white transition-transform transform peer-checked:translate-x-4"></span>
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Enables faster inference with Latent Consistency Models
            </div>
          </div>
        </div>
      </div>

      <hr className="border-gray-200" />

      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold">Advanced Parameters</span>
          <MdInfoOutline className="text-gray-400" title="Additional generation settings" />
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700">Negative Prompt</label>
            <textarea
              value={params.negative_prompt}
              onChange={(e) => setParams({ ...params, negative_prompt: e.target.value })}
              placeholder="Enter negative prompt..."
              className="w-full bg-gray-100 border border-gray-300 rounded px-2 py-1 text-gray-800 text-sm h-20 resize-none"
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
