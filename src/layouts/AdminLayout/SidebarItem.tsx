import { NavLink } from "react-router-dom";
import type { NavItem } from "./types";

interface SidebarItemProps {
  item: NavItem;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ item }) => {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        [
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
          "text-slate-300 hover:text-white hover:bg-white/10",
          isActive
            ? "bg-miboTeal/20 text-miboTeal border-l-2 border-miboTeal"
            : "",
        ].join(" ")
      }
    >
      {Icon && <Icon size={18} />}
      <span>{item.label}</span>
    </NavLink>
  );
};

export default SidebarItem;
