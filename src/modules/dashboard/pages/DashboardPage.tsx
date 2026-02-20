import React, { useState, useEffect } from "react";
import { Users, Stethoscope, Calendar, IndianRupee } from "lucide-react";
import StatCard from "../../../components/charts/StatCard";
import DonutChart from "../../../components/charts/DonutChart";
import AreaChartComponent from "../../../components/charts/AreaChartComponent";
import TopDoctorsCard from "../../../components/charts/TopDoctorsCard";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import toast from "react-hot-toast";
import analyticsService from "../../../services/analyticsService";
import appointmentService from "../../../services/appointmentService";
import type { DashboardMetrics } from "../../../types";

const DashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [topDoctorsData, setTopDoctorsData] = useState<any[]>([]);
  const [recentAppointments, setRecentAppointments] = useState<any[]>([]);
  const [revenueChartData, setRevenueChartData] = useState<any[]>([]);
  const [leadsChartData, setLeadsChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [
        metricsData,
        doctorsData,
        revenueDataRes,
        leadsDataRes,
        appointmentsData,
      ] = await Promise.all([
        analyticsService.getDashboardMetrics().catch(() => null),
        analyticsService.getTopDoctors().catch(() => []),
        analyticsService.getRevenueData("month").catch(() => []),
        analyticsService.getLeadsBySource().catch(() => []),
        appointmentService.getAllAppointments().catch(() => []),
      ]);

      setMetrics(metricsData);
      setTopDoctorsData(doctorsData || []);
      setRevenueChartData(revenueDataRes || []);
      setLeadsChartData(leadsDataRes || []);

      // Get recent 5 appointments
      if (appointmentsData && appointmentsData.length > 0) {
        const sorted = [...appointmentsData]
          .sort(
            (a, b) =>
              new Date(b.scheduled_start_at).getTime() -
              new Date(a.scheduled_start_at).getTime(),
          )
          .slice(0, 5);
        setRecentAppointments(sorted);
      } else {
        setRecentAppointments([]);
      }
    } catch (error: any) {
      console.error("Dashboard data fetch error:", error);
      toast.error("Failed to load dashboard data");
      // Set empty data
      setMetrics(null);
      setTopDoctorsData([]);
      setRevenueChartData([]);
      setLeadsChartData([]);
      setRecentAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const stats = metrics
    ? [
        {
          title: "Total Patients",
          value:
            metrics.totalPatients > 0
              ? metrics.totalPatients.toLocaleString()
              : "-",
          icon: Users,
          trend:
            metrics.totalPatients > 0
              ? {
                  value: metrics.totalPatientsChange,
                  direction: (metrics.totalPatientsChange >= 0
                    ? "up"
                    : "down") as "up" | "down",
                  period: "this month",
                }
              : undefined,
          iconColor: "text-blue-400",
        },
        {
          title: "Active Doctors",
          value:
            metrics.activeDoctors > 0 ? metrics.activeDoctors.toString() : "-",
          icon: Stethoscope,
          trend:
            metrics.activeDoctors > 0
              ? {
                  value: metrics.activeDoctorsChange,
                  direction: (metrics.activeDoctorsChange >= 0
                    ? "up"
                    : "down") as "up" | "down",
                  period: "this month",
                }
              : undefined,
          iconColor: "text-miboTeal",
        },
        {
          title: "Follow Ups Booked",
          value:
            metrics.followUpsBooked > 0
              ? metrics.followUpsBooked.toString()
              : "-",
          icon: Calendar,
          trend:
            metrics.followUpsBooked > 0
              ? {
                  value: metrics.followUpsBookedChange,
                  direction: (metrics.followUpsBookedChange >= 0
                    ? "up"
                    : "down") as "up" | "down",
                  period: "this month",
                }
              : undefined,
          iconColor: "text-yellow-400",
        },
        {
          title: "Total Revenue",
          value:
            metrics.totalRevenue > 0
              ? `₹${metrics.totalRevenue.toLocaleString()}`
              : "-",
          icon: IndianRupee,
          trend:
            metrics.totalRevenue > 0
              ? {
                  value: metrics.totalRevenueChange,
                  direction: (metrics.totalRevenueChange >= 0
                    ? "up"
                    : "down") as "up" | "down",
                  period: "this month",
                }
              : undefined,
          iconColor: "text-green-400",
        },
      ]
    : [
        {
          title: "Total Patients",
          value: "-",
          icon: Users,
          iconColor: "text-blue-400",
        },
        {
          title: "Active Doctors",
          value: "-",
          icon: Stethoscope,
          iconColor: "text-miboTeal",
        },
        {
          title: "Follow Ups Booked",
          value: "-",
          icon: Calendar,
          iconColor: "text-yellow-400",
        },
        {
          title: "Total Revenue",
          value: "-",
          icon: IndianRupee,
          iconColor: "text-green-400",
        },
      ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat: any, index: number) => (
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
        {leadsChartData.length > 0 ? (
          <DonutChart data={leadsChartData} title="Leads by Source" />
        ) : (
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4">
              Leads by Source
            </h3>
            <div className="flex items-center justify-center h-64 text-slate-400">
              No data available
            </div>
          </Card>
        )}

        {topDoctorsData.length > 0 ? (
          <TopDoctorsCard doctors={topDoctorsData} />
        ) : (
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4">
              Top Doctors
            </h3>
            <div className="flex items-center justify-center h-64 text-slate-400">
              No doctors data available
            </div>
          </Card>
        )}
      </div>

      {/* Revenue Analytics */}
      {revenueChartData.length > 0 ? (
        <AreaChartComponent
          data={revenueChartData}
          title="Revenue Analytics"
          color="#2CA5A9"
        />
      ) : (
        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">
            Revenue Analytics
          </h3>
          <div className="flex items-center justify-center h-64 text-slate-400">
            No revenue data available
          </div>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <h3 className="text-lg font-semibold text-white mb-4">
          Recent Appointments
        </h3>
        {recentAppointments.length > 0 ? (
          <div className="space-y-3">
            {recentAppointments.map((apt) => (
              <div
                key={apt.id}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-miboTeal to-miboDeepBlue flex items-center justify-center text-sm font-semibold">
                    {apt.patientName
                      ? apt.patientName.charAt(0).toUpperCase()
                      : "?"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {apt.patientName || "Unknown Patient"}
                    </p>
                    <p className="text-xs text-slate-400">
                      Appointment with{" "}
                      {apt.clinicianName || "Unknown Clinician"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-300">
                    {new Date(apt.scheduledStartAt).toLocaleDateString()} at{" "}
                    {new Date(apt.scheduledStartAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <span
                    className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                      apt.status === "CONFIRMED"
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : apt.status === "BOOKED"
                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                    }`}
                  >
                    {apt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-slate-400">
            No recent appointments
          </div>
        )}
      </Card>
    </div>
  );
};

export default DashboardPage;
