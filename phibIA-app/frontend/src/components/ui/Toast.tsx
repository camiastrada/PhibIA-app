import { useEffect } from "react";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === "success" ? "bg-[#43A047]" : "bg-red-600";

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 ${bgColor} text-white px-5 py-3 rounded-xl shadow-lg text-sm md:text-base font-medium animate-fade-in-up`}
    >
      {message}
    </div>
  );
}
