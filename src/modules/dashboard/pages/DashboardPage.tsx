const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#1d2635] rounded-2xl border border-white/5 p-4">
          <div className="text-xs uppercase text-slate-400">Today</div>
          <div className="text-2xl font-semibold text-white mt-1">
            0 appointments
          </div>
        </div>
        <div className="bg-[#1d2635] rounded-2xl border border-white/5 p-4">
          <div className="text-xs uppercase text-slate-400">Online</div>
          <div className="text-2xl font-semibold text-white mt-1">0</div>
        </div>
        <div className="bg-[#1d2635] rounded-2xl border border-white/5 p-4">
          <div className="text-xs uppercase text-slate-400">Follow-ups</div>
          <div className="text-2xl font-semibold text-white mt-1">0</div>
        </div>
        <div className="bg-[#1d2635] rounded-2xl border border-white/5 p-4">
          <div className="text-xs uppercase text-slate-400">Revenue</div>
          <div className="text-2xl font-semibold text-white mt-1">₹0</div>
        </div>
      </div>

      <div className="bg-[#1d2635] rounded-2xl border border-white/5 p-4 min-h-[240px]">
        <div className="text-sm font-semibold text-white mb-2">
          Booking trends
        </div>
        <p className="text-xs text-slate-400">
          Charts will be added here later.
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;
