import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Table from "../../../components/ui/Table";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import {
  Calendar,
  Download,
  Printer,
  FileText,
  Search,
  Plus,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import appointmentService from "../../../services/appointmentService";
import centreService from "../../../services/centreService";
import type { Appointment, Centre } from "../../../types";
import {
  exportToCSV,
  exportToPDF,
  printTable,
} from "../../../utils/exportHelpers";

const AllAppointmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [centres, setCentres] = useState<Centre[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<
    Appointment[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [centreFilter, setCentreFilter] = useState<string>("ALL");
  const [timeFilter, setTimeFilter] = useState<string>("ALL");
  const [dateFilter, setDateFilter] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [
    appointments,
    searchTerm,
    statusFilter,
    centreFilter,
    timeFilter,
    dateFilter,
  ]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appointmentsData, centresData] = await Promise.all([
        appointmentService.getAllAppointments(),
        centreService.getCentres(),
      ]);
      setAppointments(appointmentsData);
      setCentres(centresData);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...appointments];

    // Search filter (patient name, phone, clinician name)
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (apt) =>
          apt.patientName.toLowerCase().includes(search) ||
          apt.patientPhone.includes(search) ||
          apt.clinicianName.toLowerCase().includes(search),
      );
    }

    // Status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((apt) => apt.status === statusFilter);
    }

    // Centre filter
    if (centreFilter !== "ALL") {
      filtered = filtered.filter((apt) => apt.centreId === centreFilter);
    }

    // Time filter (current/past/upcoming)
    if (timeFilter !== "ALL") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter((apt) => {
        const aptDate = new Date(apt.scheduledStartAt);
        const aptDay = new Date(
          aptDate.getFullYear(),
          aptDate.getMonth(),
          aptDate.getDate(),
        );

        if (timeFilter === "CURRENT") {
          // Today's appointments
          return aptDay.getTime() === today.getTime();
        } else if (timeFilter === "PAST") {
          // Past appointments (before today)
          return aptDay < today;
        } else if (timeFilter === "UPCOMING") {
          // Future appointments (after today)
          return aptDay > today;
        }
        return true;
      });
    }

    // Date filter (specific date)
    if (dateFilter) {
      filtered = filtered.filter((apt) => {
        const aptDate = new Date(apt.scheduledStartAt)
          .toISOString()
          .split("T")[0];
        return aptDate === dateFilter;
      });
    }

    setFilteredAppointments(filtered);
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    const reason = prompt("Please enter cancellation reason (optional):");

    if (reason === null) {
      // User clicked cancel on prompt
      return;
    }

    if (
      !confirm(
        "Are you sure you want to cancel this appointment? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      await appointmentService.cancelAppointment(
        appointmentId,
        reason || "Cancelled by admin",
      );
      toast.success("Appointment cancelled successfully");
      fetchData();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to cancel appointment",
      );
    }
  };

  const handleExportCSV = () => {
    const csvData = filteredAppointments.map((apt) => ({
      "Appointment ID": apt.id,
      "Patient Name": apt.patientName,
      "Patient Phone": apt.patientPhone,
      Clinician: apt.clinicianName,
      Centre: apt.centreName,
      Date: new Date(apt.scheduledStartAt).toLocaleDateString(),
      Time: new Date(apt.scheduledStartAt).toLocaleTimeString(),
      Duration: `${apt.durationMinutes} min`,
      Type: apt.appointmentType,
      Status: apt.status,
      Source: apt.source,
      "Booked By": apt.bookedByUserName,
    }));

    exportToCSV(csvData, "appointments");
    toast.success("Exported to CSV");
  };

  const handleExportPDF = () => {
    const headers = [
      "ID",
      "Patient",
      "Phone",
      "Clinician",
      "Centre",
      "Date",
      "Time",
      "Status",
    ];

    const rows = filteredAppointments.map((apt) => [
      apt.id,
      apt.patientName,
      apt.patientPhone,
      apt.clinicianName,
      apt.centreName,
      new Date(apt.scheduledStartAt).toLocaleDateString(),
      new Date(apt.scheduledStartAt).toLocaleTimeString(),
      apt.status,
    ]);

    exportToPDF(headers, rows, "Appointments Report");
    toast.success("Exported to PDF");
  };

  const handlePrint = () => {
    const headers = [
      "ID",
      "Patient",
      "Phone",
      "Clinician",
      "Centre",
      "Date",
      "Time",
      "Status",
    ];

    const rows = filteredAppointments.map((apt) => [
      apt.id,
      apt.patientName,
      apt.patientPhone,
      apt.clinicianName,
      apt.centreName,
      new Date(apt.scheduledStartAt).toLocaleDateString(),
      new Date(apt.scheduledStartAt).toLocaleTimeString(),
      apt.status,
    ]);

    printTable("Appointments", headers, rows);
    toast.success("Opening print dialog");
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      BOOKED: "bg-blue-500/20 text-blue-400",
      CONFIRMED: "bg-green-500/20 text-green-400",
      COMPLETED: "bg-gray-500/20 text-gray-400",
      CANCELLED: "bg-red-500/20 text-red-400",
      NO_SHOW: "bg-orange-500/20 text-orange-400",
      RESCHEDULED: "bg-purple-500/20 text-purple-400",
    };
    return colors[status] || "bg-slate-500/20 text-slate-400";
  };

  const columns = [
    {
      key: "id",
      header: "ID",
      render: (apt: Appointment) => (
        <span className="text-slate-300 font-mono text-sm">#{apt.id}</span>
      ),
    },
    {
      key: "patient",
      header: "Patient",
      render: (apt: Appointment) => (
        <div>
          <div className="font-medium text-white">
            {apt.patientName || "Unknown"}
          </div>
          <div className="text-sm text-slate-400">
            {apt.patientPhone || "N/A"}
          </div>
        </div>
      ),
    },
    {
      key: "clinician",
      header: "Clinician",
      render: (apt: Appointment) => (
        <span className="text-slate-300">{apt.clinicianName || "Unknown"}</span>
      ),
    },
    {
      key: "centre",
      header: "Centre",
      render: (apt: Appointment) => (
        <span className="text-slate-300">{apt.centreName || "Unknown"}</span>
      ),
    },
    {
      key: "datetime",
      header: "Date & Time",
      render: (apt: Appointment) => (
        <div>
          <div className="text-white">
            {apt.scheduledStartAt
              ? new Date(apt.scheduledStartAt).toLocaleDateString()
              : "N/A"}
          </div>
          <div className="text-sm text-slate-400">
            {apt.scheduledStartAt
              ? new Date(apt.scheduledStartAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "N/A"}
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (apt: Appointment) => (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-miboTeal/20 text-miboTeal">
          {apt.appointmentType ? apt.appointmentType.replace("_", " ") : "N/A"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (apt: Appointment) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
            apt.status,
          )}`}
        >
          {apt.status}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (apt: Appointment) => (
        <div className="flex gap-2">
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleCancelAppointment(apt.id)}
            disabled={apt.status === "CANCELLED" || apt.status === "COMPLETED"}
            title={
              apt.status === "CANCELLED"
                ? "Already cancelled"
                : apt.status === "COMPLETED"
                  ? "Cannot cancel completed appointment"
                  : "Cancel appointment"
            }
          >
            <X size={16} />
            Cancel
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">All Appointments</h1>
          <p className="text-slate-400 mt-1">
            View and manage all bookings across centres
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate("/book-appointment")}>
          <Plus size={20} />
          Book New Appointment
        </Button>
      </div>

      {/* Filters and Export */}
      <Card>
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                  size={20}
                />
                <Input
                  type="text"
                  placeholder="Search by patient name, phone, or clinician..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select
              value={centreFilter}
              onChange={(e) => setCentreFilter(e.target.value)}
              options={[
                { value: "ALL", label: "All Centres" },
                ...centres.map((c) => ({ value: c.id, label: c.name })),
              ]}
            />

            <Select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              options={[
                { value: "ALL", label: "All Time" },
                { value: "CURRENT", label: "Today" },
                { value: "UPCOMING", label: "Upcoming" },
                { value: "PAST", label: "Past" },
              ]}
            />

            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "ALL", label: "All Statuses" },
                { value: "BOOKED", label: "Booked" },
                { value: "CONFIRMED", label: "Confirmed" },
                { value: "COMPLETED", label: "Completed" },
                { value: "CANCELLED", label: "Cancelled" },
                { value: "NO_SHOW", label: "No Show" },
                { value: "RESCHEDULED", label: "Rescheduled" },
              ]}
            />
          </div>

          {/* Specific Date Filter */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                placeholder="Filter by specific date"
              />
            </div>
            {dateFilter && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDateFilter("")}
              >
                Clear Date
              </Button>
            )}
          </div>

          {/* Export Buttons */}
          <div className="flex gap-3 pt-2 border-t border-white/10">
            <Button variant="secondary" size="sm" onClick={handleExportCSV}>
              <Download size={16} />
              Export CSV
            </Button>
            <Button variant="secondary" size="sm" onClick={handleExportPDF}>
              <FileText size={16} />
              Export PDF
            </Button>
            <Button variant="secondary" size="sm" onClick={handlePrint}>
              <Printer size={16} />
              Print
            </Button>
          </div>
        </div>
      </Card>

      {/* Appointments Table */}
      <Card>
        {loading ? (
          <div className="text-center py-8 text-slate-400">
            Loading appointments...
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Calendar size={48} className="mx-auto mb-4 opacity-50" />
            <p>No appointments found</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-slate-400">
              Showing {filteredAppointments.length} of {appointments.length}{" "}
              appointments
            </div>
            <Table
              columns={columns}
              data={filteredAppointments}
              keyExtractor={(apt) => apt.id.toString()}
            />
          </>
        )}
      </Card>
    </div>
  );
};

export default AllAppointmentsPage;
