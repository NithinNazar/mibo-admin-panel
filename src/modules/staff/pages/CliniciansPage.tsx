import React, { useState, useEffect } from "react";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Table from "../../../components/ui/Table";
import Modal from "../../../components/ui/Modal";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Badge from "../../../components/ui/Badge";
import { Plus, Edit, DollarSign, Award, Copy, Check } from "lucide-react";
import toast from "react-hot-toast";
import clinicianService from "../../../services/clinicianService";
import centreService from "../../../services/centreService";
import type { Clinician, Centre } from "../../../types";

const CliniciansPage: React.FC = () => {
  const [clinicians, setClinicians] = useState<Clinician[]>([]);
  const [centres, setCentres] = useState<Centre[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedClinician, setSelectedClinician] = useState<Clinician | null>(
    null,
  );
  const [editingClinician, setEditingClinician] = useState<Clinician | null>(
    null,
  );
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    // User fields
    full_name: "",
    phone: "",
    email: "",
    password: "",
    // Clinician fields
    userId: 0,
    primaryCentreId: 0,
    specialization: "",
    registrationNumber: "",
    yearsOfExperience: 0,
    consultationFee: 0,
    bio: "",
    consultationModes: ["IN_PERSON"] as string[],
    defaultDurationMinutes: 30,
    profilePictureUrl: "",
    designation: "",
    // New fields
    qualification: "",
    expertise: [] as string[],
    languages: [] as string[],
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
      toast.error(error.response?.data?.message || "Failed to fetch data");
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
        password: "",
        userId: parseInt(clinician.userId),
        primaryCentreId: parseInt(clinician.primaryCentreId),
        specialization: clinician.specialization,
        registrationNumber: clinician.registrationNumber,
        yearsOfExperience: clinician.yearsOfExperience,
        consultationFee: clinician.consultationFee,
        bio: clinician.bio || "",
        consultationModes: clinician.consultationModes || [],
        defaultDurationMinutes: clinician.defaultDurationMinutes,
        profilePictureUrl: clinician.profilePictureUrl || "",
        designation: clinician.designation || "",
        qualification: clinician.qualification || "",
        expertise: clinician.expertise || [],
        languages: clinician.languages || [],
      });
    } else {
      setEditingClinician(null);
      setFormData({
        // User fields
        full_name: "",
        phone: "",
        email: "",
        password: "",
        // Clinician fields
        userId: 0,
        primaryCentreId: centres[0]?.id ? parseInt(centres[0].id) : 0,
        specialization: "",
        registrationNumber: "",
        yearsOfExperience: 0,
        consultationFee: 0,
        bio: "",
        consultationModes: ["IN_PERSON"],
        defaultDurationMinutes: 30,
        profilePictureUrl: "",
        designation: "",
        qualification: "",
        expertise: [],
        languages: [],
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClinician(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (editingClinician) {
      // Update validation
      if (
        !formData.specialization ||
        !formData.registrationNumber ||
        !formData.primaryCentreId ||
        formData.consultationFee <= 0
      ) {
        toast.error("Please fill in all required fields");
        return;
      }
    } else {
      // Create validation - requires user fields
      if (
        !formData.full_name ||
        !formData.phone ||
        !formData.password ||
        !formData.specialization ||
        !formData.registrationNumber ||
        !formData.primaryCentreId ||
        formData.consultationFee <= 0
      ) {
        toast.error("Please fill in all required fields");
        return;
      }
    }

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
        // Create new clinician with user data
        const createData = {
          full_name: formData.full_name,
          phone: formData.phone,
          email: formData.email || undefined,
          password: formData.password,
          role_ids: [2], // Clinician role ID
          designation: formData.designation || formData.specialization,
          primary_centre_id: formData.primaryCentreId,
          specialization: formData.specialization,
          registration_number: formData.registrationNumber,
          years_of_experience: formData.yearsOfExperience,
          consultation_fee: formData.consultationFee,
          bio: formData.bio,
          consultation_modes: formData.consultationModes,
          default_duration_minutes: formData.defaultDurationMinutes,
          profile_picture_url: formData.profilePictureUrl,
          qualification: formData.qualification,
          expertise: formData.expertise,
          languages: formData.languages,
        };
        await clinicianService.createClinician(createData as any);
        toast.success("Clinician created successfully");
      }
      handleCloseModal();
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
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
      toast.error(
        error.response?.data?.message || "Failed to update clinician status",
      );
    }
  };

  const handleViewDetails = async (clinician: Clinician) => {
    try {
      const details = await clinicianService.getClinicianById(clinician.id);
      setSelectedClinician(details);
      setShowDetailsModal(true);
    } catch (error: any) {
      toast.error("Failed to fetch clinician details");
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(`${field} copied to clipboard`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
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

  const columns = [
    {
      key: "name",
      header: "Clinician",
      render: (clinician: Clinician) => (
        <div>
          <div className="font-medium text-white">{clinician.name}</div>
          <div className="text-sm text-slate-400">
            {clinician.specialization}
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
                <Input
                  label="Full Name"
                  type="text"
                  placeholder="Enter clinician's full name"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      full_name: e.target.value,
                    })
                  }
                  required
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="10-digit phone number"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phone: e.target.value,
                    })
                  }
                  required
                />

                <Input
                  label="Email (Optional)"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    })
                  }
                />

                <Input
                  label="Password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      password: e.target.value,
                    })
                  }
                  required
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
              onChange={(e) =>
                setFormData({
                  ...formData,
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
                        label: "No centres available - Create one first",
                      },
                    ]
              }
              required
              disabled={centres.length === 0}
            />

            <Input
              label="Specialization"
              type="text"
              placeholder="e.g., Psychiatrist, Clinical Psychologist"
              value={formData.specialization}
              onChange={(e) =>
                setFormData({ ...formData, specialization: e.target.value })
              }
              required
            />

            <Input
              label="Registration Number"
              type="text"
              placeholder="Medical registration number"
              value={formData.registrationNumber}
              onChange={(e) =>
                setFormData({ ...formData, registrationNumber: e.target.value })
              }
              required
            />

            <Input
              label="Years of Experience"
              type="number"
              placeholder="Enter years of experience"
              value={formData.yearsOfExperience || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  yearsOfExperience: parseInt(e.target.value) || 0,
                })
              }
              required
            />

            <Input
              label="Consultation Fee (₹)"
              type="number"
              placeholder="Enter consultation fee"
              value={formData.consultationFee || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
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
                    checked={formData.consultationModes.includes("IN_PERSON")}
                    onChange={() => toggleConsultationMode("IN_PERSON")}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-miboTeal focus:ring-miboTeal"
                  />
                  <span className="text-slate-300">In-Person</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.consultationModes.includes("ONLINE")}
                    onChange={() => toggleConsultationMode("ONLINE")}
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

            <Input
              label="Profile Picture URL (Optional)"
              type="text"
              placeholder="https://example.com/photo.jpg"
              value={formData.profilePictureUrl}
              onChange={(e) =>
                setFormData({ ...formData, profilePictureUrl: e.target.value })
              }
            />

            <Input
              label="Qualification"
              type="text"
              placeholder="e.g., MBBS, MD (Psychiatry), M.Phil Clinical Psychology"
              value={formData.qualification}
              onChange={(e) =>
                setFormData({ ...formData, qualification: e.target.value })
              }
            />

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Expertise (comma-separated)
              </label>
              <Input
                type="text"
                placeholder="e.g., Anxiety, Depression, Trauma, PTSD"
                value={formData.expertise.join(", ")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    expertise: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
              />
              <p className="text-xs text-slate-400 mt-1">
                Separate multiple areas with commas
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Languages (comma-separated)
              </label>
              <Input
                type="text"
                placeholder="e.g., English, Hindi, Malayalam, Kannada"
                value={formData.languages.join(", ")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    languages: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
              />
              <p className="text-xs text-slate-400 mt-1">
                Separate multiple languages with commas
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseModal}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
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
        }}
        title="Clinician Details"
      >
        {selectedClinician && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Full Name
              </label>
              <div className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white">
                {selectedClinician.name}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Specialization
              </label>
              <div className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white">
                {selectedClinician.specialization}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Registration Number
              </label>
              <div className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white">
                {selectedClinician.registrationNumber}
              </div>
            </div>

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
                  {selectedClinician.qualification}
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

            <Button
              variant="primary"
              onClick={() => {
                setShowDetailsModal(false);
                setSelectedClinician(null);
              }}
              className="w-full mt-4"
            >
              Close
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CliniciansPage;
