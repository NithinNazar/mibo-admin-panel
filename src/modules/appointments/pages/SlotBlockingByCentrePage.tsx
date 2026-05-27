import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Table from "../../../components/ui/Table";
import Select from "../../../components/ui/Select";
import { Calendar, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import centreService from "../../../services/centreService";
import appointmentService from "../../../services/appointmentService";
import { slotBlockingService } from "../../../services/slotBlockingService";
import type { Appointment, Centre } from "../../../types";

const SlotBlockingByCentrePage: React.FC = () => {
  const navigate = useNavigate();
  const [centres, setCentres] = useState<Centre[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const [centreFilter, setCentreFilter] = useState<string>("ALL");

  useEffect(() => {
    centreService
      .getCentres()
      .then(setCentres)
      .catch(() => toast.error("Failed to fetch centres"));
  }, []);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (centreFilter !== "ALL") params.centreId = centreFilter;
      const data = await appointmentService.getAppointments(params);
      setAppointments(data);
    } catch (error) {
      toast.error((error as Error).message || "Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  }, [centreFilter]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleBlock = async (apt: Appointment) => {
    try {
      await slotBlockingService.blockSlot({
        clinician_id: Number(apt.clinician_id),
        centre_id: Number(apt.centre_id),
        date: new Date(apt.scheduled_start_at).toISOString().split("T")[0],
        start_time: new Date(apt.scheduled_start_at).toTimeString().slice(0, 5),
        end_time: new Date(apt.scheduled_end_at).toTimeString().slice(0, 5),
      });
      toast.success("Slot blocked successfully");
      fetchAppointments();
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: { message?: string } } };
      };
      toast.error(err.response?.data?.error?.message || "Failed to block slot");
    }
  };

  const handleUnblock = async (apt: Appointment) => {
    if (!apt.blocked_slot_id) return;
    try {
      await slotBlockingService.unblockSlot(apt.blocked_slot_id);
      toast.success("Slot unblocked successfully");
      fetchAppointments();
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: { message?: string } } };
      };
      toast.error(
        err.response?.data?.error?.message || "Failed to unblock slot",
      );
    }
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
                  hour12: true,
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
      key: "block",
      header: "Block",
      render: (apt: Appointment) =>
        apt.blocked_slot_id ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleUnblock(apt)}
          >
            Unblock
          </Button>
        ) : (
          <Button variant="danger" size="sm" onClick={() => handleBlock(apt)}>
            Block
          </Button>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate("/slot-blocking")}
        >
          <ArrowLeft size={16} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">Block by Centre</h1>
          <p className="text-slate-400 mt-1">
            View all appointments across centres
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <Select
                value={centreFilter}
                onChange={(e) => setCentreFilter(e.target.value)}
                options={[
                  { value: "ALL", label: "All Centres" },
                  ...centres.map((c) => ({ value: c.id, label: c.name })),
                ]}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Appointments Table */}
      <Card>
        {loading ? (
          <div className="text-center py-8 text-slate-400">
            Loading appointments...
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Calendar size={48} className="mx-auto mb-4 opacity-50" />
            <p>No appointments found</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-slate-400">
              Showing {appointments.length} appointment
              {appointments.length !== 1 ? "s" : ""}
            </div>
            <Table
              columns={columns}
              data={appointments}
              keyExtractor={(apt) => apt.id.toString()}
            />
          </>
        )}
      </Card>
    </div>
  );
};

export default SlotBlockingByCentrePage;
