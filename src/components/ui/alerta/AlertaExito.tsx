import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AlertProps {
  variant: "success" | "error" | "warning";
  title: string;
  message: string;
  showLink?: boolean;
  duration?: number; // Duración en milisegundos
  onClose?: () => void; // Callback al cerrar la alerta
}

const Alert = ({
  variant,
  title,
  message,
  showLink,
  duration = 5000,
  onClose,
}: AlertProps) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev > 0 ? prev - 1 : 0));
    }, duration / 200);

    if (progress === 0 && onClose) {
      onClose();
    }

    return () => clearInterval(interval);
  }, [duration, progress, onClose]);

  const colors = {
    success: "bg-green-100 text-green-800 border-green-300",
    error: "bg-red-100 text-red-800 border-red-300",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-300",
  };

  const progressBarColors = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-500",
  };

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg border max-w-sm w-full",
        colors[variant]
      )}
    >
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-semibold">{title}</h4>
          <p>{message}</p>
          {showLink && (
            <a href="#" className="text-blue-500 underline mt-2 inline-block">
              Más información
            </a>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-xl font-bold leading-none ml-4 text-gray-600 hover:text-gray-800"
        >
          &times;
        </button>
      </div>
      <div className="relative h-1 mt-2 bg-gray-200 rounded-full">
        <div
          className={cn(
            "absolute top-0 left-0 h-full rounded-full transition-all duration-100",
            progressBarColors[variant]
          )}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default Alert;
