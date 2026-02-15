import React, { useState, useEffect } from "react";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Modal from "../../../components/ui/Modal";
import Table from "../../../components/ui/Table";
import Badge from "../../../components/ui/Badge";
import { LoadingOverlay } from "../../../components/ui/LoadingOverlay";
import {
  Download,
  FileText,
  Printer,
  User,
  Plus,
  Copy,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";
import staffService from "../../../services/staffService";
import centreService from "../../../services/centreService";
import {
  exportToCSV,
  exportToPDF,
  printTable,
} from "../../../utils/exportHelpers";
import type { Centre } from "../../../types";

interface CareCoordinator {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
  username?: string;
  designation?: string;
  isActive: boolean;
  created_at: Date;
}

const CareCoordinatorsPage: React.FC = () => {
  const [coordinators, setCoordinators] = useState<CareCoordinator[]>([]);
  const [centres, setCentres] = useState<Centre[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCoordinator, setSelectedCoordinator] =
    useState<CareCoordinator | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    username: "",
    password: "",
    centreId: "",
  });

  useEffect(() => {
    fetchCentres();
    fetchCoordinators();
  }, []);

  const fetchCentres = async () => {
    try {
      const data = await centreService.getCentres();
      setCentres(data);
    } catch (error: any) {
      toast.error("Failed to fetch centres");
    }
  };

  const fetchCoordinators = async () => {
    try {
      setLoading(true);
      // Role ID 5 = CARE_COORDINATOR
      const data = await staffService.getStaffByRole(5);
      setCoordinators(data);
    } catch (error: any) {
      toast.error("Failed to fetch care coordinators");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoordinator = async () => {
    try {
      if (
        !formData.full_name ||
        !formData.phone ||
        !formData.username ||
        !formData.password ||
        !formData.centreId
      ) {
        toast.error("Please fill in all required fields");
        return;
      }

      setIsCreating(true);
      await staffService.createCareCoordinator({
        ...formData,
        centreId: parseInt(formData.centreId),
      });
      toast.success("Care Coordinator created successfully!");
      setShowCreateModal(false);
      setFormData({
        full_name: "",
        phone: "",
        email: "",
        username: "",
        password: "",
        centreId: "",
      });
      fetchCoordinators();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to create care coordinator",
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleViewDetails = async (coordinator: CareCoordinator) => {
    try {
      const details = await staffService.getStaffById(coordinator.id);
      setSelectedCoordinator(details);
      setShowDetailsModal(true);
    } catch (error: any) {
      toast.error("Failed to fetch coordinator details");
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await staffService.toggleActive(id, isActive);
      toast.success(
        `Care Coordinator ${isActive ? "activated" : "deactivated"} successfully`,
      );
      fetchCoordinators();
    } catch (error: any) {
      toast.error("Failed to update care coordinator status");
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

  const handleExportCSV = () => {
    const csvData = coordinators.map((coordinator) => ({
      Name: coordinator.full_name,
      Phone: coordinator.phone,
      Email: coordinator.email || "N/A",
      Username: coordinator.username || "N/A",
      Designation: coordinator.designation || "Care Coordinator",
      Status: coordinator.isActive ? "Active" : "Inactive",
    }));
    exportToCSV(csvData, "care-coordinators");
    toast.success("Exported to CSV successfully");
  };

  const handleExportPDF = () => {
    const headers = [
      "Name",
      "Phone",
      "Email",
      "Username",
      "Designation",
      "Status",
    ];
    const rows = coordinators.map((coordinator) => [
      coordinator.full_name,
      coordinator.phone,
      coordinator.email || "N/A",
      coordinator.username || "N/A",
      coordinator.designation || "Care Coordinator",
      coordinator.isActive ? "Active" : "Inactive",
    ]);
    exportToPDF(headers, rows, "Care Coordinators List");
    toast.success("Exported to PDF successfully");
  };

  const handlePrint = () => {
    const headers = [
      "Name",
      "Phone",
      "Email",
      "Username",
      "Designation",
      "Status",
    ];
    const rows = coordinators.map((coordinator) => [
      coordinator.full_name,
      coordinator.phone,
      coordinator.email || "N/A",
      coordinator.username || "N/A",
      coordinator.designation || "Care Coordinator",
      coordinator.isActive ? "Active" : "Inactive",
    ]);
    printTable("Care Coordinators List", headers, rows);
  };

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (coordinator: CareCoordinator) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-miboTeal/20 flex items-center justify-center">
            <User size={20} className="text-miboTeal" />
          </div>
          <div>
            <div className="font-medium text-white">
              {coordinator.full_name}
            </div>
            <div className="text-sm text-slate-400">
              {coordinator.designation || "Care Coordinator"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (coordinator: CareCoordinator) => (
        <span className="text-slate-300">{coordinator.phone}</span>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (coordinator: CareCoordinator) => (
        <span className="text-slate-300">{coordinator.email || "N/A"}</span>
      ),
    },
    {
      key: "username",
      header: "Username",
      render: (coordinator: CareCoordinator) => (
        <span className="text-slate-300 font-mono">
          {coordinator.username || "N/A"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (coordinator: CareCoordinator) => (
        <Badge variant={coordinator.isActive ? "success" : "danger"}>
          {coordinator.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (coordinator: CareCoordinator) => (
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleViewDetails(coordinator)}
          >
            View Details
          </Button>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={coordinator.isActive}
              onChange={() =>
                handleToggleActive(coordinator.id, !coordinator.isActive)
              }
              className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-miboTeal focus:ring-miboTeal cursor-pointer"
            />
            <span className="text-xs text-slate-400">
              {coordinator.isActive ? "Active" : "Inactive"}
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
          <h1 className="text-2xl font-bold text-white">Care Coordinators</h1>
          <p className="text-slate-400 mt-1">Manage care coordination staff</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2"
        >
          <Plus size={20} />
          Add Care Coordinator
        </Button>
      </div>

      {/* Export Buttons */}
      {coordinators.length > 0 && (
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

      <Card>
        {loading && coordinators.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            Loading care coordinators...
          </div>
        ) : coordinators.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            No care coordinators found
          </div>
        ) : (
          <Table
            columns={columns}
            data={coordinators}
            keyExtractor={(c) => c.id}
          />
        )}
      </Card>

      {/* Create Care Coordinator Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add New Care Coordinator"
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            placeholder="Enter full name"
            value={formData.full_name}
            onChange={(e) =>
              setFormData({ ...formData, full_name: e.target.value })
            }
            required
          />

          <Input
            label="Phone Number"
            type="tel"
            placeholder="10-digit phone number"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            required
          />

          <Input
            label="Email (Optional)"
            type="email"
            placeholder="email@example.com"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />

          <Select
            label="Assign to Centre"
            value={formData.centreId}
            onChange={(e) =>
              setFormData({ ...formData, centreId: e.target.value })
            }
            options={[
              { value: "", label: "Select Centre" },
              ...centres.map((c) => ({
                value: c.id,
                label: `${c.name} - ${c.city}`,
              })),
            ]}
            required
          />

          <Input
            label="Username"
            type="text"
            placeholder="Enter username"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="Minimum 8 characters"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
          />

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-sm text-blue-400">
              <strong>Note:</strong> Please save the username and password
              securely. The care coordinator will use these credentials to log
              in.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateCoordinator}
              disabled={isCreating}
              className="flex-1"
            >
              Create Care Coordinator
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedCoordinator(null);
        }}
        title="Care Coordinator Details"
      >
        {selectedCoordinator && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Full Name
              </label>
              <div className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white">
                {selectedCoordinator.full_name}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Phone Number
              </label>
              <div className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white">
                {selectedCoordinator.phone}
              </div>
            </div>

            {selectedCoordinator.email && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <div className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white">
                  {selectedCoordinator.email}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Username
              </label>
              <div className="flex gap-2">
                <div className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white font-mono">
                  {selectedCoordinator.username || "N/A"}
                </div>
                {selectedCoordinator.username && (
                  <Button
                    variant="secondary"
                    onClick={() =>
                      copyToClipboard(selectedCoordinator.username!, "Username")
                    }
                    className="px-4"
                  >
                    {copiedField === "Username" ? (
                      <Check size={20} className="text-green-400" />
                    ) : (
                      <Copy size={20} />
                    )}
                  </Button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Status
              </label>
              <Badge
                variant={selectedCoordinator.isActive ? "success" : "danger"}
              >
                {selectedCoordinator.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>

            <Button
              variant="primary"
              onClick={() => {
                setShowDetailsModal(false);
                setSelectedCoordinator(null);
              }}
              className="w-full mt-4"
            >
              Close
            </Button>
          </div>
        )}
      </Modal>

      {/* Loading Overlay */}
      <LoadingOverlay
        isVisible={isCreating}
        message="Creating care coordinator..."
        minDisplayTime={3000}
      />
    </div>
  );
};

export default CareCoordinatorsPage;
