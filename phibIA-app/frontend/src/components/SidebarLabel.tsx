import { Link } from "react-router-dom";

interface SidebarLabelProps {
  to: string;
  id?: string;
  label: string;
  isOpen: boolean;
}

export default function SidebarLabel({ to, id, label, isOpen }: SidebarLabelProps) {
  return (
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
  );
}
