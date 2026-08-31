import { Link, useLocation } from "react-router-dom";
import type { ComponentType } from "react";

interface SidebarIconProps {
  to: string;
  id?: string;
  icon: ComponentType<any>;
  disabled?: boolean;
  showBadge?: boolean;
}

export default function SidebarIcon({ to, icon: Icon, id, disabled, showBadge }: SidebarIconProps) {
  const { pathname } = useLocation();

  const badge = showBadge && (
    <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full size-4 flex items-center justify-center border border-white">
      !
    </span>
  );

  return (
    <>

      {disabled ? (
        <div
          className={`relative p-2 h-12 text-gray-400`}
          >
          <Icon className="size-8 inline-block" />
          {badge}
          </div>
      ) : (
        <Link
          to={to}
          id={id}
          className={`sidebarIcon relative p-2 h-12 group inline-block${
            pathname === to ? "md:pl-0 md:border-l-6 md:border-l-[#43a047] md:text-[#43a047]" : ""
          }`}
          >
          <Icon className="size-8 inline-block" />
          {badge}
        </Link>
      )}
    </>
  );
}
