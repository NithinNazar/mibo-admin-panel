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
  Search,
  X,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import centreService from "../../../services/centreService";
import clinicianService from "../../../services/clinicianService";
import patientService from "../../../services/patientService";
import appointmentService from "../../../services/appointmentService";
import { useAuth } from "../../../contexts/AuthContext";
import type {
  Centre,
  Clinician,
  Patient,
  TimeSlot,
  AppointmentType,
} from "../../../types";

type BookingStep = 1 | 2 | 3 | 4 | 5 | 6;

const BookAppointmentPage: React.FC = () => {
  const { user } = useAuth();
  const isFrontDesk = user?.role === "FRONT_DESK";
  const assignedCentreId = user?.assignedCentreId;

  const [currentStep, setCurrentStep] = useState<BookingStep>(1);
  const [loading, setLoading] = useState(false);
  const [showDirectPaymentModal, setShowDirectPaymentModal] = useState(false);
  const [directPaymentMethod, setDirectPaymentMethod] = useState<
    "CASH" | "CARD" | "UPI"
  >("CASH");
  const [directPaymentNotes, setDirectPaymentNotes] = useState("");
  const [confirmingDirectPayment, setConfirmingDirectPayment] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);

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
  const [patientSearchQuery, setPatientSearchQuery] = useState("");
  const [patientSearchResults, setPatientSearchResults] = useState<Patient[]>(
    [],
  );
  const [isSearchingPatient, setIsSearchingPatient] = useState(false);
  const [showCreatePatient, setShowCreatePatient] = useState(true); // Default to create new patient
  const [newPatient, setNewPatient] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    age: "",
    gender: "",
  });
  const [patientNotes, setPatientNotes] = useState(""); // Patient notes for booking

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
    if (selectedClinician) {
      fetchAvailabilityRange();
    }
  }, [selectedClinician]);

  const fetchCentres = async () => {
    try {
      const data = await centreService.getCentres();

      // Filter centres for front desk staff
      if (isFrontDesk && assignedCentreId) {
        // Convert to string for type consistency
        const centreIdStr = String(assignedCentreId);
        const filteredCentres = data.filter(
          (centre) => String(centre.id) === centreIdStr,
        );
        setCentres(filteredCentres);
        // Auto-select the assigned centre for front desk staff
        setSelectedCentre(centreIdStr);
      } else {
        setCentres(data);
      }
    } catch (error: any) {
      toast.error("Failed to fetch centres");
    }
  };

  const fetchClinicians = async (centreId: string) => {
    try {
      const data = await clinicianService.getClinicians({
        centreId,
        isActive: true,
      });
      setClinicians(data);
    } catch (error: any) {
      toast.error("Failed to fetch clinicians");
    }
  };

  const fetchPatients = async () => {
    try {
      const data = await patientService.getPatients();
      setPatients(data);
      console.log(`✅ Loaded ${data.length} patients for search`);
    } catch (error: any) {
      console.error("Failed to fetch patients:", error);
      toast.error("Failed to fetch patients");
    }
  };

  const searchPatients = async (query: string) => {
    if (!query.trim()) {
      setPatientSearchResults([]);
      return;
    }

    setIsSearchingPatient(true);
    try {
      const searchQuery = query.toLowerCase().trim();

      console.log(
        `🔍 Searching for: "${searchQuery}" in ${patients.length} patients`,
      );

      // Search in the already loaded patients list
      const filtered = patients.filter((p) => {
        // Search by full name (case-insensitive, partial match)
        const nameMatch = p.fullName.toLowerCase().includes(searchQuery);

        // Search by phone (remove spaces and special characters for comparison)
        const patientPhone = p.phone.replace(/[\s\-\(\)]/g, "");
        const queryPhone = searchQuery.replace(/[\s\-\(\)]/g, "");
        const phoneMatch = patientPhone.includes(queryPhone);

        // Search by email (case-insensitive)
        const emailMatch =
          p.email && p.email.toLowerCase().includes(searchQuery);

        // Search by MRN (case-insensitive)
        const mrnMatch = p.mrn && p.mrn.toLowerCase().includes(searchQuery);

        return nameMatch || phoneMatch || emailMatch || mrnMatch;
      });

      console.log(
        `✅ Found ${filtered.length} matching patients:`,
        filtered.map((p) => p.fullName),
      );

      setPatientSearchResults(filtered);
    } catch (error: any) {
      console.error("Search error:", error);
      toast.error("Failed to search patients");
    } finally {
      setIsSearchingPatient(false);
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient.userId);
    setPatientSearchQuery(""); // Clear search query after selection
    setPatientSearchResults([]);
  };

  const fetchAvailabilityRange = async () => {
    try {
      setLoading(true);

      // Fetch slots for next 60 days to show dots on calendar
      const today = new Date();
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + 60);

      const startDateStr = today.toISOString().split("T")[0];
      const endDateStr = endDate.toISOString().split("T")[0];

      // Use the clinician-slots endpoint that returns slots for a date range
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"}/booking/clinician-slots?clinicianId=${selectedClinician}&startDate=${startDateStr}&endDate=${endDateStr}&centreId=${selectedCentre}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        },
      );

      if (response.ok) {
        const result = await response.json();
        const slotsData = result.data || [];
        setSlots(slotsData);
      } else {
        setSlots([]);
      }
    } catch (error: any) {
      console.error("Failed to fetch availability range:", error);
      setSlots([]);
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
    if (currentStep === 5 && !selectedPatient && !newPatient.firstName) {
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
      setPhoneError(null); // Clear any previous error

      // Create patient if new
      let patientId = selectedPatient;
      if (!patientId && newPatient.firstName) {
        const fullName =
          `${newPatient.firstName} ${newPatient.lastName}`.trim();
        try {
          const patient = await patientService.createPatient({
            fullName: fullName,
            phone: newPatient.phone,
            email: newPatient.email || undefined,
            dateOfBirth: newPatient.age
              ? new Date(
                  new Date().getFullYear() - parseInt(newPatient.age),
                  0,
                  1,
                )
                  .toISOString()
                  .split("T")[0]
              : undefined,
            gender: newPatient.gender
              ? (newPatient.gender as "male" | "female" | "other")
              : undefined,
          });
          patientId = patient.userId;
        } catch (patientError: any) {
          // Check if it's a duplicate phone error
          if (
            patientError.response?.status === 409 ||
            patientError.response?.data?.message?.includes(
              "phone number already exists",
            )
          ) {
            setPhoneError(
              "This phone number is already registered. Please search for existing patient or use a different number.",
            );
            setLoading(false);
            return;
          }
          // Re-throw other errors
          throw patientError;
        }
      }

      if (!selectedSlot) {
        toast.error("No slot selected");
        return;
      }

      // Book appointment (status will be BOOKED, waiting for payment)
      const appointment = await appointmentService.createAppointment({
        patient_id: parseInt(patientId),
        clinician_id: parseInt(selectedClinician),
        centre_id: parseInt(selectedCentre),
        appointment_type: sessionType,
        scheduled_start_at: new Date(
          `${selectedSlot.date}T${selectedSlot.startTime}`,
        ).toISOString(),
        duration_minutes:
          parseInt(selectedSlot.endTime.split(":")[0]) * 60 +
          parseInt(selectedSlot.endTime.split(":")[1]) -
          (parseInt(selectedSlot.startTime.split(":")[0]) * 60 +
            parseInt(selectedSlot.startTime.split(":")[1])),
        patient_notes: patientNotes, // Use patient_notes field instead of notes
      });

      // Send payment link to patient
      await appointmentService.sendPaymentLink(
        typeof appointment.id === "string"
          ? parseInt(appointment.id)
          : appointment.id,
      );

      toast.success(
        "Appointment booked successfully! Payment link sent to patient via WhatsApp.",
      );

      // Reset form
      resetForm();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to book appointment",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDirectPaymentSubmit = async () => {
    try {
      setConfirmingDirectPayment(true);
      setPhoneError(null); // Clear any previous error

      // Create patient if new
      let patientId = selectedPatient;
      if (!patientId && newPatient.firstName) {
        const fullName =
          `${newPatient.firstName} ${newPatient.lastName}`.trim();
        try {
          const patient = await patientService.createPatient({
            fullName: fullName,
            phone: newPatient.phone,
            email: newPatient.email || undefined,
            dateOfBirth: newPatient.age
              ? new Date(
                  new Date().getFullYear() - parseInt(newPatient.age),
                  0,
                  1,
                )
                  .toISOString()
                  .split("T")[0]
              : undefined,
            gender: newPatient.gender
              ? (newPatient.gender as "male" | "female" | "other")
              : undefined,
          });
          patientId = patient.userId;
        } catch (patientError: any) {
          // Check if it's a duplicate phone error
          if (
            patientError.response?.status === 409 ||
            patientError.response?.data?.message?.includes(
              "phone number already exists",
            )
          ) {
            setPhoneError(
              "This phone number is already registered. Please search for existing patient or use a different number.",
            );
            setConfirmingDirectPayment(false);
            setShowDirectPaymentModal(false);
            return;
          }
          // Re-throw other errors
          throw patientError;
        }
      }

      if (!selectedSlot) {
        toast.error("No slot selected");
        return;
      }

      // Book appointment
      const appointment = await appointmentService.createAppointment({
        patient_id: parseInt(patientId),
        clinician_id: parseInt(selectedClinician),
        centre_id: parseInt(selectedCentre),
        appointment_type: sessionType,
        scheduled_start_at: new Date(
          `${selectedSlot.date}T${selectedSlot.startTime}`,
        ).toISOString(),
        duration_minutes:
          parseInt(selectedSlot.endTime.split(":")[0]) * 60 +
          parseInt(selectedSlot.endTime.split(":")[1]) -
          (parseInt(selectedSlot.startTime.split(":")[0]) * 60 +
            parseInt(selectedSlot.startTime.split(":")[1])),
        patient_notes: patientNotes,
      });

      // Confirm direct payment
      await appointmentService.confirmDirectPayment(
        typeof appointment.id === "string"
          ? parseInt(appointment.id)
          : appointment.id,
        directPaymentMethod,
        directPaymentNotes,
      );

      toast.success(
        `Appointment confirmed with ${directPaymentMethod} payment!`,
      );
      setShowDirectPaymentModal(false);

      // Reset form
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to confirm payment");
    } finally {
      setConfirmingDirectPayment(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setSelectedCentre("");
    setSelectedClinician("");
    setSelectedDate("");
    setSelectedSlot(null);
    setSessionType("IN_PERSON");
    setSelectedPatient("");
    setPatientSearchQuery("");
    setPatientSearchResults([]);
    setShowCreatePatient(true);
    setNewPatient({
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      age: "",
      gender: "",
    });
    setPatientNotes("");
    setDirectPaymentNotes("");
    setPhoneError(null); // Clear phone error on reset
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
            {isFrontDesk && assignedCentreId ? (
              <div className="p-4 rounded-lg border-2 border-miboTeal bg-miboTeal/10">
                <div className="font-medium text-white mb-1">
                  {centres.find((c) => c.id === assignedCentreId)?.name}
                </div>
                <div className="text-sm text-slate-400 capitalize">
                  {centres.find((c) => c.id === assignedCentreId)?.city}
                </div>
                <div className="text-sm text-slate-400 mt-2">
                  {centres.find((c) => c.id === assignedCentreId)?.address}
                </div>
                <div className="text-xs text-miboTeal mt-3">
                  ✓ Your assigned centre (automatically selected)
                </div>
              </div>
            ) : (
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
            )}
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
                    {clinician.fullName}
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
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Patient Details
              </h3>
              {/* Toggle buttons */}
              <div className="flex gap-2">
                <Button
                  variant={showCreatePatient ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => {
                    setShowCreatePatient(true);
                    setSelectedPatient("");
                    setPatientSearchQuery("");
                    setPatientSearchResults([]);
                  }}
                >
                  <User size={16} />
                  Create New Patient
                </Button>
                <Button
                  variant={!showCreatePatient ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => {
                    setShowCreatePatient(false);
                    setNewPatient({
                      firstName: "",
                      lastName: "",
                      phone: "",
                      email: "",
                      age: "",
                      gender: "",
                    });
                  }}
                >
                  <Search size={16} />
                  Search Existing
                </Button>
              </div>
            </div>

            {showCreatePatient ? (
              /* Create New Patient Form */
              <div className="space-y-4">
                <div className="p-4 bg-miboTeal/10 border border-miboTeal/30 rounded-lg">
                  <div className="flex items-center gap-2 text-miboTeal">
                    <User size={16} />
                    <span className="text-sm font-medium">
                      Creating new patient record
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    type="text"
                    placeholder="Enter first name"
                    value={newPatient.firstName}
                    onChange={(e) =>
                      setNewPatient({
                        ...newPatient,
                        firstName: e.target.value,
                      })
                    }
                    required
                  />
                  <Input
                    label="Last Name"
                    type="text"
                    placeholder="Enter last name"
                    value={newPatient.lastName}
                    onChange={(e) =>
                      setNewPatient({ ...newPatient, lastName: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    {phoneError && (
                      <div className="mb-2 p-2 bg-red-500/20 border border-red-500 rounded text-red-200 text-xs flex items-center gap-2">
                        <AlertCircle size={14} />
                        {phoneError}
                      </div>
                    )}
                    <Input
                      label="Phone Number"
                      type="tel"
                      placeholder="+91 9876543210"
                      value={newPatient.phone}
                      onChange={(e) => {
                        setNewPatient({ ...newPatient, phone: e.target.value });
                        setPhoneError(null); // Clear error when user types
                      }}
                      required
                    />
                  </div>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Age (Optional)"
                    type="number"
                    placeholder="Enter age"
                    min="0"
                    max="150"
                    value={newPatient.age}
                    onChange={(e) =>
                      setNewPatient({ ...newPatient, age: e.target.value })
                    }
                  />
                  <Select
                    label="Gender (Optional)"
                    value={newPatient.gender}
                    onChange={(e) =>
                      setNewPatient({ ...newPatient, gender: e.target.value })
                    }
                    options={[
                      { value: "", label: "Select gender" },
                      { value: "male", label: "Male" },
                      { value: "female", label: "Female" },
                      { value: "other", label: "Other" },
                    ]}
                  />
                </div>
              </div>
            ) : (
              /* Search Existing Patient */
              <div className="space-y-4">
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-400">
                    <Search size={16} />
                    <span className="text-sm font-medium">
                      Search by name, phone, email, or MRN
                    </span>
                  </div>
                </div>

                <div className="relative">
                  <div className="relative">
                    <Search
                      size={20}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                    />
                    <Input
                      type="text"
                      placeholder="Search patients by name, phone, email, or MRN..."
                      value={patientSearchQuery}
                      onChange={(e) => {
                        setPatientSearchQuery(e.target.value);
                        searchPatients(e.target.value);
                      }}
                      className="pl-10"
                    />
                  </div>

                  {/* Search Results Dropdown */}
                  {patientSearchQuery && patientSearchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-2 bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-h-80 overflow-y-auto">
                      {patientSearchResults.map((patient) => (
                        <button
                          key={patient.userId}
                          onClick={() => handlePatientSelect(patient)}
                          className="w-full p-4 text-left hover:bg-slate-700 transition-colors border-b border-slate-700 last:border-b-0"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-white">
                                {patient.fullName}
                              </div>
                              <div className="text-sm text-slate-400 mt-1">
                                Phone: {patient.phone}
                              </div>
                              {patient.email && (
                                <div className="text-sm text-slate-400">
                                  Email: {patient.email}
                                </div>
                              )}
                              {patient.mrn && (
                                <div className="text-sm text-slate-500">
                                  MRN: {patient.mrn}
                                </div>
                              )}
                            </div>
                            <ChevronRight
                              size={20}
                              className="text-slate-400"
                            />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {patientSearchQuery &&
                    !isSearchingPatient &&
                    patientSearchResults.length === 0 && (
                      <div className="absolute z-10 w-full mt-2 bg-slate-800 border border-slate-600 rounded-lg shadow-xl p-4">
                        <div className="text-slate-400 text-center">
                          No patients found matching "{patientSearchQuery}"
                        </div>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setShowCreatePatient(true)}
                          className="w-full mt-3"
                        >
                          Create New Patient Instead
                        </Button>
                      </div>
                    )}
                </div>

                {/* Selected Patient Display */}
                {selectedPatient && (
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-green-400 mb-2">
                          <Check size={16} />
                          <span className="text-sm font-medium">
                            Patient Selected
                          </span>
                        </div>
                        <div className="text-white font-medium">
                          {
                            patients.find((p) => p.userId === selectedPatient)
                              ?.fullName
                          }
                        </div>
                        <div className="text-sm text-slate-400 mt-1">
                          {
                            patients.find((p) => p.userId === selectedPatient)
                              ?.phone
                          }
                        </div>
                        {patients.find((p) => p.userId === selectedPatient)
                          ?.email && (
                          <div className="text-sm text-slate-400">
                            {
                              patients.find((p) => p.userId === selectedPatient)
                                ?.email
                            }
                          </div>
                        )}
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSelectedPatient("");
                          setPatientSearchQuery("");
                        }}
                      >
                        <X size={16} />
                        Change
                      </Button>
                    </div>
                  </div>
                )}
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
                  {selectedClinicianData?.fullName}
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
                    ? patients.find((p) => p.userId === selectedPatient)
                        ?.fullName
                    : `${newPatient.firstName} ${newPatient.lastName}`.trim()}
                </div>
                {!selectedPatient && newPatient.phone && (
                  <div className="text-sm text-slate-400">
                    {newPatient.phone}
                  </div>
                )}
                {!selectedPatient && newPatient.age && (
                  <div className="text-sm text-slate-400">
                    Age: {newPatient.age}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Patient Notes (Optional)
              </label>
              <textarea
                value={patientNotes}
                onChange={(e) => setPatientNotes(e.target.value)}
                placeholder="Add any notes about the patient's needs, conditions, or special requirements..."
                rows={3}
                maxLength={500}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-miboTeal"
              />
              <p className="text-xs text-slate-400 mt-1">
                These notes will be visible to the clinician before the
                appointment ({patientNotes.length}/500)
              </p>
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
            <div className="flex-1 flex flex-col gap-3">
              <Button
                variant="primary"
                onClick={handleSubmit}
                loading={loading}
                className="w-full"
              >
                Confirm: Send Payment Link
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowDirectPaymentModal(true)}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white border-green-600"
              >
                Confirm: Pay via Cash/Card/UPI
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Direct Payment Modal */}
      {showDirectPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">
              Confirm Direct Payment
            </h3>
            <p className="text-slate-300 mb-6">
              Patient is paying directly. Select payment method and confirm:
            </p>

            <div className="space-y-3 mb-6">
              <button
                onClick={() => setDirectPaymentMethod("CASH")}
                className={`
                  w-full p-4 rounded-lg border-2 text-left transition-all
                  ${
                    directPaymentMethod === "CASH"
                      ? "border-miboTeal bg-miboTeal/10 text-white"
                      : "border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500"
                  }
                `}
              >
                <div className="font-semibold">💵 Cash Payment</div>
                <div className="text-sm text-slate-400">
                  Patient paid in cash at front desk
                </div>
              </button>

              <button
                onClick={() => setDirectPaymentMethod("CARD")}
                className={`
                  w-full p-4 rounded-lg border-2 text-left transition-all
                  ${
                    directPaymentMethod === "CARD"
                      ? "border-miboTeal bg-miboTeal/10 text-white"
                      : "border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500"
                  }
                `}
              >
                <div className="font-semibold">💳 Card Payment</div>
                <div className="text-sm text-slate-400">
                  Patient paid via debit/credit card
                </div>
              </button>

              <button
                onClick={() => setDirectPaymentMethod("UPI")}
                className={`
                  w-full p-4 rounded-lg border-2 text-left transition-all
                  ${
                    directPaymentMethod === "UPI"
                      ? "border-miboTeal bg-miboTeal/10 text-white"
                      : "border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500"
                  }
                `}
              >
                <div className="font-semibold">📱 UPI Payment</div>
                <div className="text-sm text-slate-400">
                  Patient paid via UPI (PhonePe, Google Pay, etc.)
                </div>
              </button>
            </div>

            {/* Payment Notes Field */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Payment Notes (Optional)
              </label>
              <textarea
                value={directPaymentNotes}
                onChange={(e) => setDirectPaymentNotes(e.target.value)}
                placeholder="Add any remarks or notes about this payment..."
                rows={3}
                maxLength={500}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-miboTeal resize-none"
              />
              <p className="text-xs text-slate-400 mt-1">
                {directPaymentNotes.length}/500 characters
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowDirectPaymentModal(false)}
                disabled={confirmingDirectPayment}
                className="flex-1"
              >
                Close
              </Button>
              <Button
                variant="primary"
                onClick={handleDirectPaymentSubmit}
                loading={confirmingDirectPayment}
                className="flex-1"
              >
                Confirm Payment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookAppointmentPage;
