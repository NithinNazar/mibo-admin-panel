import { NavLink } from "react-router-dom";
import type { NavItem } from "./types";

interface SidebarItemProps {
  item: NavItem;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ item }) => {
  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        [
          "block px-3 py-2 rounded-xl text-sm font-medium transition-colors",
          "text-slate-300 hover:text-white hover:bg-white/10",
          isActive ? "bg-white/10 text-white" : "",
        ].join(" ")
      }
    >
      {item.label}
    </NavLink>
  );
};

export default SidebarItem;
