import React, { useState, useEffect } from "react";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import Input from "../../../components/ui/Input";
import Badge from "../../../components/ui/Badge";
import {
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  Video,
  X,
  Edit,
} from "lucide-react";
import toast from "react-hot-toast";
import appointmentService from "../../../services/appointmentService";
import type { Appointment } from "../../../types";

const ClinicianAppointmentsPage: React.FC = () => {
  const [currentAppointments, setCurrentAppointments] = useState<Appointment[]>(
    [],
  );
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    Appointment[]
  >([]);
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([]);
  const [summary, setSummary] = useState({
    currentCount: 0,
    upcomingCount: 0,
    pastCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [reschedulingAppointment, setReschedulingAppointment] =
    useState<Appointment | null>(null);
  const [newDateTime, setNewDateTime] = useState("");
  const [newTime, setNewTime] = useState("");

  useEffect(() => {
    fetchMyAppointments();
  }, []);

  const fetchMyAppointments = async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getMyAppointments();
      setCurrentAppointments(data.current);
      setUpcomingAppointments(data.upcoming);
      setPastAppointments(data.past);
      setSummary(data.summary);
    } catch (error: any) {
      toast.error("Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;

    try {
      await appointmentService.cancelAppointment(id, "Cancelled by clinician");
      toast.success("Appointment cancelled successfully");
      fetchMyAppointments();
    } catch (error: any) {
      toast.error("Failed to cancel appointment");
    }
  };

  const handleOpenReschedule = (appointment: Appointment) => {
    setReschedulingAppointment(appointment);
    const date = new Date(appointment.scheduled_start_at);
    setNewDateTime(date.toISOString().split("T")[0]);
    setNewTime(
      date.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      }),
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
        newStartTime,
      );
      toast.success("Appointment rescheduled successfully");
      setReschedulingAppointment(null);
      fetchMyAppointments();
    } catch (error: any) {
      toast.error("Failed to reschedule appointment");
    }
  };

  const AppointmentCard: React.FC<{ appointment: Appointment }> = ({
    appointment,
  }) => {
    const canModify =
      appointment.status === "BOOKED" || appointment.status === "CONFIRMED";

    return (
      <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-miboTeal transition-colors">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-miboTeal/20 flex items-center justify-center">
              <User size={20} className="text-miboTeal" />
            </div>
            <div>
              <div className="font-medium text-white">
                {appointment.patient_name}
              </div>
              <div className="text-sm text-slate-400 flex items-center gap-1">
                <Phone size={12} />
                {appointment.patient_phone}
              </div>
            </div>
          </div>
          <Badge
            variant={appointment.status === "CONFIRMED" ? "success" : "info"}
          >
            {appointment.status}
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-slate-300">
            <Calendar size={14} className="text-slate-400" />
            <span>
              {new Date(appointment.scheduled_start_at).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Clock size={14} className="text-slate-400" />
            <span>
              {new Date(appointment.scheduled_start_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
              {" - "}
              {new Date(appointment.scheduled_end_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            {appointment.appointment_type === "ONLINE" ? (
              <>
                <Video size={14} className="text-slate-400" />
                <span>Online Consultation</span>
              </>
            ) : (
              <>
                <MapPin size={14} className="text-slate-400" />
                <span>{appointment.centre_name}</span>
              </>
            )}
          </div>
        </div>

        {appointment.notes && (
          <div className="mt-3 pt-3 border-t border-slate-600">
            <div className="text-xs text-slate-400 mb-1">Notes:</div>
            <div className="text-sm text-slate-300">{appointment.notes}</div>
          </div>
        )}

        {canModify && (
          <div className="mt-4 flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleOpenReschedule(appointment)}
            >
              <Edit size={16} />
              Reschedule
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleCancelAppointment(appointment.id)}
            >
              <X size={16} />
              Cancel
            </Button>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <div className="text-center py-8 text-slate-400">
            Loading appointments...
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Appointments</h1>
        <p className="text-slate-400 mt-1">View your scheduled appointments</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-400">Today's Appointments</div>
              <div className="text-3xl font-bold text-white mt-1">
                {summary.currentCount}
              </div>
            </div>
            <div className="w-12 h-12 rounded-lg bg-miboTeal/20 flex items-center justify-center">
              <Calendar size={24} className="text-miboTeal" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-400">Upcoming</div>
              <div className="text-3xl font-bold text-white mt-1">
                {summary.upcomingCount}
              </div>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Clock size={24} className="text-blue-400" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-400">Completed</div>
              <div className="text-3xl font-bold text-white mt-1">
                {summary.pastCount}
              </div>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
              <User size={24} className="text-green-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Current Appointments */}
      <Card>
        <h3 className="text-lg font-semibold text-white mb-4">
          Today's Appointments
        </h3>
        {currentAppointments.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            No appointments scheduled for today
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentAppointments.map((apt) => (
              <AppointmentCard key={apt.id} appointment={apt} />
            ))}
          </div>
        )}
      </Card>

      {/* Upcoming Appointments */}
      <Card>
        <h3 className="text-lg font-semibold text-white mb-4">
          Upcoming Appointments
        </h3>
        {upcomingAppointments.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            No upcoming appointments
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingAppointments.slice(0, 6).map((apt) => (
              <AppointmentCard key={apt.id} appointment={apt} />
            ))}
          </div>
        )}
      </Card>

      {/* Past Appointments */}
      <Card>
        <h3 className="text-lg font-semibold text-white mb-4">
          Past Appointments
        </h3>
        {pastAppointments.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            No past appointments
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pastAppointments.slice(0, 6).map((apt) => (
              <AppointmentCard key={apt.id} appointment={apt} />
            ))}
          </div>
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
            <div className="p-3 bg-slate-700/50 rounded-lg">
              <div className="text-sm text-slate-400">Patient</div>
              <div className="font-medium text-white">
                {reschedulingAppointment.patient_name}
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

export default ClinicianAppointmentsPage;
