import React, { useState, useEffect } from "react";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Table from "../../../components/ui/Table";
import Modal from "../../../components/ui/Modal";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import { Plus, Edit, Trash2, DollarSign, Award } from "lucide-react";
import toast from "react-hot-toast";
import clinicianService from "../../../services/clinicianService";
import centreService from "../../../services/centreService";
import type { Clinician, Centre } from "../../../types";

const CliniciansPage: React.FC = () => {
  const [clinicians, setClinicians] = useState<Clinician[]>([]);
  const [centres, setCentres] = useState<Centre[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClinician, setEditingClinician] = useState<Clinician | null>(
    null
  );
  const [formData, setFormData] = useState({
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
        userId: parseInt(clinician.userId),
        primaryCentreId: parseInt(clinician.primaryCentreId),
        specialization: clinician.specialization,
        registrationNumber: clinician.registrationNumber,
        yearsOfExperience: clinician.yearsOfExperience,
        consultationFee: clinician.consultationFee,
        bio: clinician.bio || "",
        consultationModes: clinician.consultationModes,
        defaultDurationMinutes: clinician.defaultDurationMinutes,
        profilePictureUrl: clinician.profilePictureUrl || "",
      });
    } else {
      setEditingClinician(null);
      setFormData({
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
    if (
      !formData.specialization ||
      !formData.registrationNumber ||
      !formData.primaryCentreId ||
      formData.consultationFee <= 0
    ) {
      toast.error("Please fill in all required fields");
      return;
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
        });
        toast.success("Clinician updated successfully");
      } else {
        await clinicianService.createClinician(formData);
        toast.success("Clinician created successfully");
      }
      handleCloseModal();
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this clinician?")) return;

    try {
      await clinicianService.deleteClinician(id);
      toast.success("Clinician deleted successfully");
      fetchData();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to delete clinician"
      );
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
          {clinician.consultationModes.map((mode) => (
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
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleOpenModal(clinician)}
          >
            <Edit size={16} />
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(clinician.id)}
          >
            <Trash2 size={16} />
          </Button>
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
            <Input
              label="User ID"
              type="number"
              placeholder="Enter staff user ID"
              value={formData.userId || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  userId: parseInt(e.target.value) || 0,
                })
              }
              required
            />
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
            options={centres.map((centre) => ({
              value: centre.id,
              label: centre.name,
            }))}
            required
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
    </div>
  );
};

export default CliniciansPage;
