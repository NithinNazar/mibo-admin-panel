import React, { useState, useEffect } from "react";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
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
import {
  exportToCSV,
  exportToPDF,
  printTable,
} from "../../../utils/exportHelpers";

interface Manager {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
  username?: string;
  designation?: string;
  isActive: boolean;
  created_at: Date;
}

const ManagersPage: React.FC = () => {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    username: "",
    password: "",
  });

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      setLoading(true);
      // Role ID 2 = MANAGER
      const data = await staffService.getStaffByRole(2);
      setManagers(data);
    } catch (error: any) {
      toast.error("Failed to fetch managers");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateManager = async () => {
    try {
      if (
        !formData.full_name ||
        !formData.phone ||
        !formData.username ||
        !formData.password
      ) {
        toast.error("Please fill in all required fields");
        return;
      }

      setIsCreating(true);
      await staffService.createManager(formData);
      toast.success("Manager created successfully!");
      setShowCreateModal(false);
      setFormData({
        full_name: "",
        phone: "",
        email: "",
        username: "",
        password: "",
      });
      fetchManagers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create manager");
    } finally {
      setIsCreating(false);
    }
  };

  const handleViewDetails = async (manager: Manager) => {
    try {
      const details = await staffService.getStaffById(manager.id);
      setSelectedManager(details);
      setShowDetailsModal(true);
    } catch (error: any) {
      toast.error("Failed to fetch manager details");
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await staffService.toggleActive(id, isActive);
      toast.success(
        `Manager ${isActive ? "activated" : "deactivated"} successfully`,
      );
      fetchManagers();
    } catch (error: any) {
      toast.error("Failed to update manager status");
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
    const csvData = managers.map((manager) => ({
      Name: manager.full_name,
      Phone: manager.phone,
      Email: manager.email || "N/A",
      Username: manager.username || "N/A",
      Designation: manager.designation || "Manager",
      Status: manager.isActive ? "Active" : "Inactive",
    }));
    exportToCSV(csvData, "managers");
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
    const rows = managers.map((manager) => [
      manager.full_name,
      manager.phone,
      manager.email || "N/A",
      manager.username || "N/A",
      manager.designation || "Manager",
      manager.isActive ? "Active" : "Inactive",
    ]);
    exportToPDF(headers, rows, "Managers List");
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
    const rows = managers.map((manager) => [
      manager.full_name,
      manager.phone,
      manager.email || "N/A",
      manager.username || "N/A",
      manager.designation || "Manager",
      manager.isActive ? "Active" : "Inactive",
    ]);
    printTable("Managers List", headers, rows);
  };

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (manager: Manager) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-miboTeal/20 flex items-center justify-center">
            <User size={20} className="text-miboTeal" />
          </div>
          <div>
            <div className="font-medium text-white">{manager.full_name}</div>
            <div className="text-sm text-slate-400">
              {manager.designation || "Manager"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (manager: Manager) => (
        <span className="text-slate-300">{manager.phone}</span>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (manager: Manager) => (
        <span className="text-slate-300">{manager.email || "N/A"}</span>
      ),
    },
    {
      key: "username",
      header: "Username",
      render: (manager: Manager) => (
        <span className="text-slate-300 font-mono">
          {manager.username || "N/A"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (manager: Manager) => (
        <Badge variant={manager.isActive ? "success" : "danger"}>
          {manager.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (manager: Manager) => (
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleViewDetails(manager)}
          >
            View Details
          </Button>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={manager.isActive}
              onChange={() => handleToggleActive(manager.id, !manager.isActive)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-miboTeal focus:ring-miboTeal cursor-pointer"
            />
            <span className="text-xs text-slate-400">
              {manager.isActive ? "Active" : "Inactive"}
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
          <h1 className="text-2xl font-bold text-white">Managers</h1>
          <p className="text-slate-400 mt-1">Manage hospital managers</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2"
        >
          <Plus size={20} />
          Add Manager
        </Button>
      </div>

      {/* Export Buttons */}
      {managers.length > 0 && (
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
        {loading && managers.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            Loading managers...
          </div>
        ) : managers.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            No managers found
          </div>
        ) : (
          <Table columns={columns} data={managers} keyExtractor={(m) => m.id} />
        )}
      </Card>

      {/* Create Manager Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add New Manager"
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
              securely. The manager will use these credentials to log in.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
              className="flex-1"
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateManager}
              disabled={isCreating}
              className="flex-1"
            >
              Create Manager
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedManager(null);
        }}
        title="Manager Details"
      >
        {selectedManager && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Full Name
              </label>
              <div className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white">
                {selectedManager.full_name}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Phone Number
              </label>
              <div className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white">
                {selectedManager.phone}
              </div>
            </div>

            {selectedManager.email && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <div className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white">
                  {selectedManager.email}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Username
              </label>
              <div className="flex gap-2">
                <div className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white font-mono">
                  {selectedManager.username || "N/A"}
                </div>
                {selectedManager.username && (
                  <Button
                    variant="secondary"
                    onClick={() =>
                      copyToClipboard(selectedManager.username!, "Username")
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
              <Badge variant={selectedManager.isActive ? "success" : "danger"}>
                {selectedManager.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>

            <Button
              variant="primary"
              onClick={() => {
                setShowDetailsModal(false);
                setSelectedManager(null);
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
        message="Creating manager..."
        minDisplayTime={3000}
      />
    </div>
  );
};

export default ManagersPage;
