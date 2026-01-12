import React, { useState, useEffect } from "react";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import { AvailabilityCalendar, SlotGrid } from "../../../components/calendar";
import { Calendar, User, Phone, Send, Check } from "lucide-react";
import toast from "react-hot-toast";
import centreService from "../../../services/centreService";
import clinicianService from "../../../services/clinicianService";
import frontDeskBookingService from "../../../services/frontDeskBookingService";
import paymentService from "../../../services/paymentService";
import type {
  Centre,
  Clinician,
  TimeSlot,
  AppointmentType,
} from "../../../types";

const FrontDeskBookingPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [appointmentId, setAppointmentId] = useState<number | null>(null);

  // Data states
  const [centres, setCentres] = useState<Centre[]>([]);
  const [clinicians, setClinicians] = useState<Clinician[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);

  // Form states
  const [selectedCentre, setSelectedCentre] = useState<string>("");
  const [selectedClinician, setSelectedClinician] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [sessionType, setSessionType] = useState<AppointmentType>("IN_PERSON");

  // Patient details
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [notes, setNotes] = useState("");

  // Payment link state
  const [sendingPaymentLink, setSendingPaymentLink] = useState(false);
  const [paymentLinkSent, setPaymentLinkSent] = useState(false);

  useEffect(() => {
    fetchCentres();
  }, []);

  useEffect(() => {
    if (selectedCentre) {
      fetchClinicians(selectedCentre);
    }
  }, [selectedCentre]);

  useEffect(() => {
    if (selectedClinician && selectedDate) {
      fetchAvailability();
    }
  }, [selectedClinician, selectedDate]);

  const fetchCentres = async () => {
    try {
      const data = await centreService.getCentres();
      setCentres(data);
    } catch (error: any) {
      toast.error("Failed to fetch centres");
    }
  };

  const fetchClinicians = async (centreId: string) => {
    try {
      const data = await clinicianService.getClinicians({ centreId });
      setClinicians(data);
    } catch (error: any) {
      toast.error("Failed to fetch clinicians");
    }
  };

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const data = await clinicianService.getAvailability({
        clinicianId: selectedClinician,
        centreId: selectedCentre,
        date: selectedDate,
      });
      setSlots(data);
    } catch (error: any) {
      toast.error("Failed to fetch availability");
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async () => {
    try {
      // Validate form
      if (
        !selectedCentre ||
        !selectedClinician ||
        !selectedSlot ||
        !patientName ||
        !patientPhone
      ) {
        toast.error("Please fill in all required fields");
        return;
      }

      setLoading(true);

      // Book appointment
      const response = await frontDeskBookingService.bookForPatient({
        clinicianId: parseInt(selectedClinician),
        centreId: parseInt(selectedCentre),
        patientPhone,
        patientName,
        patientEmail,
        appointmentType: sessionType,
        appointmentDate: selectedSlot.date,
        appointmentTime: selectedSlot.startTime,
        notes,
      });

      setAppointmentId(parseInt(response.appointment.id));
      setBookingComplete(true);

      toast.success("Appointment booked successfully!");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to book appointment"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendPaymentLink = async () => {
    try {
      if (!appointmentId) {
        toast.error("No appointment found");
        return;
      }

      setSendingPaymentLink(true);

      await paymentService.sendPaymentLink({
        appointmentId,
        patientPhone,
        patientName,
      });

      setPaymentLinkSent(true);
      toast.success("Payment link sent via WhatsApp!");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to send payment link"
      );
    } finally {
      setSendingPaymentLink(false);
    }
  };

  const handleNewBooking = () => {
    // Reset all states
    setBookingComplete(false);
    setAppointmentId(null);
    setPaymentLinkSent(false);
    setSelectedCentre("");
    setSelectedClinician("");
    setSelectedDate("");
    setSelectedSlot(null);
    setSessionType("IN_PERSON");
    setPatientName("");
    setPatientPhone("");
    setPatientEmail("");
    setNotes("");
  };

  const selectedCentreData = centres.find((c) => c.id === selectedCentre);
  const selectedClinicianData = clinicians.find(
    (c) => c.id === selectedClinician
  );

  if (bookingComplete) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Booking Complete</h1>
          <p className="text-slate-400 mt-1">
            Appointment has been successfully booked
          </p>
        </div>

        <Card>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Appointment Booked Successfully!
            </h3>
            <p className="text-slate-400 mb-6">
              The appointment has been created. Send the payment link to the
              patient.
            </p>

            <div className="bg-slate-700/50 rounded-lg p-6 max-w-md mx-auto mb-6">
              <div className="space-y-3 text-left">
                <div>
                  <div className="text-sm text-slate-400">Patient</div>
                  <div className="text-white font-medium">{patientName}</div>
                  <div className="text-sm text-slate-400">{patientPhone}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">Doctor</div>
                  <div className="text-white font-medium">
                    {selectedClinicianData?.name}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">Date & Time</div>
                  <div className="text-white font-medium">
                    {selectedSlot?.date} at {selectedSlot?.startTime}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">Centre</div>
                  <div className="text-white font-medium">
                    {selectedCentreData?.name}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              {!paymentLinkSent ? (
                <Button
                  variant="primary"
                  onClick={handleSendPaymentLink}
                  loading={sendingPaymentLink}
                  className="flex items-center gap-2"
                >
                  <Send size={20} />
                  Send Payment Link via WhatsApp
                </Button>
              ) : (
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg px-6 py-3">
                  <div className="flex items-center gap-2 text-green-400">
                    <Check size={20} />
                    <span className="font-medium">Payment Link Sent!</span>
                  </div>
                </div>
              )}
            </div>

            <Button
              variant="secondary"
              onClick={handleNewBooking}
              className="mt-6"
            >
              Book Another Appointment
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Book Appointment</h1>
        <p className="text-slate-400 mt-1">
          Book appointments for patients calling the front desk
        </p>
      </div>

      {/* Patient Details */}
      <Card>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <User size={20} />
          Patient Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Patient Name"
            type="text"
            placeholder="Enter patient name"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            required
          />
          <Input
            label="Phone Number"
            type="tel"
            placeholder="+91 9876543210"
            value={patientPhone}
            onChange={(e) => setPatientPhone(e.target.value)}
            required
          />
          <Input
            label="Email (Optional)"
            type="email"
            placeholder="patient@example.com"
            value={patientEmail}
            onChange={(e) => setPatientEmail(e.target.value)}
          />
        </div>
      </Card>

      {/* Centre & Doctor Selection */}
      <Card>
        <h3 className="text-lg font-semibold text-white mb-4">
          Select Centre & Doctor
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Centre"
            value={selectedCentre}
            onChange={(e) => {
              setSelectedCentre(e.target.value);
              setSelectedClinician("");
              setSelectedDate("");
              setSelectedSlot(null);
            }}
            options={[
              { value: "", label: "Select Centre" },
              ...centres.map((c) => ({
                value: c.id,
                label: `${c.name} - ${c.city}`,
              })),
            ]}
            required
          />

          <Select
            label="Doctor"
            value={selectedClinician}
            onChange={(e) => {
              setSelectedClinician(e.target.value);
              setSelectedDate("");
              setSelectedSlot(null);
            }}
            options={[
              { value: "", label: "Select Doctor" },
              ...clinicians.map((c) => ({
                value: c.id,
                label: `${c.name} - ${c.specialization}`,
              })),
            ]}
            disabled={!selectedCentre}
            required
          />
        </div>
      </Card>

      {/* Date & Time Selection */}
      {selectedClinician && (
        <Card>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar size={20} />
            Select Date & Time
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AvailabilityCalendar
              clinicianId={selectedClinician}
              centreId={selectedCentre}
              slots={slots}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
            {selectedDate && (
              <SlotGrid
                date={selectedDate}
                slots={slots.filter((s) => s.date === selectedDate)}
                onSlotClick={setSelectedSlot}
                selectedSlotId={selectedSlot?.id}
              />
            )}
          </div>
        </Card>
      )}

      {/* Session Type */}
      {selectedSlot && (
        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">
            Session Type
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setSessionType("IN_PERSON")}
              className={`
                p-4 rounded-lg border-2 text-left transition-all
                ${
                  sessionType === "IN_PERSON"
                    ? "border-miboTeal bg-miboTeal/10"
                    : "border-slate-600 bg-slate-700/50 hover:border-slate-500"
                }
              `}
            >
              <div className="font-medium text-white mb-1">In-Person</div>
              <div className="text-sm text-slate-400">
                Visit the centre for consultation
              </div>
            </button>
            <button
              onClick={() => setSessionType("ONLINE")}
              className={`
                p-4 rounded-lg border-2 text-left transition-all
                ${
                  sessionType === "ONLINE"
                    ? "border-miboTeal bg-miboTeal/10"
                    : "border-slate-600 bg-slate-700/50 hover:border-slate-500"
                }
              `}
            >
              <div className="font-medium text-white mb-1">Online</div>
              <div className="text-sm text-slate-400">
                Video consultation via Google Meet
              </div>
            </button>
          </div>
        </Card>
      )}

      {/* Notes */}
      {selectedSlot && (
        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">
            Notes (Optional)
          </h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional notes..."
            rows={3}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-miboTeal"
          />
        </Card>
      )}

      {/* Book Button */}
      {selectedSlot && (
        <div className="flex justify-end">
          <Button
            variant="primary"
            onClick={handleBookAppointment}
            loading={loading}
            className="px-8"
          >
            Book Appointment
          </Button>
        </div>
      )}
    </div>
  );
};

export default FrontDeskBookingPage;
