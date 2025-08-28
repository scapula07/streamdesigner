import { useState } from 'react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
}

export default function Notification({ message, type }: NotificationProps) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div
      className={`fixed top-4 right-4 px-4 py-2 rounded shadow-lg text-white ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
      }`}
    >
      <span>{message}</span>
      <button
        className="ml-4 text-sm underline"
        onClick={() => setVisible(false)}
      >
        Dismiss
      </button>
    </div>
  );
}
