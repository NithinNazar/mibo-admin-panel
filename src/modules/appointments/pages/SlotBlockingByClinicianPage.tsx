import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Table from "../../../components/ui/Table";
import Select from "../../../components/ui/Select";
import Input from "../../../components/ui/Input";
import { CalendarOff, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import clinicianService from "../../../services/clinicianService";
import { slotBlockingService } from "../../../services/slotBlockingService";
import type { Clinician, TimeSlot } from "../../../types";

const SlotBlockingByClinicianPage: React.FC = () => {
  const navigate = useNavigate();
  const [clinicians, setClinicians] = useState<Clinician[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const [clinicianFilter, setClinicianFilter] = useState<string>("ALL");
  const [dateFilter, setDateFilter] = useState<string>(today);

  useEffect(() => {
    clinicianService
      .getClinicians()
      .then(setClinicians)
      .catch(() => toast.error("Failed to fetch clinicians"));
  }, []);

  const fetchSlots = useCallback(async () => {
    if (clinicianFilter === "ALL" || !dateFilter) {
      setSlots([]);
      return;
    }
    try {
      setLoading(true);
      const data = await clinicianService.getSlots({
        clinicianId: clinicianFilter,
        date: dateFilter,
      });
      setSlots(data);
    } catch (error) {
      toast.error((error as Error).message || "Failed to fetch slots");
    } finally {
      setLoading(false);
    }
  }, [clinicianFilter, dateFilter]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const handleBlock = async (slot: TimeSlot) => {
    const clinician = clinicians.find((c) => c.id === clinicianFilter);
    if (!clinician) return;
    try {
      await slotBlockingService.blockSlot({
        clinician_id: Number(clinician.id),
        centre_id: Number(slot.centreId),
        date: slot.date,
        start_time: slot.startTime,
        end_time: slot.endTime,
        reason: "Blocked by admin",
      });
      toast.success("Slot blocked successfully");
      fetchSlots();
    } catch (error) {
      const err = error as { response?: { data?: { error?: { message?: string } } } };
      toast.error(err.response?.data?.error?.message || "Failed to block slot");
    }
  };

  const handleUnblock = async (slot: TimeSlot) => {
    if (!slot.blockedSlotId) return;
    try {
      await slotBlockingService.unblockSlot(slot.blockedSlotId);
      toast.success("Slot unblocked successfully");
      fetchSlots();
    } catch (error) {
      const err = error as { response?: { data?: { error?: { message?: string } } } };
      toast.error(err.response?.data?.error?.message || "Failed to unblock slot");
    }
  };

  const columns = [
    {
      key: "date",
      header: "Date",
      render: (slot: TimeSlot) => (
        <span className="text-white">{slot.date}</span>
      ),
    },
    {
      key: "time",
      header: "Time",
      render: (slot: TimeSlot) => (
        <div>
          <div className="text-white">{slot.startTime}</div>
          <div className="text-sm text-slate-400">to {slot.endTime}</div>
        </div>
      ),
    },
    {
      key: "mode",
      header: "Mode",
      render: (slot: TimeSlot) => (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-miboTeal/20 text-miboTeal">
          {slot.mode.replace("_", " ")}
        </span>
      ),
    },
    {
      key: "block",
      header: "Block",
      render: (slot: TimeSlot) => (
        slot.blockedSlotId ? (
          <Button variant="secondary" size="sm" onClick={() => handleUnblock(slot)}>
            
            Unblock
          </Button>
        ) : (
          <Button variant="danger" size="sm" onClick={() => handleBlock(slot)} disabled={slot.status === "booked"}>
            Block
          </Button>
        )
      ),
    },
  ];

  const selectedClinician = clinicians.find((c) => c.id === clinicianFilter);

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
          <h1 className="text-2xl font-bold text-white">Block by Clinician</h1>
          <p className="text-slate-400 mt-1">
            View all slots for a clinician on a specific date
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <Select
              value={clinicianFilter}
              onChange={(e) => setClinicianFilter(e.target.value)}
              options={[
                { value: "ALL", label: "Select Clinician" },
                ...clinicians.map((c) => ({
                  value: c.id,
                  label: c.fullName || c.name,
                })),
              ]}
            />
          </div>
          <div className="md:col-span-2">
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              min={today}
            />
          </div>
        </div>
      </Card>

      {/* Slots Table */}
      <Card>
        {clinicianFilter === "ALL" ? (
          <div className="text-center py-8 text-slate-400">
            <CalendarOff size={48} className="mx-auto mb-4 opacity-50" />
            <p>Select a clinician to view their slots</p>
          </div>
        ) : loading ? (
          <div className="text-center py-8 text-slate-400">
            Loading slots...
          </div>
        ) : slots.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <CalendarOff size={48} className="mx-auto mb-4 opacity-50" />
            <p>
              No slots found for {selectedClinician?.fullName || selectedClinician?.name} on {dateFilter}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-slate-400">
              Showing {slots.length} slot{slots.length !== 1 ? "s" : ""} for{" "}
              {selectedClinician?.fullName || selectedClinician?.name} on {dateFilter}
            </div>
            <Table
              columns={columns}
              data={slots}
              keyExtractor={(slot) => slot.id?.toString() ?? String(slots.indexOf(slot))}
            />
          </>
        )}
      </Card>
    </div>
  );
};

export default SlotBlockingByClinicianPage;
