import { Link, useLocation } from "react-router-dom";
import type { ComponentType } from "react";

interface SidebarIconProps {
  to: string;
  id?: string;
  icon: ComponentType<any>;
  disabled?: boolean;
}

export default function SidebarIcon({ to, icon: Icon, id, disabled }: SidebarIconProps) {
  const { pathname } = useLocation();

  return (
    <>
      
      {disabled ? (
        <div
          className={`p-2 h-15 text-gray-400`}
          >
          <Icon className="size-10 inline-block" />
          </div>
      ) : (
        <Link
          to={to}
          id={id}
          className={`sidebarIcon p-2 h-15 ${
            pathname === to ? "md:pl-0 md:border-l-6 md:border-l-[#43a047] md:text-[#43a047]" : ""
          }`}
          >
          <Icon className="size-10 inline-block" />
        </Link>
      )}
    </>
  );
}
