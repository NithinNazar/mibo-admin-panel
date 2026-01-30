import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Table from "../../../components/ui/Table";
import Modal from "../../../components/ui/Modal";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import {
  Plus,
  Search,
  Edit,
  Eye,
  User,
  Phone,
  Mail,
  Download,
  FileText,
  Printer,
} from "lucide-react";
import toast from "react-hot-toast";
import patientService from "../../../services/patientService";
import {
  exportToCSV,
  exportToPDF,
  printTable,
} from "../../../utils/exportHelpers";
import type {
  CreatePatientRequest,
  UpdatePatientRequest,
} from "../../../services/patientService";
import type { Patient } from "../../../types";

const PatientsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState<CreatePatientRequest>({
    fullName: "",
    phone: "",
    email: "",
    dateOfBirth: "",
    gender: undefined,
    bloodGroup: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    notes: "",
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    // Filter patients based on search query
    if (searchQuery.trim() === "") {
      setFilteredPatients(patients);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = patients.filter(
        (patient) =>
          patient.fullName.toLowerCase().includes(query) ||
          patient.phone.includes(query) ||
          (patient.email && patient.email.toLowerCase().includes(query)),
      );
      setFilteredPatients(filtered);
    }
  }, [searchQuery, patients]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await patientService.getPatients();
      setPatients(data);
      setFilteredPatients(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch patients");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (patient?: Patient) => {
    if (patient) {
      setEditingPatient(patient);
      setFormData({
        fullName: patient.fullName,
        phone: patient.phone,
        email: patient.email || "",
        dateOfBirth: patient.dateOfBirth
          ? new Date(patient.dateOfBirth).toISOString().split("T")[0]
          : "",
        gender: patient.gender,
        bloodGroup: patient.bloodGroup || "",
        emergencyContactName: patient.emergencyContactName || "",
        emergencyContactPhone: patient.emergencyContactPhone || "",
        notes: patient.notes || "",
      });
    } else {
      setEditingPatient(null);
      setFormData({
        fullName: "",
        phone: "",
        email: "",
        dateOfBirth: "",
        gender: undefined,
        bloodGroup: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
        notes: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPatient(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.fullName || !formData.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingPatient) {
        await patientService.updatePatient(
          editingPatient.id,
          formData as UpdatePatientRequest,
        );
        toast.success("Patient updated successfully");
      } else {
        await patientService.createPatient(formData);
        toast.success("Patient created successfully");
      }
      handleCloseModal();
      fetchPatients();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleExportCSV = () => {
    const csvData = filteredPatients.map((patient) => ({
      Name: patient.fullName,
      Phone: patient.phone,
      Email: patient.email || "N/A",
      Gender: patient.gender || "Not specified",
      "Blood Group": patient.bloodGroup || "N/A",
      "Date of Birth": patient.dateOfBirth
        ? new Date(patient.dateOfBirth).toLocaleDateString()
        : "N/A",
      Status: patient.isActive ? "Active" : "Inactive",
    }));
    exportToCSV(csvData, "patients");
    toast.success("Exported to CSV successfully");
  };

  const handleExportPDF = () => {
    const headers = [
      "Name",
      "Phone",
      "Email",
      "Gender",
      "Blood Group",
      "Status",
    ];
    const rows = filteredPatients.map((patient) => [
      patient.fullName,
      patient.phone,
      patient.email || "N/A",
      patient.gender || "Not specified",
      patient.bloodGroup || "N/A",
      patient.isActive ? "Active" : "Inactive",
    ]);
    exportToPDF(headers, rows, "Patients List");
    toast.success("Exported to PDF successfully");
  };

  const handlePrint = () => {
    const headers = [
      "Name",
      "Phone",
      "Email",
      "Gender",
      "Blood Group",
      "Status",
    ];
    const rows = filteredPatients.map((patient) => [
      patient.fullName,
      patient.phone,
      patient.email || "N/A",
      patient.gender || "Not specified",
      patient.bloodGroup || "N/A",
      patient.isActive ? "Active" : "Inactive",
    ]);
    printTable(headers, rows, "Patients List");
  };

  const columns = [
    {
      key: "name",
      header: "Patient",
      render: (patient: Patient) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-miboTeal/20 flex items-center justify-center">
            <User size={20} className="text-miboTeal" />
          </div>
          <div>
            <div className="font-medium text-white">{patient.fullName}</div>
            {patient.dateOfBirth && (
              <div className="text-sm text-slate-400">
                {new Date().getFullYear() -
                  new Date(patient.dateOfBirth).getFullYear()}{" "}
                years old
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      render: (patient: Patient) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-300">
            <Phone size={14} className="text-slate-400" />
            <span>{patient.phone}</span>
          </div>
          {patient.email && (
            <div className="flex items-center gap-2 text-slate-300">
              <Mail size={14} className="text-slate-400" />
              <span>{patient.email}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "gender",
      header: "Gender",
      render: (patient: Patient) => (
        <span className="text-slate-300 capitalize">
          {patient.gender || "Not specified"}
        </span>
      ),
    },
    {
      key: "bloodGroup",
      header: "Blood Group",
      render: (patient: Patient) => (
        <span className="text-slate-300">{patient.bloodGroup || "N/A"}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (patient: Patient) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            patient.isActive
              ? "bg-green-500/20 text-green-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {patient.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (patient: Patient) => (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/patients/${patient.id}`)}
          >
            <Eye size={16} />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleOpenModal(patient)}
          >
            <Edit size={16} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Patients</h1>
          <p className="text-slate-400 mt-1">Manage patient records</p>
        </div>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          <Plus size={20} />
          Add Patient
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <div className="relative">
          <Search
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search by name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-miboTeal"
          />
        </div>
      </Card>

      {/* Export Buttons */}
      {filteredPatients.length > 0 && (
        <div className="flex gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportCSV}
            className="flex items-center gap-2"
          >
            <Download size={16} />
            Export CSV
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportPDF}
            className="flex items-center gap-2"
          >
            <FileText size={16} />
            Export PDF
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handlePrint}
            className="flex items-center gap-2"
          >
            <Printer size={16} />
            Print
          </Button>
        </div>
      )}

      {/* Patients Table */}
      <Card>
        {loading ? (
          <div className="text-center py-8 text-slate-400">
            Loading patients...
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            {searchQuery
              ? "No patients found matching your search."
              : "No patients found. Add your first patient to get started."}
          </div>
        ) : (
          <Table
            columns={columns}
            data={filteredPatients}
            keyExtractor={(p) => p.id}
          />
        )}
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingPatient ? "Edit Patient" : "Add New Patient"}
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-4 max-h-[70vh] overflow-y-auto pr-2"
        >
          <Input
            label="Full Name"
            type="text"
            placeholder="Enter patient name"
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
            required
          />

          <Input
            label="Phone Number"
            type="tel"
            placeholder="+91 9876543210"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            required
          />

          <Input
            label="Email (Optional)"
            type="email"
            placeholder="patient@example.com"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />

          <Input
            label="Date of Birth (Optional)"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) =>
              setFormData({ ...formData, dateOfBirth: e.target.value })
            }
          />

          <Select
            label="Gender (Optional)"
            value={formData.gender || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                gender: e.target.value as
                  | "male"
                  | "female"
                  | "other"
                  | undefined,
              })
            }
            options={[
              { value: "", label: "Select gender" },
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
              { value: "other", label: "Other" },
            ]}
          />

          <Input
            label="Blood Group (Optional)"
            type="text"
            placeholder="e.g., A+, B-, O+"
            value={formData.bloodGroup}
            onChange={(e) =>
              setFormData({ ...formData, bloodGroup: e.target.value })
            }
          />

          <div className="pt-4 border-t border-slate-700">
            <h4 className="font-medium text-white mb-3">Emergency Contact</h4>
            <div className="space-y-4">
              <Input
                label="Contact Name (Optional)"
                type="text"
                placeholder="Emergency contact name"
                value={formData.emergencyContactName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    emergencyContactName: e.target.value,
                  })
                }
              />

              <Input
                label="Contact Phone (Optional)"
                type="tel"
                placeholder="+91 9876543210"
                value={formData.emergencyContactPhone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    emergencyContactPhone: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Additional notes about the patient..."
              rows={3}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-miboTeal"
            />
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
              {editingPatient ? "Update" : "Create"} Patient
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PatientsListPage;
