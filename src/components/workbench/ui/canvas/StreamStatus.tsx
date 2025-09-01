import { FC } from 'react';

interface StreamStatusProps {
  streamLoading: boolean;
  error: string | null;
}

const StreamStatus: FC<StreamStatusProps> = ({
  streamLoading,
  error
}) => {
  if (!streamLoading && !error) return null;

  return (
    <>
      {streamLoading && (
        <div className="absolute top-6 right-6 z-30 px-4 py-2 bg-white/90 rounded shadow text-indigo-700 font-semibold">
          Starting stream...
        </div>
      )}
      {error && (
        <div className="absolute top-6 right-6 z-30 px-4 py-2 bg-red-100 rounded shadow text-red-700 font-semibold">
          {error}
        </div>
      )}
    </>
  );
};

export default StreamStatus;
