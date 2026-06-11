import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Table from "../../../components/ui/Table";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import DateRangeCalendar from "../../clinician/components/DateRangeCalendar";
import {
  Calendar,
  Download,
  Printer,
  FileText,
  Search,
  Plus,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import toast from "react-hot-toast";
import appointmentService from "../../../services/appointmentService";
import centreService from "../../../services/centreService";
import clinicianService from "../../../services/clinicianService";
import type { Appointment, Centre, Clinician } from "../../../types";
import {
  exportToCSV,
  exportToPDF,
  printTable,
} from "../../../utils/exportHelpers";
import { useAuth } from "../../../contexts/AuthContext";
import ClinicianDashboard from "../../../components/Clinician/ClinicianDashboard";

const AllAppointmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isClinician, user } = useAuth();
  const isFrontDesk = user?.role === "FRONT_DESK";
  const assignedCentreId = user?.assignedCentreId;

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [centres, setCentres] = useState<Centre[]>([]);
  const [clinicians, setClinicians] = useState<Clinician[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<
    Appointment[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Filters - Initialize centreFilter based on user role
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [centreFilter, setCentreFilter] = useState<string>(
    isFrontDesk && assignedCentreId ? assignedCentreId : "ALL",
  );
  const [clinicianFilter, setClinicianFilter] = useState<string>("ALL");
  const [timeFilter, setTimeFilter] = useState<string>("CURRENT"); // Default to today's appointments
  const [selectedStartDate, setSelectedStartDate] = useState<Date>(new Date());
  const [selectedEndDate, setSelectedEndDate] = useState<Date>(new Date());
  const [sortBy, setSortBy] = useState<"scheduled" | "booked" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Patient note modal state
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedNoteAppointment, setSelectedNoteAppointment] =
    useState<Appointment | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Auto-select assigned centre for front desk staff
    if (isFrontDesk && assignedCentreId && centreFilter !== assignedCentreId) {
      setCentreFilter(assignedCentreId);
    }
  }, [isFrontDesk, assignedCentreId]);

  useEffect(() => {
    // Reset clinician filter when centre filter changes
    // This ensures selected clinician is from the selected centre
    if (clinicianFilter !== "ALL") {
      const selectedClinician = clinicians.find(
        (c: any) => String(c.id) === String(clinicianFilter),
      );

      // If clinician is not active or not in selected centre, reset to ALL
      if (selectedClinician) {
        if (!selectedClinician.isActive) {
          setClinicianFilter("ALL");
        } else if (
          centreFilter !== "ALL" &&
          String(selectedClinician.primaryCentreId) !== String(centreFilter)
        ) {
          setClinicianFilter("ALL");
        }
      }
    }
  }, [centreFilter, clinicians, clinicianFilter]);

  useEffect(() => {
    applyFilters();
  }, [
    appointments,
    searchTerm,
    statusFilter,
    centreFilter,
    clinicianFilter,
    timeFilter,
    selectedStartDate,
    selectedEndDate,
    sortBy,
    sortOrder,
  ]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appointmentsData, centresData, cliniciansData] = await Promise.all(
        [
          appointmentService.getAllAppointments(),
          centreService.getCentres(),
          clinicianService.getClinicians(),
        ],
      );

      // Filter data for front desk staff based on their assigned centre
      if (isFrontDesk && assignedCentreId) {
        // Convert assignedCentreId to string to ensure type consistency
        const centreIdStr = String(assignedCentreId);

        // Filter appointments to only show those from assigned centre
        const filteredAppointments = appointmentsData.filter(
          (apt) => String(apt.centre_id) === centreIdStr,
        );
        setAppointments(filteredAppointments);

        // Filter centres to only show assigned centre
        const filteredCentres = centresData.filter(
          (centre) => String(centre.id) === centreIdStr,
        );
        setCentres(filteredCentres);

        // Filter clinicians to only show those from assigned centre
        const filteredClinicians = cliniciansData.filter(
          (clinician) => String(clinician.primaryCentreId) === centreIdStr,
        );
        setClinicians(filteredClinicians);
      } else {
        // For admin and managers, show all data
        setAppointments(appointmentsData);
        setCentres(centresData);
        setClinicians(cliniciansData);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...appointments];

    // Combined search filter (patient name, phone, clinician name, MRN)
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (apt) =>
          apt.patient_name.toLowerCase().includes(search) ||
          apt.patient_phone.includes(search) ||
          apt.clinician_name.toLowerCase().includes(search) ||
          (apt.patient_mrn && apt.patient_mrn.toLowerCase().includes(search)),
      );
    }

    // Status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((apt) => apt.status === statusFilter);
    }

    // Centre filter
    if (centreFilter !== "ALL") {
      filtered = filtered.filter((apt) => apt.centre_id === centreFilter);
    }

    // Clinician filter
    if (clinicianFilter !== "ALL") {
      filtered = filtered.filter((apt) => apt.clinician_id === clinicianFilter);
    }

    // Time filter (current/past/upcoming)
    if (timeFilter !== "ALL") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter((apt) => {
        const aptDate = new Date(apt.scheduled_start_at);
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

    // Date range filter (from DateRangeCalendar)
    if (selectedStartDate && selectedEndDate && timeFilter === "ALL") {
      const startDate = new Date(selectedStartDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(selectedEndDate);
      endDate.setHours(23, 59, 59, 999);

      filtered = filtered.filter((apt) => {
        const aptDate = new Date(apt.scheduled_start_at);
        return aptDate >= startDate && aptDate <= endDate;
      });
    }

    // Apply sorting
    if (sortBy) {
      filtered.sort((a, b) => {
        let dateA: Date;
        let dateB: Date;

        if (sortBy === "scheduled") {
          dateA = new Date(a.scheduled_start_at);
          dateB = new Date(b.scheduled_start_at);
        } else {
          // sortBy === "booked"
          dateA = new Date(a.created_at);
          dateB = new Date(b.created_at);
        }

        if (sortOrder === "asc") {
          return dateA.getTime() - dateB.getTime();
        } else {
          return dateB.getTime() - dateA.getTime();
        }
      });
    } else {
      // Default sort: nearest upcoming first, then past appointments (most recent first)
      const now = new Date();
      filtered.sort((a, b) => {
        const dateA = new Date(a.scheduled_start_at);
        const dateB = new Date(b.scheduled_start_at);

        const isAUpcoming = dateA >= now;
        const isBUpcoming = dateB >= now;

        // Both upcoming: sort ascending (nearest first)
        if (isAUpcoming && isBUpcoming) {
          return dateA.getTime() - dateB.getTime();
        }

        // Both past: sort descending (most recent first)
        if (!isAUpcoming && !isBUpcoming) {
          return dateB.getTime() - dateA.getTime();
        }

        // One upcoming, one past: upcoming comes first
        return isAUpcoming ? -1 : 1;
      });
    }

    setFilteredAppointments(filtered);
  };

  const handleDateRangeChange = (start: Date, end: Date) => {
    setSelectedStartDate(start);
    setSelectedEndDate(end);
    // When using date range calendar, set timeFilter to ALL
    setTimeFilter("ALL");
  };

  const handleSort = (type: "scheduled" | "booked") => {
    if (sortBy === type) {
      // Toggle sort order
      if (sortOrder === "asc") {
        setSortOrder("desc");
      } else {
        // Clear sort if clicking again on descending
        setSortBy(null);
        setSortOrder("asc");
      }
    } else {
      setSortBy(type);
      setSortOrder("asc");
    }
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
      "Patient Name": apt.patient_name,
      "Patient Phone": apt.patient_phone,
      MRN: apt.patient_mrn || "Not Assigned",
      Clinician: apt.clinician_name,
      Centre: apt.centre_name,
      Date: new Date(apt.scheduled_start_at).toLocaleDateString(),
      Time: new Date(apt.scheduled_start_at).toLocaleTimeString(),
      Duration: `${apt.duration_minutes} min`,
      Type: apt.appointment_type,
      Status: apt.status,
      "Booked At Date": apt.created_at
        ? new Date(apt.created_at).toLocaleDateString()
        : "N/A",
      "Booked At Time": apt.created_at
        ? new Date(apt.created_at).toLocaleTimeString()
        : "N/A",
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
      "MRN",
      "Clinician",
      "Centre",
      "Date",
      "Time",
      "Status",
      "Booked At",
    ];

    const rows = filteredAppointments.map((apt) => [
      apt.id,
      apt.patient_name,
      apt.patient_phone,
      apt.patient_mrn || "Not Assigned",
      apt.clinician_name,
      apt.centre_name,
      new Date(apt.scheduled_start_at).toLocaleDateString(),
      new Date(apt.scheduled_start_at).toLocaleTimeString(),
      apt.status,
      apt.created_at
        ? `${new Date(apt.created_at).toLocaleDateString()} ${new Date(apt.created_at).toLocaleTimeString()}`
        : "N/A",
    ]);

    exportToPDF(headers, rows, "Appointments Report");
    toast.success("Exported to PDF");
  };

  const handlePrint = () => {
    const headers = [
      "ID",
      "Patient",
      "Phone",
      "MRN",
      "Clinician",
      "Centre",
      "Date",
      "Time",
      "Status",
      "Booked At",
    ];

    const rows = filteredAppointments.map((apt) => [
      apt.id,
      apt.patient_name,
      apt.patient_phone,
      apt.patient_mrn || "Not Assigned",
      apt.clinician_name,
      apt.centre_name,
      new Date(apt.scheduled_start_at).toLocaleDateString(),
      new Date(apt.scheduled_start_at).toLocaleTimeString(),
      apt.status,
      apt.created_at
        ? `${new Date(apt.created_at).toLocaleDateString()} ${new Date(apt.created_at).toLocaleTimeString()}`
        : "N/A",
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
            {apt.patient_name || "Unknown"}
          </div>
          <div className="text-sm text-slate-400">
            {apt.patient_phone || "N/A"}
          </div>
        </div>
      ),
    },
    {
      key: "mrn",
      header: "MRN",
      render: (apt: Appointment) => (
        <span className="text-slate-300 font-mono text-sm">
          {apt.patient_mrn || (
            <span className="text-slate-500 italic">Not Assigned</span>
          )}
        </span>
      ),
    },
    {
      key: "clinician",
      header: "Clinician",
      render: (apt: Appointment) => (
        <span className="text-slate-300">
          {apt.clinician_name || "Unknown"}
        </span>
      ),
    },
    {
      key: "centre",
      header: "Centre",
      render: (apt: Appointment) => (
        <span className="text-slate-300">{apt.centre_name || "Unknown"}</span>
      ),
    },
    {
      key: "datetime",
      header: "Date & Time",
      render: (apt: Appointment) => (
        <div>
          <div className="text-white">
            {apt.scheduled_start_at
              ? new Date(apt.scheduled_start_at).toLocaleDateString()
              : "N/A"}
          </div>
          <div className="text-sm text-slate-400">
            {apt.scheduled_start_at
              ? new Date(apt.scheduled_start_at).toLocaleTimeString([], {
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
          {apt.appointment_type
            ? apt.appointment_type.replace("_", " ")
            : "N/A"}
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
      key: "booked_at",
      header: "Booked at",
      render: (apt: Appointment) => (
        <div className="space-y-1">
          <div className="text-white text-sm">
            {apt.created_at
              ? new Date(apt.created_at).toLocaleDateString()
              : "N/A"}
          </div>
          <div className="text-slate-400 text-xs">
            {apt.created_at
              ? new Date(apt.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "N/A"}
          </div>
        </div>
      ),
    },
    {
      key: "patient_notes",
      header: "Patient Note",
      render: (apt: Appointment) => (
        <div>
          {apt.patient_notes ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSelectedNoteAppointment(apt);
                setShowNoteModal(true);
              }}
              title="View patient note"
            >
              <FileText size={16} />
              View Note
            </Button>
          ) : (
            <span className="text-slate-500 italic text-sm">No note</span>
          )}
        </div>
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

  // If user is a clinician, render the ClinicianDashboard
  if (isClinician) {
    return <ClinicianDashboard />;
  }

  // For admins and managers, render the full appointments management interface
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isFrontDesk ? "Centre Appointments" : "All Appointments"}
          </h1>
          <p className="text-slate-400 mt-1">
            {isFrontDesk
              ? `View and manage bookings for ${centres.find((c) => c.id === assignedCentreId)?.name || "your centre"}`
              : "View and manage all bookings across centres"}
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
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                  size={20}
                />
                <Input
                  type="text"
                  placeholder="Search by patient name, phone, clinician, or MRN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select
              value={centreFilter}
              onChange={(e) => setCentreFilter(e.target.value)}
              disabled={isFrontDesk} // Disable for front desk - they can only see their assigned centre
              options={
                isFrontDesk && assignedCentreId
                  ? // For front desk, only show their assigned centre
                    centres.map((c) => ({ value: c.id, label: c.name }))
                  : // For admin/managers, show all centres with "All Centres" option
                    [
                      { value: "ALL", label: "All Centres" },
                      ...centres.map((c) => ({ value: c.id, label: c.name })),
                    ]
              }
            />

            <Select
              value={clinicianFilter}
              onChange={(e) => setClinicianFilter(e.target.value)}
              options={[
                { value: "ALL", label: "All Clinicians" },
                ...clinicians
                  .filter((clinician: any) => {
                    // Filter by active status
                    if (!clinician.isActive) return false;

                    // If a specific centre is selected, filter by that centre
                    if (centreFilter !== "ALL") {
                      return (
                        String(clinician.primaryCentreId) ===
                        String(centreFilter)
                      );
                    }

                    // Show all active clinicians when "All Centres" is selected
                    return true;
                  })
                  .map((clinician: any) => ({
                    value: clinician.id,
                    label:
                      clinician.full_name ||
                      clinician.fullName ||
                      clinician.name ||
                      "Unknown",
                  })),
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

          {/* Date Range Filter and Sort Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400">Date Range:</span>
              <DateRangeCalendar
                startDate={selectedStartDate}
                endDate={selectedEndDate}
                onDateRangeChange={handleDateRangeChange}
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400">Sort by:</span>
              <Button
                variant={sortBy === "scheduled" ? "primary" : "secondary"}
                size="sm"
                onClick={() => handleSort("scheduled")}
                className="flex items-center gap-2"
              >
                Appointment Date
                {sortBy === "scheduled" &&
                  (sortOrder === "asc" ? (
                    <ArrowUp size={16} />
                  ) : (
                    <ArrowDown size={16} />
                  ))}
                {!sortBy && <ArrowUpDown size={16} className="opacity-50" />}
              </Button>
              <Button
                variant={sortBy === "booked" ? "primary" : "secondary"}
                size="sm"
                onClick={() => handleSort("booked")}
                className="flex items-center gap-2"
              >
                Registration Date
                {sortBy === "booked" &&
                  (sortOrder === "asc" ? (
                    <ArrowUp size={16} />
                  ) : (
                    <ArrowDown size={16} />
                  ))}
                {!sortBy && <ArrowUpDown size={16} className="opacity-50" />}
              </Button>
              {sortBy && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSortBy(null);
                    setSortOrder("asc");
                  }}
                  title="Clear sort"
                >
                  <X size={16} />
                  Clear Sort
                </Button>
              )}
            </div>
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
            <p>No upcoming appointments</p>
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

      {/* Patient Note Modal */}
      {showNoteModal && selectedNoteAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText className="text-miboTeal" size={24} />
                  Patient Note
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Appointment #{selectedNoteAppointment.id} •{" "}
                  {selectedNoteAppointment.patient_name}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowNoteModal(false);
                  setSelectedNoteAppointment(null);
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="bg-slate-900/50 rounded-lg p-4 border border-white/10">
                <p className="text-white whitespace-pre-wrap">
                  {selectedNoteAppointment.patient_notes}
                </p>
              </div>

              {/* Appointment Details */}
              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Date & Time</p>
                  <p className="text-white font-medium">
                    {new Date(
                      selectedNoteAppointment.scheduled_start_at,
                    ).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Clinician</p>
                  <p className="text-white font-medium">
                    {selectedNoteAppointment.clinician_name}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Type</p>
                  <p className="text-white font-medium">
                    {selectedNoteAppointment.appointment_type?.replace(
                      "_",
                      " ",
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Status</p>
                  <p className="text-white font-medium">
                    {selectedNoteAppointment.status}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-white/10">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowNoteModal(false);
                  setSelectedNoteAppointment(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllAppointmentsPage;
