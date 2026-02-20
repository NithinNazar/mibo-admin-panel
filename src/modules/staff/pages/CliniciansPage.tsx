import React, { useState, useEffect } from "react";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Table from "../../../components/ui/Table";
import Modal from "../../../components/ui/Modal";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Badge from "../../../components/ui/Badge";
import MultiSelect from "../../../components/ui/MultiSelect";
import ProfilePictureUpload from "../../../components/ui/ProfilePictureUpload";
import { LoadingOverlay } from "../../../components/ui/LoadingOverlay";
import { CalendarPicker } from "../../../components/ui/CalendarPicker";
import { TimeSlider } from "../../../components/ui/TimeSlider";
import { FieldLockInput } from "../../../components/ui/FieldLockInput";
import AvailabilityScheduleBuilder, {
  type AvailabilitySlot,
} from "../../../components/ui/AvailabilityScheduleBuilder";
import { Plus, Edit, DollarSign, Award, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import clinicianService from "../../../services/clinicianService";
import centreService from "../../../services/centreService";
import type { Clinician, Centre } from "../../../types";

// Indian Languages
const INDIAN_LANGUAGES = [
  "English",
  "Hindi",
  "Malayalam",
  "Tamil",
  "Telugu",
  "Kannada",
  "Marathi",
  "Bengali",
  "Gujarati",
  "Punjabi",
  "Odia",
  "Urdu",
  "Assamese",
];

// Common Specializations (extracted from static data)
const SPECIALIZATIONS = [
  "Clinical Psychologist",
  "Psychiatrist",
  "Counselling Psychologist",
  "Clinical Hypnotherapist",
  "Consultant Psychiatrist",
  "Consultant Child & Adolescent Psychiatrist",
  "Therapist",
  "Counselor",
  "Academic & Psychotherapist",
];

// Common Qualifications
const QUALIFICATIONS = [
  "MBBS",
  "MD",
  "DPM",
  "DNB",
  "M.Phil",
  "M.Sc",
  "Ph.D.",
  "MRCPsych",
  "PDF",
  "DM",
  "PGDFM",
];

// Common Expertise Areas
const EXPERTISE_AREAS = [
  "Anxiety Disorders",
  "Depression",
  "Trauma & PTSD",
  "Stress Management",
  "Relationship Issues",
  "Family Therapy",
  "Child Psychology",
  "Adolescent Counseling",
  "Addiction Counseling",
  "Grief Counseling",
  "OCD",
  "Bipolar Disorder",
  "Schizophrenia",
  "Eating Disorders",
  "Sleep Disorders",
  "Anger Management",
  "Career Counseling",
  "LGBTQ+ Issues",
];

const CliniciansPage: React.FC = () => {
  const [clinicians, setClinicians] = useState<Clinician[]>([]);
  const [centres, setCentres] = useState<Centre[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedClinician, setSelectedClinician] = useState<Clinician | null>(
    null,
  );
  const [editingClinician, setEditingClinician] = useState<Clinician | null>(
    null,
  );
  const [isEditingDetails, setIsEditingDetails] = useState(false);

  // Calendar and time slot state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("09:00");
  const [sessionLength, setSessionLength] = useState<number>(30);
  const [timeSlotsByDate, setTimeSlotsByDate] = useState<Map<string, string[]>>(
    new Map(),
  );

  // Field locking state
  const [lockedFields, setLockedFields] = useState<Set<string>>(new Set());

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  const [detailsFormData, setDetailsFormData] = useState({
    primaryCentreId: 0,
    specialization: [] as string[],
    registrationNumber: "",
    yearsOfExperience: 0,
    consultationFee: 0,
    bio: "",
    consultationModes: [] as string[],
    defaultDurationMinutes: 30,
    profilePictureUrl: "",
    qualification: [] as string[],
    expertise: [] as string[],
    languages: [] as string[],
    availabilitySlots: [] as AvailabilitySlot[],
  });
  const [formData, setFormData] = useState({
    // User fields
    full_name: "",
    phone: "",
    email: "",
    username: "",
    password: "",
    // Clinician fields
    userId: 0,
    primaryCentreId: 0,
    specialization: [] as string[], // Changed to array
    registrationNumber: "",
    yearsOfExperience: 0,
    consultationFee: 0,
    bio: "",
    consultationModes: ["IN_PERSON"] as string[],
    defaultDurationMinutes: 30,
    profilePictureUrl: "",
    designation: "",
    // New fields
    qualification: [] as string[], // Changed to array
    expertise: [] as string[],
    languages: [] as string[],
    availabilitySlots: [] as AvailabilitySlot[],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cliniciansData, centresData] = await Promise.all([
        clinicianService.getClinicians(),
        centreService.getCentres(),
      ]);
      setClinicians(cliniciansData);
      setCentres(centresData);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (clinician?: Clinician) => {
    if (clinician) {
      setEditingClinician(clinician);
      setFormData({
        full_name: "",
        phone: "",
        email: "",
        username: "",
        password: "",
        userId: parseInt(clinician.userId),
        primaryCentreId: parseInt(clinician.primaryCentreId),
        specialization: Array.isArray(clinician.specialization)
          ? clinician.specialization
          : clinician.specialization
            ? [clinician.specialization as any]
            : [],
        registrationNumber: clinician.registrationNumber,
        yearsOfExperience: clinician.yearsOfExperience,
        consultationFee: clinician.consultationFee,
        bio: clinician.bio || "",
        consultationModes: clinician.consultationModes || [],
        defaultDurationMinutes: clinician.defaultDurationMinutes,
        profilePictureUrl: clinician.profilePictureUrl || "",
        designation: clinician.designation || "",
        qualification: Array.isArray(clinician.qualification)
          ? clinician.qualification
          : clinician.qualification
            ? [clinician.qualification as any]
            : [],
        expertise: clinician.expertise || [],
        languages: clinician.languages || [],
        availabilitySlots: [],
      });
    } else {
      setEditingClinician(null);
      setFormData({
        // User fields
        full_name: "",
        phone: "",
        email: "",
        username: "",
        password: "",
        // Clinician fields
        userId: 0,
        primaryCentreId: centres[0]?.id ? parseInt(centres[0].id) : 0,
        specialization: [],
        registrationNumber: "",
        yearsOfExperience: 0,
        consultationFee: 0,
        bio: "",
        consultationModes: ["IN_PERSON"],
        defaultDurationMinutes: 30,
        profilePictureUrl: "",
        designation: "",
        qualification: [],
        expertise: [],
        languages: [],
        availabilitySlots: [],
      });
      // Reset calendar state
      setSelectedDate(null);
      setSelectedTime("09:00");
      setSessionLength(30);
      setTimeSlotsByDate(new Map());
      setLockedFields(new Set());
    }
    setIsModalOpen(true);
  };

  // Validation functions
  const validatePhone = (phone: string): string | null => {
    if (!phone) return "Phone number is required";
    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanPhone = phone.trim().replace(/\D/g, "");
    if (!phoneRegex.test(cleanPhone)) {
      return "Invalid phone number. Must be 10 digits starting with 6-9";
    }
    return null;
  };

  const validateEmail = (email: string): string | null => {
    if (!email || email.trim() === "") return null; // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Invalid email format";
    }
    return null;
  };

  const validateConsultationFee = (fee: number): string | null => {
    if (fee === undefined || fee === null)
      return "Consultation fee is required";
    if (fee <= 0) {
      return "Consultation fee must be a positive number";
    }
    return null;
  };

  const validateYearsOfExperience = (years: number): string | null => {
    if (years === undefined || years === null) return null; // Optional
    if (years < 0) {
      return "Years of experience cannot be negative";
    }
    return null;
  };

  const validateArrayField = (
    arr: string[],
    fieldName: string,
  ): string | null => {
    if (!arr || !Array.isArray(arr) || arr.length === 0) {
      return `${fieldName} must have at least one value`;
    }
    return null;
  };

  // Validate all fields
  const validateAllFields = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!editingClinician) {
      // Validate phone
      const phoneError = validatePhone(formData.phone);
      if (phoneError) errors.phone = phoneError;

      // Validate email
      const emailError = validateEmail(formData.email);
      if (emailError) errors.email = emailError;

      // Validate full name
      if (!formData.full_name || formData.full_name.trim() === "") {
        errors.full_name = "Full name is required";
      }

      // Validate password
      if (!formData.password || formData.password.length < 8) {
        errors.password = "Password must be at least 8 characters";
      }
    }

    // Validate consultation fee
    const feeError = validateConsultationFee(formData.consultationFee);
    if (feeError) errors.consultationFee = feeError;

    // Validate years of experience
    const yearsError = validateYearsOfExperience(formData.yearsOfExperience);
    if (yearsError) errors.yearsOfExperience = yearsError;

    // Validate specialization
    const specializationError = validateArrayField(
      formData.specialization,
      "Specialization",
    );
    if (specializationError) errors.specialization = specializationError;

    // Validate qualification
    const qualificationError = validateArrayField(
      formData.qualification,
      "Qualification",
    );
    if (qualificationError) errors.qualification = qualificationError;

    // Validate languages
    const languagesError = validateArrayField(formData.languages, "Languages");
    if (languagesError) errors.languages = languagesError;

    // Validate consultation modes
    if (
      !formData.consultationModes ||
      formData.consultationModes.length === 0
    ) {
      errors.consultationModes = "At least one consultation mode is required";
    }

    // Validate primary centre
    if (!formData.primaryCentreId || formData.primaryCentreId === 0) {
      errors.primaryCentreId = "Primary centre is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Clear error for a specific field
  const clearFieldError = (fieldName: string) => {
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  // Toggle field lock
  const toggleFieldLock = (fieldName: string) => {
    const newLockedFields = new Set(lockedFields);
    if (newLockedFields.has(fieldName)) {
      newLockedFields.delete(fieldName);
    } else {
      newLockedFields.add(fieldName);
    }
    setLockedFields(newLockedFields);
  };

  // Check if form is valid for submission (based on validation, not locking)
  const isFormValid = (): boolean => {
    if (editingClinician) return true; // Skip for edit mode

    // Check if all required fields have values
    const hasRequiredValues =
      formData.full_name.trim() !== "" &&
      formData.phone.trim() !== "" &&
      formData.password.length >= 8 &&
      formData.primaryCentreId > 0 &&
      formData.consultationFee > 0 &&
      formData.yearsOfExperience >= 0 &&
      formData.specialization.length > 0 &&
      formData.qualification.length > 0 &&
      formData.languages.length > 0 &&
      formData.consultationModes.length > 0;

    return hasRequiredValues;
  };

  // Handle date selection from calendar
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  // Handle time change from time slider
  const handleTimeChange = (time: string) => {
    setSelectedTime(time);
  };

  const formattedDate = (date: Date): string => {
    if (!date) return "";
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return formattedDate;
  };

  // Add time slot for selected date
  const handleAddTimeSlot = () => {
    if (!selectedDate) {
      toast.error("Please select a date first");
      return;
    }

    const dateKey = formattedDate(selectedDate);
    const currentSlots = timeSlotsByDate.get(dateKey) || [];

    // Check if time already exists for this date
    if (currentSlots.includes(selectedTime)) {
      toast.error("This time slot already exists for the selected date");
      return;
    }

    // Check for overlapping time ranges
    const [startHours, startMinutes] = selectedTime.split(":").map(Number);
    const startMinutesTotal = startHours * 60 + startMinutes;
    const endMinutesTotal = startMinutesTotal + sessionLength;

    for (const existingTime of currentSlots) {
      const [existingHours, existingMinutes] = existingTime
        .split(":")
        .map(Number);
      const existingStartMinutes = existingHours * 60 + existingMinutes;
      const existingEndMinutes = existingStartMinutes + sessionLength;

      // Check for overlap
      // Two time ranges overlap if:
      // 1. New start time is between existing start and end
      // 2. New end time is between existing start and end
      // 3. New range completely contains existing range
      // 4. Existing range completely contains new range
      const overlaps =
        (startMinutesTotal >= existingStartMinutes &&
          startMinutesTotal < existingEndMinutes) ||
        (endMinutesTotal > existingStartMinutes &&
          endMinutesTotal <= existingEndMinutes) ||
        (startMinutesTotal <= existingStartMinutes &&
          endMinutesTotal >= existingEndMinutes) ||
        (existingStartMinutes <= startMinutesTotal &&
          existingEndMinutes >= endMinutesTotal);

      if (overlaps) {
        // Format times for display
        const formatTime = (minutes: number) => {
          const h = Math.floor(minutes / 60);
          const m = minutes % 60;
          const period = h >= 12 ? "PM" : "AM";
          const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
          return `${h12}:${String(m).padStart(2, "0")} ${period}`;
        };

        toast.error(
          `Time slot overlaps with existing slot: ${formatTime(existingStartMinutes)} - ${formatTime(existingEndMinutes)}`,
        );
        return;
      }
    }

    // Add the time slot
    const updatedSlots = [...currentSlots, selectedTime].sort();
    const newMap = new Map(timeSlotsByDate);
    newMap.set(dateKey, updatedSlots);
    setTimeSlotsByDate(newMap);

    toast.success("Time slot added");
  };

  // Remove time slot
  const handleRemoveTimeSlot = (dateKey: string, time: string) => {
    const currentSlots = timeSlotsByDate.get(dateKey) || [];
    const updatedSlots = currentSlots.filter((t) => t !== time);

    const newMap = new Map(timeSlotsByDate);
    if (updatedSlots.length === 0) {
      newMap.delete(dateKey);
    } else {
      newMap.set(dateKey, updatedSlots);
    }
    setTimeSlotsByDate(newMap);
    toast.success("Time slot removed");
  };

  // Convert calendar-based slots to API format
  const convertSlotsToAPIFormat = (): AvailabilitySlot[] => {
    const slots: AvailabilitySlot[] = [];

    timeSlotsByDate.forEach((times, dateKey) => {
      const date = new Date(dateKey);
      const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

      times.forEach((startTime) => {
        // Calculate end time
        const [hours, minutes] = startTime.split(":").map(Number);
        const startMinutes = hours * 60 + minutes;
        const endMinutes = startMinutes + sessionLength;
        const endHours = Math.floor(endMinutes / 60);
        const endMins = endMinutes % 60;
        const endTime = `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`;

        slots.push({
          id: `${dateKey}-${startTime}`,
          dayOfWeek: dayOfWeek,
          startTime: startTime,
          endTime: endTime,
          consultationMode: formData.consultationModes[0] || "IN_PERSON",
        });
      });
    });

    return slots;
  };

  // Get marked dates for calendar (dates that have slots)
  const getMarkedDates = (): Date[] => {
    return Array.from(timeSlotsByDate.keys()).map(
      (dateKey) => new Date(dateKey),
    );
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClinician(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    if (!validateAllFields()) {
      toast.error("Please fix all validation errors before submitting");
      return;
    }

    setIsCreating(true);

    try {
      if (editingClinician) {
        await clinicianService.updateClinician(editingClinician.id, {
          primaryCentreId: formData.primaryCentreId,
          specialization: formData.specialization,
          registrationNumber: formData.registrationNumber,
          yearsOfExperience: formData.yearsOfExperience,
          consultationFee: formData.consultationFee,
          bio: formData.bio,
          consultationModes: formData.consultationModes,
          defaultDurationMinutes: formData.defaultDurationMinutes,
          profilePictureUrl: formData.profilePictureUrl,
          qualification: formData.qualification,
          expertise: formData.expertise,
          languages: formData.languages,
        });
        toast.success("Clinician updated successfully");
      } else {
        // Convert calendar slots to API format
        const availabilitySlots = convertSlotsToAPIFormat();

        // Create new clinician with user data
        const createData = {
          full_name: formData.full_name,
          phone: formData.phone,
          email:
            formData.email && formData.email.trim() !== ""
              ? formData.email
              : undefined,
          username:
            formData.username && formData.username.trim() !== ""
              ? formData.username
              : undefined,
          password: formData.password,
          role_ids: [4], // Clinician role ID - IMPORTANT: Check your database for actual role ID
          centre_ids: [formData.primaryCentreId], // Required for user creation
          designation:
            formData.designation ||
            (Array.isArray(formData.specialization)
              ? formData.specialization[0]
              : "Clinician"),
          primary_centre_id: formData.primaryCentreId,
          specialization: formData.specialization,
          registration_number:
            formData.registrationNumber &&
            formData.registrationNumber.trim() !== ""
              ? formData.registrationNumber
              : undefined,
          years_of_experience: formData.yearsOfExperience,
          consultation_fee: formData.consultationFee,
          bio:
            formData.bio && formData.bio.trim() !== ""
              ? formData.bio
              : undefined,
          consultation_modes: formData.consultationModes,
          default_consultation_duration_minutes:
            formData.defaultDurationMinutes,
          profile_picture_url:
            formData.profilePictureUrl &&
            formData.profilePictureUrl.trim() !== ""
              ? formData.profilePictureUrl
              : undefined,
          qualification:
            formData.qualification.length > 0
              ? formData.qualification
              : undefined,
          expertise:
            formData.expertise.length > 0 ? formData.expertise : undefined,
          languages:
            formData.languages.length > 0 ? formData.languages : undefined,
          availability_slots:
            availabilitySlots.length > 0 ? availabilitySlots : undefined,
        };
        await clinicianService.createClinician(createData as any);
        toast.success("Clinician created successfully");
      }
      handleCloseModal();
      fetchData();
    } catch (error: any) {
      // The error message is already formatted by the service
      toast.error(error.message || "Operation failed");
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await clinicianService.toggleActive(id, isActive);
      toast.success(
        `Clinician ${isActive ? "activated" : "deactivated"} successfully`,
      );
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to update clinician status");
    }
  };

  const handleViewDetails = async (clinician: Clinician) => {
    try {
      const details = await clinicianService.getClinicianById(clinician.id);
      setSelectedClinician(details);
      setIsEditingDetails(false);

      // Initialize editable form data
      setDetailsFormData({
        primaryCentreId: parseInt(details.primaryCentreId),
        specialization: Array.isArray(details.specialization)
          ? details.specialization
          : details.specialization
            ? [details.specialization as any]
            : [],
        registrationNumber: details.registrationNumber || "",
        yearsOfExperience: details.yearsOfExperience || 0,
        consultationFee: details.consultationFee || 0,
        bio: details.bio || "",
        consultationModes: details.consultationModes || [],
        defaultDurationMinutes: details.defaultDurationMinutes || 30,
        profilePictureUrl: details.profilePictureUrl || "",
        qualification: Array.isArray(details.qualification)
          ? details.qualification
          : details.qualification
            ? [details.qualification as any]
            : [],
        expertise: details.expertise || [],
        languages: details.languages || [],
        availabilitySlots: [],
      });

      setShowDetailsModal(true);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch clinician details");
    }
  };

  const handleSaveDetails = async () => {
    if (!selectedClinician) return;

    try {
      await clinicianService.updateClinician(selectedClinician.id, {
        primaryCentreId: detailsFormData.primaryCentreId,
        specialization: detailsFormData.specialization,
        registrationNumber: detailsFormData.registrationNumber,
        yearsOfExperience: detailsFormData.yearsOfExperience,
        consultationFee: detailsFormData.consultationFee,
        bio: detailsFormData.bio,
        consultationModes: detailsFormData.consultationModes,
        defaultDurationMinutes: detailsFormData.defaultDurationMinutes,
        profilePictureUrl: detailsFormData.profilePictureUrl,
        qualification: detailsFormData.qualification,
        expertise: detailsFormData.expertise,
        languages: detailsFormData.languages,
      });

      toast.success("Clinician details updated successfully");
      setShowDetailsModal(false);
      setSelectedClinician(null);
      setIsEditingDetails(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to update clinician");
    }
  };

  const toggleConsultationMode = (mode: string) => {
    setFormData((prev) => ({
      ...prev,
      consultationModes: prev.consultationModes.includes(mode)
        ? prev.consultationModes.filter((m) => m !== mode)
        : [...prev.consultationModes, mode],
    }));
  };

  const toggleDetailsConsultationMode = (mode: string) => {
    setDetailsFormData((prev) => ({
      ...prev,
      consultationModes: prev.consultationModes.includes(mode)
        ? prev.consultationModes.filter((m) => m !== mode)
        : [...prev.consultationModes, mode],
    }));
  };

  const columns = [
    {
      key: "name",
      header: "Clinician",
      render: (clinician: Clinician) => (
        <div>
          <div className="font-medium text-white">{clinician.fullName}</div>
          <div className="text-sm text-slate-400">
            {Array.isArray(clinician.specialization) 
              ? clinician.specialization.join(", ") 
              : clinician.specialization || ""}
          </div>
        </div>
      ),
    },
    {
      key: "experience",
      header: "Experience",
      render: (clinician: Clinician) => (
        <div className="flex items-center gap-2">
          <Award size={16} className="text-slate-400" />
          <span className="text-slate-300">
            {clinician.yearsOfExperience} years
          </span>
        </div>
      ),
    },
    {
      key: "centre",
      header: "Primary Centre",
      render: (clinician: Clinician) => (
        <span className="text-slate-300">{clinician.primaryCentreName}</span>
      ),
    },
    {
      key: "fee",
      header: "Consultation Fee",
      render: (clinician: Clinician) => (
        <div className="flex items-center gap-2">
          <DollarSign size={16} className="text-slate-400" />
          <span className="text-slate-300">₹{clinician.consultationFee}</span>
        </div>
      ),
    },
    {
      key: "modes",
      header: "Modes",
      render: (clinician: Clinician) => (
        <div className="flex gap-1">
          {(clinician.consultationModes || []).map((mode) => (
            <span
              key={mode}
              className="px-2 py-1 rounded-full text-xs font-medium bg-miboTeal/20 text-miboTeal"
            >
              {mode === "IN_PERSON" ? "In-Person" : "Online"}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (clinician: Clinician) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            clinician.isActive
              ? "bg-green-500/20 text-green-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {clinician.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (clinician: Clinician) => (
        <div className="flex gap-2 items-center">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleViewDetails(clinician)}
          >
            View Details
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleOpenModal(clinician)}
          >
            <Edit size={16} />
          </Button>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={clinician.isActive}
              onChange={() =>
                handleToggleActive(clinician.id, !clinician.isActive)
              }
              className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-miboTeal focus:ring-miboTeal cursor-pointer"
            />
            <span className="text-xs text-slate-400">
              {clinician.isActive ? "Active" : "Inactive"}
            </span>
          </label>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Clinicians</h1>
          <p className="text-slate-400 mt-1">Manage doctors and therapists</p>
        </div>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          <Plus size={20} />
          Add Clinician
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="text-center py-8 text-slate-400">
            Loading clinicians...
          </div>
        ) : clinicians.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            No clinicians found. Add your first clinician to get started.
          </div>
        ) : (
          <Table
            columns={columns}
            data={clinicians}
            keyExtractor={(clinician) => clinician.id.toString()}
          />
        )}
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingClinician ? "Edit Clinician" : "Add New Clinician"}
        closeOnBackdropClick={false}
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-4 max-h-[70vh] overflow-y-auto pr-2"
        >
          {!editingClinician && (
            <>
              <div className="bg-slate-700/50 p-4 rounded-lg space-y-4 mb-4">
                <h3 className="text-sm font-semibold text-miboTeal mb-2">
                  User Information
                </h3>
                <FieldLockInput
                  label="Full Name"
                  type="text"
                  placeholder="Enter clinician's full name"
                  value={formData.full_name}
                  onChange={(value) => {
                    setFormData({
                      ...formData,
                      full_name: value as string,
                    });
                    clearFieldError("full_name");
                  }}
                  required
                  locked={lockedFields.has("full_name")}
                  onLockToggle={() => toggleFieldLock("full_name")}
                  error={validationErrors.full_name}
                />

                <FieldLockInput
                  label="Phone Number"
                  type="tel"
                  placeholder="10-digit phone number"
                  value={formData.phone}
                  onChange={(value) => {
                    setFormData({
                      ...formData,
                      phone: value as string,
                    });
                    clearFieldError("phone");
                  }}
                  required
                  locked={lockedFields.has("phone")}
                  onLockToggle={() => toggleFieldLock("phone")}
                  error={validationErrors.phone}
                />

                <Input
                  label="Email (Optional)"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    });
                    clearFieldError("email");
                  }}
                />
                {validationErrors.email && (
                  <p className="text-xs text-red-500 mt-1">
                    {validationErrors.email}
                  </p>
                )}

                <Input
                  label="Username (Optional)"
                  type="text"
                  placeholder="Choose a unique username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      username: e.target.value,
                    })
                  }
                />

                <FieldLockInput
                  label="Password"
                  type="text"
                  placeholder="Minimum 8 characters"
                  value={formData.password}
                  onChange={(value) => {
                    setFormData({
                      ...formData,
                      password: value as string,
                    });
                    clearFieldError("password");
                  }}
                  required
                  locked={lockedFields.has("password")}
                  onLockToggle={() => toggleFieldLock("password")}
                  error={validationErrors.password}
                />
              </div>
            </>
          )}

          <div
            className={
              !editingClinician
                ? "bg-slate-700/50 p-4 rounded-lg space-y-4"
                : "space-y-4"
            }
          >
            {!editingClinician && (
              <h3 className="text-sm font-semibold text-miboTeal mb-2">
                Professional Information
              </h3>
            )}

            <Select
              label="Primary Centre"
              value={formData.primaryCentreId.toString()}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  primaryCentreId: parseInt(e.target.value),
                });
                clearFieldError("primaryCentreId");
              }}
              options={
                centres.length > 0
                  ? centres.map((centre) => ({
                      value: centre.id,
                      label: centre.name,
                    }))
                  : [
                      {
                        value: "0",
                        label: "No centres available - Create one first",
                      },
                    ]
              }
              required
              disabled={centres.length === 0}
            />
            {validationErrors.primaryCentreId && (
              <p className="text-xs text-red-500 -mt-2">
                {validationErrors.primaryCentreId}
              </p>
            )}

            <MultiSelect
              label="Specialization"
              options={SPECIALIZATIONS}
              selectedValues={formData.specialization}
              onChange={(specialization) => {
                setFormData({ ...formData, specialization });
                clearFieldError("specialization");
              }}
              placeholder="Add specialization"
              required
            />
            {validationErrors.specialization && (
              <p className="text-xs text-red-500 -mt-2">
                {validationErrors.specialization}
              </p>
            )}

            {editingClinician && (
              <Input
                label="Registration Number (Legacy)"
                type="text"
                placeholder="Medical registration number"
                value={formData.registrationNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    registrationNumber: e.target.value,
                  })
                }
              />
            )}

            <FieldLockInput
              label="Years of Experience"
              type="number"
              placeholder="Enter years of experience"
              value={formData.yearsOfExperience || ""}
              onChange={(value) => {
                setFormData({
                  ...formData,
                  yearsOfExperience:
                    typeof value === "number"
                      ? value
                      : parseInt(value as string) || 0,
                });
                clearFieldError("yearsOfExperience");
              }}
              required
              locked={lockedFields.has("yearsOfExperience")}
              onLockToggle={() => toggleFieldLock("yearsOfExperience")}
              error={validationErrors.yearsOfExperience}
            />

            <FieldLockInput
              label="Consultation Fee (₹)"
              type="number"
              placeholder="Enter consultation fee"
              value={formData.consultationFee || ""}
              onChange={(value) => {
                setFormData({
                  ...formData,
                  consultationFee:
                    typeof value === "number"
                      ? value
                      : parseFloat(value as string) || 0,
                });
                clearFieldError("consultationFee");
              }}
              required
              locked={lockedFields.has("consultationFee")}
              onLockToggle={() => toggleFieldLock("consultationFee")}
              error={validationErrors.consultationFee}
            />

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Consultation Modes
              </label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.consultationModes.includes("IN_PERSON")}
                    onChange={() => {
                      toggleConsultationMode("IN_PERSON");
                      clearFieldError("consultationModes");
                    }}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-miboTeal focus:ring-miboTeal"
                  />
                  <span className="text-slate-300">In-Person</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.consultationModes.includes("ONLINE")}
                    onChange={() => {
                      toggleConsultationMode("ONLINE");
                      clearFieldError("consultationModes");
                    }}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-miboTeal focus:ring-miboTeal"
                  />
                  <span className="text-slate-300">Online</span>
                </label>
              </div>
              {validationErrors.consultationModes && (
                <p className="text-xs text-red-500 mt-1">
                  {validationErrors.consultationModes}
                </p>
              )}
            </div>

            <Input
              label="Default Duration (minutes)"
              type="number"
              placeholder="Default consultation duration"
              value={formData.defaultDurationMinutes || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  defaultDurationMinutes: parseInt(e.target.value) || 30,
                })
              }
            />

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Bio (Optional)
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                placeholder="Brief description about the clinician"
                rows={3}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-miboTeal"
              />
            </div>

            <ProfilePictureUpload
              label="Profile Picture"
              value={formData.profilePictureUrl}
              onChange={(url) =>
                setFormData({ ...formData, profilePictureUrl: url })
              }
            />

            <MultiSelect
              label="Qualification"
              options={QUALIFICATIONS}
              selectedValues={formData.qualification}
              onChange={(qualification) => {
                setFormData({ ...formData, qualification });
                clearFieldError("qualification");
              }}
              placeholder="Add qualification"
              required
            />
            {validationErrors.qualification && (
              <p className="text-xs text-red-500 -mt-2">
                {validationErrors.qualification}
              </p>
            )}

            <MultiSelect
              label="Expertise"
              options={EXPERTISE_AREAS}
              selectedValues={formData.expertise}
              onChange={(expertise) => setFormData({ ...formData, expertise })}
              placeholder="Add area of expertise"
            />

            <MultiSelect
              label="Languages"
              options={INDIAN_LANGUAGES}
              selectedValues={formData.languages}
              onChange={(languages) => {
                setFormData({ ...formData, languages });
                clearFieldError("languages");
              }}
              placeholder="Add language"
              required
            />
            {validationErrors.languages && (
              <p className="text-xs text-red-500 -mt-2">
                {validationErrors.languages}
              </p>
            )}

            {/* Availability Schedule - Calendar + Time Slider */}
            <div className="space-y-4 bg-slate-700/30 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-miboTeal">
                Availability Schedule
              </h3>

              {/* Session Length */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Session Length (minutes)
                </label>
                <Input
                  type="number"
                  value={sessionLength}
                  onChange={(e) =>
                    setSessionLength(parseInt(e.target.value) || 30)
                  }
                  placeholder="30"
                />
              </div>

              {/* Calendar Picker */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Select Date
                </label>
                <CalendarPicker
                  selectedDate={selectedDate}
                  onDateSelect={handleDateSelect}
                  markedDates={getMarkedDates()}
                  minDate={new Date()}
                />
              </div>

              {/* Time Slider */}
              {selectedDate && (
                <div>
                  <TimeSlider
                    value={selectedTime}
                    onChange={handleTimeChange}
                    sessionLength={sessionLength}
                    label="Select Start Time"
                  />

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleAddTimeSlot}
                    className="mt-3 w-full"
                  >
                    <Plus size={16} />
                    Add Time Slot
                  </Button>
                </div>
              )}

              {/* Display Added Slots */}
              {timeSlotsByDate.size > 0 && (
                <div className="mt-4 space-y-3">
                  <h4 className="text-sm font-medium text-slate-300">
                    Added Time Slots (
                    {Array.from(timeSlotsByDate.values()).reduce(
                      (sum, slots) => sum + slots.length,
                      0,
                    )}{" "}
                    total)
                  </h4>
                  {Array.from(timeSlotsByDate.entries())
                    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                    .map(([dateKey, times]) => {
                      const date = new Date(dateKey);
                      const dayNames = [
                        "Sunday",
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                        "Saturday",
                      ];
                      const dayName = dayNames[date.getDay()];
                      const formattedDate = date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      });

                      return (
                        <div
                          key={dateKey}
                          className="bg-slate-700/50 p-3 rounded-lg"
                        >
                          <div className="text-sm font-medium text-miboTeal mb-2">
                            {dayName}, {formattedDate}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {times.map((time) => {
                              // Calculate end time
                              const [hours, minutes] = time
                                .split(":")
                                .map(Number);
                              const startMinutes = hours * 60 + minutes;
                              const endMinutes = startMinutes + sessionLength;
                              const endHours = Math.floor(endMinutes / 60);
                              const endMins = endMinutes % 60;
                              const endTime = `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`;

                              // Format for display (12-hour)
                              const formatTime12 = (time24: string) => {
                                const [h, m] = time24.split(":").map(Number);
                                const period = h >= 12 ? "PM" : "AM";
                                const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
                                return `${h12}:${String(m).padStart(2, "0")} ${period}`;
                              };

                              return (
                                <div
                                  key={time}
                                  className="flex items-center gap-2 bg-slate-600 px-3 py-1 rounded-md text-sm text-slate-200"
                                >
                                  <span>
                                    {formatTime12(time)} -{" "}
                                    {formatTime12(endTime)}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveTimeSlot(dateKey, time)
                                    }
                                    className="text-red-400 hover:text-red-300"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseModal}
              className="flex-1"
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={isCreating || !isFormValid()}
            >
              {editingClinician ? "Update" : "Create"} Clinician
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedClinician(null);
          setIsEditingDetails(false);
        }}
        title={
          isEditingDetails ? "Edit Clinician Details" : "Clinician Details"
        }
      >
        {selectedClinician && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            {!isEditingDetails ? (
              // View Mode
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Full Name
                  </label>
                  <div className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white">
                    {selectedClinician.fullName}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Specialization
                  </label>
                  <div className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white">
                    {Array.isArray(selectedClinician.specialization)
                      ? selectedClinician.specialization.join(", ")
                      : selectedClinician.specialization}
                  </div>
                </div>

                {selectedClinician.registrationNumber && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Registration Number
                    </label>
                    <div className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white">
                      {selectedClinician.registrationNumber}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Years of Experience
                  </label>
                  <div className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white">
                    {selectedClinician.yearsOfExperience} years
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Consultation Fee
                  </label>
                  <div className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white">
                    ₹{selectedClinician.consultationFee}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Primary Centre
                  </label>
                  <div className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white">
                    {selectedClinician.primaryCentreName}
                  </div>
                </div>

                {selectedClinician.qualification && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Qualification
                    </label>
                    <div className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white">
                      {Array.isArray(selectedClinician.qualification)
                        ? selectedClinician.qualification.join(", ")
                        : selectedClinician.qualification}
                    </div>
                  </div>
                )}

                {selectedClinician.expertise &&
                  selectedClinician.expertise.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Expertise
                      </label>
                      <div className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white">
                        {selectedClinician.expertise.join(", ")}
                      </div>
                    </div>
                  )}

                {selectedClinician.languages &&
                  selectedClinician.languages.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Languages
                      </label>
                      <div className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white">
                        {selectedClinician.languages.join(", ")}
                      </div>
                    </div>
                  )}

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Consultation Modes
                  </label>
                  <div className="flex gap-2">
                    {selectedClinician.consultationModes?.map((mode) => (
                      <span
                        key={mode}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-miboTeal/20 text-miboTeal"
                      >
                        {mode === "IN_PERSON" ? "In-Person" : "Online"}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedClinician.bio && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Bio
                    </label>
                    <div className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white">
                      {selectedClinician.bio}
                    </div>
                  </div>
                )}

                {selectedClinician.availabilityRules &&
                  selectedClinician.availabilityRules.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Availability Schedule
                      </label>
                      <div className="space-y-2">
                        {selectedClinician.availabilityRules.map(
                          (rule, index) => {
                            const dayNames = [
                              "Sunday",
                              "Monday",
                              "Tuesday",
                              "Wednesday",
                              "Thursday",
                              "Friday",
                              "Saturday",
                            ];
                            const dayName = dayNames[rule.dayOfWeek];

                            // Format time for display (12-hour)
                            const formatTime12 = (time24: string) => {
                              const [h, m] = time24.split(":").map(Number);
                              const period = h >= 12 ? "PM" : "AM";
                              const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
                              return `${h12}:${String(m).padStart(2, "0")} ${period}`;
                            };

                            return (
                              <div
                                key={index}
                                className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white flex items-center justify-between"
                              >
                                <div>
                                  <div className="font-medium">{dayName}</div>
                                  <div className="text-sm text-slate-400">
                                    {formatTime12(rule.startTime)} -{" "}
                                    {formatTime12(rule.endTime)}
                                  </div>
                                </div>
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-miboTeal/20 text-miboTeal">
                                  {rule.mode === "IN_PERSON"
                                    ? "In-Person"
                                    : "Online"}
                                </span>
                              </div>
                            );
                          },
                        )}
                      </div>
                    </div>
                  )}

                {selectedClinician.profilePictureUrl && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Profile Picture
                    </label>
                    <img
                      src={selectedClinician.profilePictureUrl}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Status
                  </label>
                  <Badge
                    variant={selectedClinician.isActive ? "success" : "danger"}
                  >
                    {selectedClinician.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedClinician(null);
                    }}
                    className="flex-1"
                  >
                    Close
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => setIsEditingDetails(true)}
                    className="flex-1"
                  >
                    Edit Details
                  </Button>
                </div>
              </>
            ) : (
              // Edit Mode
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveDetails();
                }}
                className="space-y-4"
              >
                <Select
                  label="Primary Centre"
                  value={detailsFormData.primaryCentreId.toString()}
                  onChange={(e) =>
                    setDetailsFormData({
                      ...detailsFormData,
                      primaryCentreId: parseInt(e.target.value),
                    })
                  }
                  options={
                    centres.length > 0
                      ? centres.map((centre) => ({
                          value: centre.id,
                          label: centre.name,
                        }))
                      : [
                          {
                            value: "0",
                            label: "No centres available",
                          },
                        ]
                  }
                  required
                />

                <MultiSelect
                  label="Specialization"
                  options={SPECIALIZATIONS}
                  selectedValues={detailsFormData.specialization}
                  onChange={(specialization) =>
                    setDetailsFormData({ ...detailsFormData, specialization })
                  }
                  placeholder="Add specialization"
                  required
                />

                <Input
                  label="Registration Number (Legacy)"
                  type="text"
                  placeholder="Medical registration number"
                  value={detailsFormData.registrationNumber}
                  onChange={(e) =>
                    setDetailsFormData({
                      ...detailsFormData,
                      registrationNumber: e.target.value,
                    })
                  }
                />

                <Input
                  label="Years of Experience"
                  type="number"
                  placeholder="Enter years of experience"
                  value={detailsFormData.yearsOfExperience || ""}
                  onChange={(e) =>
                    setDetailsFormData({
                      ...detailsFormData,
                      yearsOfExperience: parseInt(e.target.value) || 0,
                    })
                  }
                  required
                />

                <Input
                  label="Consultation Fee (₹)"
                  type="number"
                  placeholder="Enter consultation fee"
                  value={detailsFormData.consultationFee || ""}
                  onChange={(e) =>
                    setDetailsFormData({
                      ...detailsFormData,
                      consultationFee: parseFloat(e.target.value) || 0,
                    })
                  }
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Consultation Modes
                  </label>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={detailsFormData.consultationModes.includes(
                          "IN_PERSON",
                        )}
                        onChange={() =>
                          toggleDetailsConsultationMode("IN_PERSON")
                        }
                        className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-miboTeal focus:ring-miboTeal"
                      />
                      <span className="text-slate-300">In-Person</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={detailsFormData.consultationModes.includes(
                          "ONLINE",
                        )}
                        onChange={() => toggleDetailsConsultationMode("ONLINE")}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-miboTeal focus:ring-miboTeal"
                      />
                      <span className="text-slate-300">Online</span>
                    </label>
                  </div>
                </div>

                <Input
                  label="Default Duration (minutes)"
                  type="number"
                  placeholder="Default consultation duration"
                  value={detailsFormData.defaultDurationMinutes || ""}
                  onChange={(e) =>
                    setDetailsFormData({
                      ...detailsFormData,
                      defaultDurationMinutes: parseInt(e.target.value) || 30,
                    })
                  }
                />

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Bio (Optional)
                  </label>
                  <textarea
                    value={detailsFormData.bio}
                    onChange={(e) =>
                      setDetailsFormData({
                        ...detailsFormData,
                        bio: e.target.value,
                      })
                    }
                    placeholder="Brief description about the clinician"
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-miboTeal"
                  />
                </div>

                <ProfilePictureUpload
                  label="Profile Picture"
                  value={detailsFormData.profilePictureUrl}
                  onChange={(url) =>
                    setDetailsFormData({
                      ...detailsFormData,
                      profilePictureUrl: url,
                    })
                  }
                />

                <MultiSelect
                  label="Qualification"
                  options={QUALIFICATIONS}
                  selectedValues={detailsFormData.qualification}
                  onChange={(qualification) =>
                    setDetailsFormData({ ...detailsFormData, qualification })
                  }
                  placeholder="Add qualification"
                  required
                />

                <MultiSelect
                  label="Expertise"
                  options={EXPERTISE_AREAS}
                  selectedValues={detailsFormData.expertise}
                  onChange={(expertise) =>
                    setDetailsFormData({ ...detailsFormData, expertise })
                  }
                  placeholder="Add area of expertise"
                />

                <MultiSelect
                  label="Languages"
                  options={INDIAN_LANGUAGES}
                  selectedValues={detailsFormData.languages}
                  onChange={(languages) =>
                    setDetailsFormData({ ...detailsFormData, languages })
                  }
                  placeholder="Add language"
                  required
                />

                <AvailabilityScheduleBuilder
                  label="Availability Schedule"
                  slots={detailsFormData.availabilitySlots}
                  onChange={(availabilitySlots) =>
                    setDetailsFormData({
                      ...detailsFormData,
                      availabilitySlots,
                    })
                  }
                />

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsEditingDetails(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" className="flex-1">
                    Save Changes
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </Modal>

      {/* Loading Overlay */}
      <LoadingOverlay
        isVisible={isCreating}
        message={
          editingClinician ? "Updating clinician..." : "Creating clinician..."
        }
        minDisplayTime={3000}
      />
    </div>
  );
};

export default CliniciansPage;
