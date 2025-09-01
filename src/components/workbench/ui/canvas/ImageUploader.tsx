import React, { useRef } from 'react';
import { MdCloudUpload } from 'react-icons/md';

type ImageUploaderProps = {
  onImageUpload: (file: File) => void;
  dragActive: boolean;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
};

export function ImageUploader({
  onImageUpload,
  dragActive,
  onDrop,
  onDragOver,
  onDragLeave
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0]);
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
      <div
        className={`bg-white px-8 py-8 rounded-2xl shadow-xl min-w-[320px] max-w-[360px] flex flex-col items-center transition-all duration-200 pointer-events-auto ${
          dragActive ? 'border-indigo-500 bg-indigo-50/80 opacity-95' : ''
        }`}
        onClick={() => inputRef.current?.click()}
        style={{ cursor: 'pointer' }}
      >
        <MdCloudUpload size={40} className="mb-3 text-slate-300" />
        <div className="font-light text-slate-800 text-lg text-center">
          Click to upload <span className="font-normal text-slate-400">or drag</span> your sketch here
        </div>
        <div className="text-xs text-slate-400 mt-1 mb-4 text-center">
          PNG, JPEG, GIF, MP4, WEBM - Max. 4MB
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
