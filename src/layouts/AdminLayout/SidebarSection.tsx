import SidebarItem from "./SidebarItem";
import type { NavSection } from "./types";

interface SidebarSectionProps {
  section: NavSection;
}

const SidebarSection: React.FC<SidebarSectionProps> = ({ section }) => {
  return (
    <div className="space-y-1">
      <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {section.title}
      </div>
      <div className="space-y-1">
        {section.items.map((item) => (
          <SidebarItem key={item.path} item={item} />
        ))}
      </div>
    </div>
  );
};

export default SidebarSection;
