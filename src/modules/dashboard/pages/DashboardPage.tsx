import { Users, Stethoscope, Calendar, IndianRupee } from "lucide-react";
import StatCard from "../../../components/charts/StatCard";
import DonutChart from "../../../components/charts/DonutChart";
import AreaChartComponent from "../../../components/charts/AreaChartComponent";
import TopDoctorsCard from "../../../components/charts/TopDoctorsCard";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";

const DashboardPage: React.FC = () => {
  // Mock data - will be replaced with real API data
  const stats = [
    {
      title: "Total Patients",
      value: "11,238",
      icon: Users,
      trend: { value: 45, direction: "up" as const, period: "this month" },
      iconColor: "text-blue-400",
    },
    {
      title: "Active Doctors",
      value: "238",
      icon: Stethoscope,
      trend: { value: 21, direction: "up" as const, period: "this month" },
      iconColor: "text-miboTeal",
    },
    {
      title: "Follow Ups Booked",
      value: "182",
      icon: Calendar,
      trend: { value: 12, direction: "up" as const, period: "this month" },
      iconColor: "text-yellow-400",
    },
    {
      title: "Total Revenue",
      value: "₹16,43,205",
      icon: IndianRupee,
      trend: { value: 32, direction: "up" as const, period: "this month" },
      iconColor: "text-green-400",
    },
  ];

  const leadsData = [
    { label: "Website", value: 400, color: "#3b82f6" },
    { label: "Phone", value: 300, color: "#2CA5A9" },
    { label: "Direct", value: 300, color: "#f59e0b" },
    { label: "Referrals", value: 200, color: "#8b5cf6" },
  ];

  const revenueData = [
    { date: "Jan", value: 12000 },
    { date: "Feb", value: 19000 },
    { date: "Mar", value: 15000 },
    { date: "Apr", value: 25000 },
    { date: "May", value: 22000 },
    { date: "Jun", value: 30000 },
  ];

  const topDoctors = [
    {
      id: "1",
      name: "Dr. Elvia Thomas",
      specialty: "Adult Therapist",
      avatar: "https://i.pravatar.cc/150?img=1",
      patientCount: 368,
    },
    {
      id: "2",
      name: "Dr. Linnie Nelson",
      specialty: "Child Therapist",
      avatar: "https://i.pravatar.cc/150?img=2",
      patientCount: 325,
    },
    {
      id: "3",
      name: "Dr. Ranjit Singh",
      specialty: "Psychiatrist",
      avatar: "https://i.pravatar.cc/150?img=3",
      patientCount: 299,
    },
    {
      id: "4",
      name: "Dr. Nyla Gupta",
      specialty: "Couple Therapist",
      avatar: "https://i.pravatar.cc/150?img=4",
      patientCount: 251,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
            <p className="text-sm text-slate-400 mt-1">
              Frequently used actions for quick access
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="primary" size="sm">
              Book Appointment
            </Button>
            <Button variant="secondary" size="sm">
              Track Follow-up
            </Button>
          </div>
        </div>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DonutChart data={leadsData} title="Leads by Source" />
        <TopDoctorsCard doctors={topDoctors} />
      </div>

      {/* Revenue Analytics */}
      <AreaChartComponent
        data={revenueData}
        title="Revenue Analytics"
        color="#2CA5A9"
      />

      {/* Recent Activity */}
      <Card>
        <h3 className="text-lg font-semibold text-white mb-4">
          Recent Appointments
        </h3>
        <div className="space-y-3">
          {[1, 2, 3].map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-miboTeal to-miboDeepBlue flex items-center justify-center text-sm font-semibold">
                  P{index + 1}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    Patient {index + 1}
                  </p>
                  <p className="text-xs text-slate-400">
                    Appointment with Dr. Smith
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-300">Today, 2:30 PM</p>
                <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                  Confirmed
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;
