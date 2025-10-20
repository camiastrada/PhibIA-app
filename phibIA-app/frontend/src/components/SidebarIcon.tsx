import { Link, useLocation } from "react-router-dom";
import type { ComponentType } from "react";

interface SidebarIconProps {
  to: string;
  id?: string;
  icon: ComponentType<any>;
}

export default function SidebarIcon({ to, icon: Icon, id }: SidebarIconProps) {
  const { pathname } = useLocation();

  return (
    <Link
      to={to}
      id={id}
      className={`sidebarIcon p-2 h-15 ${
        pathname === to ? "md:actived-nav" : ""
      }`}
    >
      <Icon className="size-10 inline-block" />
    </Link>
  );
}
