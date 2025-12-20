import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Table from "../../../components/ui/Table";
import Select from "../../../components/ui/Select";
import Modal from "../../../components/ui/Modal";
import Input from "../../../components/ui/Input";
import Badge from "../../../components/ui/Badge";
import { Calendar, User, Clock, Video, MapPin, X, Edit } from "lucide-react";
import toast from "react-hot-toast";
import appointmentService from "../../../services/appointmentService";
import centreService from "../../../services/centreService";
import clinicianService from "../../../services/clinicianService";
import type {
  Appointment,
  Centre,
  Clinician,
  AppointmentStatus,
} from "../../../types";

const CentreAppointmentsPage: React.FC = () => {
  const { centreId } = useParams<{ centreId: string }>();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<
    Appointment[]
  >([]);
  const [centres, setCentres] = useState<Centre[]>([]);
  const [clinicians, setClinicians] = useState<Clinician[]>([]);
  const [loading, setLoading] = useState(true);
  const [reschedulingAppointment, setReschedulingAppointment] =
    useState<Appointment | null>(null);
  const [newDateTime, setNewDateTime] = useState("");
  const [newTime, setNewTime] = useState("");

  // Filters
  const [selectedCentre, setSelectedCentre] = useState(centreId || "");
  const [selectedClinician, setSelectedClinician] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus | "">(
    ""
  );
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // If front desk, auto-select their assigned centre
    if (user?.role === "FRONT_DESK" && user.assignedCentreId) {
      setSelectedCentre(user.assignedCentreId);
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [
    appointments,
    selectedCentre,
    selectedClinician,
    selectedStatus,
    selectedDate,
  ]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appointmentsData, centresData, cliniciansData] = await Promise.all(
        [
          appointmentService.getAppointments(),
          centreService.getCentres(),
          clinicianService.getClinicians(),
        ]
      );
      setAppointments(appointmentsData);
      setCentres(centresData);
      setClinicians(cliniciansData);
    } catch (error: any) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...appointments];

    if (selectedCentre) {
      filtered = filtered.filter((apt) => apt.centreId === selectedCentre);
    }

    if (selectedClinician) {
      filtered = filtered.filter(
        (apt) => apt.clinicianId === selectedClinician
      );
    }

    if (selectedStatus) {
      filtered = filtered.filter((apt) => apt.status === selectedStatus);
    }

    if (selectedDate) {
      filtered = filtered.filter((apt) => {
        const aptDate = new Date(apt.scheduledStartAt)
          .toISOString()
          .split("T")[0];
        return aptDate === selectedDate;
      });
    }

    setFilteredAppointments(filtered);
  };

  const handleCancelAppointment = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;

    try {
      await appointmentService.cancelAppointment(id, "Cancelled by staff");
      toast.success("Appointment cancelled successfully");
      fetchData();
    } catch (error: any) {
      toast.error("Failed to cancel appointment");
    }
  };

  const handleOpenReschedule = (appointment: Appointment) => {
    setReschedulingAppointment(appointment);
    const date = new Date(appointment.scheduledStartAt);
    setNewDateTime(date.toISOString().split("T")[0]);
    setNewTime(
      date.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  const handleReschedule = async () => {
    if (!reschedulingAppointment || !newDateTime || !newTime) {
      toast.error("Please select date and time");
      return;
    }

    try {
      const newStartTime = `${newDateTime}T${newTime}:00`;
      await appointmentService.rescheduleAppointment(
        reschedulingAppointment.id,
        newStartTime
      );
      toast.success("Appointment rescheduled successfully");
      setReschedulingAppointment(null);
      fetchData();
    } catch (error: any) {
      toast.error("Failed to reschedule appointment");
    }
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    const statusConfig = {
      BOOKED: { variant: "info" as const, label: "Booked" },
      CONFIRMED: { variant: "success" as const, label: "Confirmed" },
      RESCHEDULED: { variant: "warning" as const, label: "Rescheduled" },
      COMPLETED: { variant: "success" as const, label: "Completed" },
      CANCELLED: { variant: "danger" as const, label: "Cancelled" },
      NO_SHOW: { variant: "danger" as const, label: "No Show" },
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const columns = [
    {
      key: "patient",
      header: "Patient",
      render: (apt: Appointment) => (
        <div className="flex items-center gap-2">
          <User size={16} className="text-slate-400" />
          <div>
            <div className="font-medium text-white">{apt.patientName}</div>
            <div className="text-sm text-slate-400">{apt.patientPhone}</div>
          </div>
        </div>
      ),
    },
    {
      key: "clinician",
      header: "Clinician",
      render: (apt: Appointment) => (
        <div className="text-slate-300">{apt.clinicianName}</div>
      ),
    },
    {
      key: "datetime",
      header: "Date & Time",
      render: (apt: Appointment) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-300">
            <Calendar size={14} className="text-slate-400" />
            <span>{new Date(apt.scheduledStartAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Clock size={14} className="text-slate-400" />
            <span>
              {new Date(apt.scheduledStartAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (apt: Appointment) => (
        <div className="flex items-center gap-2">
          {apt.appointmentType === "ONLINE" ? (
            <>
              <Video size={16} className="text-miboTeal" />
              <span className="text-slate-300">Online</span>
            </>
          ) : (
            <>
              <MapPin size={16} className="text-miboTeal" />
              <span className="text-slate-300">In-Person</span>
            </>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (apt: Appointment) => getStatusBadge(apt.status),
    },
    {
      key: "actions",
      header: "Actions",
      render: (apt: Appointment) => (
        <div className="flex gap-2">
          {(apt.status === "BOOKED" || apt.status === "CONFIRMED") && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleOpenReschedule(apt)}
              >
                <Edit size={16} />
                Reschedule
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleCancelAppointment(apt.id)}
              >
                <X size={16} />
                Cancel
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Appointments</h1>
        <p className="text-slate-400 mt-1">View and manage appointments</p>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            label="Centre"
            value={selectedCentre}
            onChange={(e) => setSelectedCentre(e.target.value)}
            options={[
              { value: "", label: "All Centres" },
              ...centres.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />

          <Select
            label="Clinician"
            value={selectedClinician}
            onChange={(e) => setSelectedClinician(e.target.value)}
            options={[
              { value: "", label: "All Clinicians" },
              ...clinicians.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />

          <Select
            label="Status"
            value={selectedStatus}
            onChange={(e) =>
              setSelectedStatus(e.target.value as AppointmentStatus | "")
            }
            options={[
              { value: "", label: "All Statuses" },
              { value: "BOOKED", label: "Booked" },
              { value: "CONFIRMED", label: "Confirmed" },
              { value: "COMPLETED", label: "Completed" },
              { value: "CANCELLED", label: "Cancelled" },
            ]}
          />

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-miboTeal"
            />
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
            No appointments found matching your filters.
          </div>
        ) : (
          <Table
            columns={columns}
            data={filteredAppointments}
            keyExtractor={(apt) => apt.id}
          />
        )}
      </Card>

      {/* Reschedule Modal */}
      <Modal
        isOpen={!!reschedulingAppointment}
        onClose={() => setReschedulingAppointment(null)}
        title="Reschedule Appointment"
      >
        {reschedulingAppointment && (
          <div className="space-y-4">
            <div className="p-3 bg-slate-700/50 rounded-lg space-y-2">
              <div>
                <div className="text-sm text-slate-400">Patient</div>
                <div className="font-medium text-white">
                  {reschedulingAppointment.patientName}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-400">Clinician</div>
                <div className="font-medium text-white">
                  {reschedulingAppointment.clinicianName}
                </div>
              </div>
            </div>

            <Input
              label="New Date"
              type="date"
              value={newDateTime}
              onChange={(e) => setNewDateTime(e.target.value)}
              required
            />

            <Input
              label="New Time"
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              required
            />

            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => setReschedulingAppointment(null)}
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={handleReschedule}>
                Confirm Reschedule
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CentreAppointmentsPage;
