import { Link } from "react-router-dom";

interface SidebarLabelProps {
  to: string;
  id?: string;
  label: string;
  isOpen: boolean;
  disabled?: boolean;
}

export default function SidebarLabel({ to, id, label, isOpen, disabled }: SidebarLabelProps) {
  return (
    <>    
      {disabled ? (
        <div
          className="p-2 flex flex-row items-center h-15 whitespace-nowrap text-gray-400"
        >
          <label
            className={`text-lg ml-3 transition-all duration-300 ${
              isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            {label}
          </label>
        </div>
      ) : (
        <Link
          to={to}
          id={id}
          className="sidebarLabel p-2 flex flex-row items-center h-15 whitespace-nowrap"
        >
          <label
            className={`text-lg ml-3 cursor-pointer transition-all duration-300 ${
              isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            {label}
          </label>
        </Link>
      )}
    </>
  );
}
