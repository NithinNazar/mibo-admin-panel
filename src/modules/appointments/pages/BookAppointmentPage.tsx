import React, { useState, useEffect } from "react";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import { AvailabilityCalendar, SlotGrid } from "../../../components/calendar";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  MapPin,
  User,
  Calendar,
  Video,
} from "lucide-react";
import toast from "react-hot-toast";
import centreService from "../../../services/centreService";
import clinicianService from "../../../services/clinicianService";
import patientService from "../../../services/patientService";
import appointmentService from "../../../services/appointmentService";
import type {
  Centre,
  Clinician,
  Patient,
  TimeSlot,
  AppointmentType,
} from "../../../types";

type BookingStep = 1 | 2 | 3 | 4 | 5 | 6;

const BookAppointmentPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<BookingStep>(1);
  const [loading, setLoading] = useState(false);

  // Data states
  const [centres, setCentres] = useState<Centre[]>([]);
  const [clinicians, setClinicians] = useState<Clinician[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);

  // Form states
  const [selectedCentre, setSelectedCentre] = useState<string>("");
  const [selectedClinician, setSelectedClinician] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [sessionType, setSessionType] = useState<AppointmentType>("IN_PERSON");
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [newPatient, setNewPatient] = useState({
    fullName: "",
    phone: "",
    email: "",
  });
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchCentres();
    fetchPatients();
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

  const fetchPatients = async () => {
    try {
      const data = await patientService.getPatients();
      setPatients(data);
    } catch (error: any) {
      toast.error("Failed to fetch patients");
    }
  };

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const data = await clinicianService.getSlots({
        clinicianId: selectedClinician,
        date: selectedDate,
        centreId: selectedCentre,
      });
      setSlots(data);
    } catch (error: any) {
      toast.error("Failed to fetch availability");
      setSlots([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && !selectedCentre) {
      toast.error("Please select a centre");
      return;
    }
    if (currentStep === 2 && !selectedClinician) {
      toast.error("Please select a clinician");
      return;
    }
    if (currentStep === 3 && !selectedSlot) {
      toast.error("Please select a time slot");
      return;
    }
    if (currentStep === 4 && !sessionType) {
      toast.error("Please select session type");
      return;
    }
    if (currentStep === 5 && !selectedPatient && !newPatient.fullName) {
      toast.error("Please select or create a patient");
      return;
    }

    setCurrentStep((prev) => Math.min(prev + 1, 6) as BookingStep);
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1) as BookingStep);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Create patient if new
      let patientId = selectedPatient;
      if (!patientId && newPatient.fullName) {
        const patient = await patientService.createPatient(newPatient);
        patientId = patient.id;
      }

      if (!selectedSlot) {
        toast.error("No slot selected");
        return;
      }

      // Book appointment
      await appointmentService.createAppointment({
        patientId: parseInt(patientId),
        clinicianId: parseInt(selectedClinician),
        centreId: parseInt(selectedCentre),
        appointmentType: sessionType,
        scheduledStartAt: `${selectedSlot.date}T${selectedSlot.startTime}:00Z`,
        durationMinutes:
          parseInt(selectedSlot.endTime.split(":")[0]) * 60 +
          parseInt(selectedSlot.endTime.split(":")[1]) -
          (parseInt(selectedSlot.startTime.split(":")[0]) * 60 +
            parseInt(selectedSlot.startTime.split(":")[1])),
        notes,
      });

      toast.success("Appointment booked successfully!");

      // Reset form
      setCurrentStep(1);
      setSelectedCentre("");
      setSelectedClinician("");
      setSelectedDate("");
      setSelectedSlot(null);
      setSessionType("IN_PERSON");
      setSelectedPatient("");
      setNewPatient({ fullName: "", phone: "", email: "" });
      setNotes("");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to book appointment",
      );
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: "Select Centre", icon: MapPin },
    { number: 2, title: "Select Clinician", icon: User },
    { number: 3, title: "Select Date & Time", icon: Calendar },
    { number: 4, title: "Session Type", icon: Video },
    { number: 5, title: "Patient Details", icon: User },
    { number: 6, title: "Confirm", icon: Check },
  ];

  const selectedCentreData = centres.find((c) => c.id === selectedCentre);
  const selectedClinicianData = clinicians.find(
    (c) => c.id === selectedClinician,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Book Appointment</h1>
        <p className="text-slate-400 mt-1">
          Schedule a new appointment for a patient
        </p>
      </div>

      {/* Progress Steps */}
      <Card>
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.number;
            const isCompleted = currentStep > step.number;

            return (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all
                      ${isCompleted ? "bg-green-500 text-white" : ""}
                      ${
                        isActive
                          ? "bg-miboTeal text-white ring-4 ring-miboTeal/30"
                          : ""
                      }
                      ${
                        !isActive && !isCompleted
                          ? "bg-slate-700 text-slate-400"
                          : ""
                      }
                    `}
                  >
                    {isCompleted ? <Check size={20} /> : <Icon size={20} />}
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      isActive ? "text-white" : "text-slate-400"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      isCompleted ? "bg-green-500" : "bg-slate-700"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </Card>

      {/* Step Content */}
      <Card>
        {/* Step 1: Select Centre */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Select Centre</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {centres.map((centre) => (
                <button
                  key={centre.id}
                  onClick={() => setSelectedCentre(centre.id)}
                  className={`
                    p-4 rounded-lg border-2 text-left transition-all
                    ${
                      selectedCentre === centre.id
                        ? "border-miboTeal bg-miboTeal/10"
                        : "border-slate-600 bg-slate-700/50 hover:border-slate-500"
                    }
                  `}
                >
                  <div className="font-medium text-white mb-1">
                    {centre.name}
                  </div>
                  <div className="text-sm text-slate-400 capitalize">
                    {centre.city}
                  </div>
                  <div className="text-sm text-slate-400 mt-2">
                    {centre.address}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Select Clinician */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">
              Select Clinician
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clinicians.map((clinician) => (
                <button
                  key={clinician.id}
                  onClick={() => setSelectedClinician(clinician.id)}
                  className={`
                    p-4 rounded-lg border-2 text-left transition-all
                    ${
                      selectedClinician === clinician.id
                        ? "border-miboTeal bg-miboTeal/10"
                        : "border-slate-600 bg-slate-700/50 hover:border-slate-500"
                    }
                  `}
                >
                  <div className="font-medium text-white mb-1">
                    {clinician.name}
                  </div>
                  <div className="text-sm text-slate-400">
                    {clinician.specialization}
                  </div>
                  <div className="text-sm text-slate-400 mt-2">
                    {clinician.yearsOfExperience} years experience
                  </div>
                  <div className="text-sm text-miboTeal mt-1">
                    ₹{clinician.consultationFee}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Select Date & Time */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">
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
          </div>
        )}

        {/* Step 4: Session Type */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">
              Select Session Type
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setSessionType("IN_PERSON")}
                className={`
                  p-6 rounded-lg border-2 text-left transition-all
                  ${
                    sessionType === "IN_PERSON"
                      ? "border-miboTeal bg-miboTeal/10"
                      : "border-slate-600 bg-slate-700/50 hover:border-slate-500"
                  }
                `}
              >
                <MapPin size={24} className="text-miboTeal mb-2" />
                <div className="font-medium text-white mb-1">In-Person</div>
                <div className="text-sm text-slate-400">
                  Visit the centre for face-to-face consultation
                </div>
              </button>
              <button
                onClick={() => setSessionType("ONLINE")}
                className={`
                  p-6 rounded-lg border-2 text-left transition-all
                  ${
                    sessionType === "ONLINE"
                      ? "border-miboTeal bg-miboTeal/10"
                      : "border-slate-600 bg-slate-700/50 hover:border-slate-500"
                  }
                `}
              >
                <Video size={24} className="text-miboTeal mb-2" />
                <div className="font-medium text-white mb-1">Online</div>
                <div className="text-sm text-slate-400">
                  Video consultation via Google Meet
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Patient Details */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">
              Patient Details
            </h3>
            <Select
              label="Select Existing Patient"
              value={selectedPatient}
              onChange={(e) => {
                setSelectedPatient(e.target.value);
                setNewPatient({ fullName: "", phone: "", email: "" });
              }}
              options={[
                { value: "", label: "-- Create New Patient --" },
                ...patients.map((p) => ({
                  value: p.id,
                  label: `${p.fullName} (${p.phone})`,
                })),
              ]}
            />

            {!selectedPatient && (
              <div className="space-y-4 pt-4 border-t border-slate-700">
                <h4 className="font-medium text-white">
                  New Patient Information
                </h4>
                <Input
                  label="Full Name"
                  type="text"
                  placeholder="Enter patient name"
                  value={newPatient.fullName}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, fullName: e.target.value })
                  }
                  required
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="+91 9876543210"
                  value={newPatient.phone}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, phone: e.target.value })
                  }
                  required
                />
                <Input
                  label="Email (Optional)"
                  type="email"
                  placeholder="patient@example.com"
                  value={newPatient.email}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, email: e.target.value })
                  }
                />
              </div>
            )}
          </div>
        )}

        {/* Step 6: Confirm */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">
              Confirm Appointment
            </h3>
            <div className="bg-slate-700/50 rounded-lg p-6 space-y-4">
              <div>
                <div className="text-sm text-slate-400">Centre</div>
                <div className="text-white font-medium">
                  {selectedCentreData?.name}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-400">Clinician</div>
                <div className="text-white font-medium">
                  {selectedClinicianData?.name}
                </div>
                <div className="text-sm text-slate-400">
                  {selectedClinicianData?.specialization}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-400">Date & Time</div>
                <div className="text-white font-medium">
                  {selectedSlot?.date} at {selectedSlot?.startTime} -{" "}
                  {selectedSlot?.endTime}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-400">Session Type</div>
                <div className="text-white font-medium capitalize">
                  {sessionType.replace("_", " ")}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-400">Patient</div>
                <div className="text-white font-medium">
                  {selectedPatient
                    ? patients.find((p) => p.id === selectedPatient)?.fullName
                    : newPatient.fullName}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes..."
                rows={3}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-miboTeal"
              />
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 pt-6 border-t border-slate-700 mt-6">
          {currentStep > 1 && (
            <Button variant="secondary" onClick={handleBack} className="flex-1">
              <ChevronLeft size={20} />
              Back
            </Button>
          )}
          {currentStep < 6 ? (
            <Button variant="primary" onClick={handleNext} className="flex-1">
              Next
              <ChevronRight size={20} />
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={loading}
              className="flex-1"
            >
              Confirm Booking
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default BookAppointmentPage;
