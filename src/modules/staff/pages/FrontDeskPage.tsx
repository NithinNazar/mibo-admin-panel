import React, { useState, useEffect } from "react";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Modal from "../../../components/ui/Modal";
import Table, { type TableColumn } from "../../../components/ui/Table";
import Badge from "../../../components/ui/Badge";
import { LoadingOverlay } from "../../../components/ui/LoadingOverlay";
import {
  Plus,
  Copy,
  Check,
  Download,
  FileText,
  Printer,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import centreService from "../../../services/centreService";
import staffService from "../../../services/staffService";
import {
  exportToCSV,
  exportToPDF,
  printTable,
} from "../../../utils/exportHelpers";
import type { Centre } from "../../../types";

interface FrontDeskStaff {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
  username?: string;
  centreId?: string;
  centreName?: string;
  designation?: string;
  isActive: boolean;
  createdAt: Date;
}

const FrontDeskPage: React.FC = () => {
  const [staff, setStaff] = useState<FrontDeskStaff[]>([]);
  const [centres, setCentres] = useState<Centre[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<FrontDeskStaff | null>(
    null,
  );
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
    fetchFrontDeskStaff();
  }, []);

  const fetchCentres = async () => {
    try {
      const data = await centreService.getCentres();
      setCentres(data);
    } catch (error: any) {
      toast.error("Failed to fetch centres");
    }
  };

  const fetchFrontDeskStaff = async () => {
    try {
      setLoading(true);
      // Role ID 6 = FRONT_DESK
      const data = await staffService.getStaffByRole(6);
      setStaff(data);
    } catch (error: any) {
      toast.error("Failed to fetch front desk staff");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await staffService.toggleActive(id, isActive);
      toast.success(
        `Front Desk Staff ${isActive ? "activated" : "deactivated"} successfully`,
      );
      fetchFrontDeskStaff();
    } catch (error: any) {
      toast.error("Failed to update staff status");
    }
  };

  const handleExportCSV = () => {
    const csvData = staff.map((s) => ({
      Name: s.full_name,
      Phone: s.phone,
      Email: s.email || "N/A",
      Username: s.username,
      Centre: s.centreName,
      Status: s.isActive ? "Active" : "Inactive",
    }));
    exportToCSV(csvData, "front-desk-staff");
    toast.success("Exported to CSV successfully");
  };

  const handleExportPDF = () => {
    const headers = ["Name", "Phone", "Email", "Username", "Centre", "Status"];
    const rows = staff.map((s) => [
      s.full_name,
      s.phone,
      s.email || "N/A",
      s.username,
      s.centreName,
      s.isActive ? "Active" : "Inactive",
    ]);
    exportToPDF(headers, rows, "Front Desk Staff List");
    toast.success("Exported to PDF successfully");
  };

  const handlePrint = () => {
    const headers = ["Name", "Phone", "Email", "Username", "Centre", "Status"];
    const rows = staff.map((s) => [
      s.full_name,
      s.phone,
      s.email || "N/A",
      s.username,
      s.centreName,
      s.isActive ? "Active" : "Inactive",
    ]);
    printTable("Front Desk Staff List", headers, rows);
  };

  const handleCreateStaff = async () => {
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
      await staffService.createFrontDeskStaff({
        ...formData,
        centreId: parseInt(formData.centreId),
      });
      toast.success("Front desk staff created successfully!");
      setShowCreateModal(false);
      setFormData({
        full_name: "",
        phone: "",
        email: "",
        username: "",
        password: "",
        centreId: "",
      });
      fetchFrontDeskStaff();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create staff");
    } finally {
      setIsCreating(false);
    }
  };

  const handleViewDetails = async (staffMember: FrontDeskStaff) => {
    try {
      const details = await staffService.getStaffById(staffMember.id);
      setSelectedStaff(details);
      setShowDetailsModal(true);
    } catch (error: any) {
      toast.error("Failed to fetch staff details");
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

  const columns: TableColumn<FrontDeskStaff>[] = [
    {
      key: "full_name",
      header: "Name",
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-miboTeal/20 flex items-center justify-center">
            <User size={20} className="text-miboTeal" />
          </div>
          <div>
            <div className="font-medium text-white">{item.full_name}</div>
            <div className="text-sm text-slate-400">
              {item.designation || "Front Desk"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Phone",
    },
    {
      key: "email",
      header: "Email",
      render: (item) => item.email || "-",
    },
    {
      key: "username",
      header: "Username",
      render: (item) => (
        <span className="font-mono">{item.username || "N/A"}</span>
      ),
    },
    {
      key: "centreName",
      header: "Centre",
      render: (item) => item.centreName || "-",
    },
    {
      key: "isActive",
      header: "Status",
      render: (item) => (
        <Badge variant={item.isActive ? "success" : "danger"}>
          {item.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (item) => (
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleViewDetails(item)}
          >
            View Details
          </Button>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={item.isActive}
              onChange={() => handleToggleActive(item.id, !item.isActive)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-miboTeal focus:ring-miboTeal cursor-pointer"
            />
            <span className="text-xs text-slate-400">
              {item.isActive ? "Active" : "Inactive"}
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
          <h1 className="text-2xl font-bold text-white">Front Desk Staff</h1>
          <p className="text-slate-400 mt-1">
            Manage front desk staff and their access
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2"
        >
          <Plus size={20} />
          Add Front Desk Staff
        </Button>
      </div>

      {/* Export Buttons */}
      {staff.length > 0 && (
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
        {loading && staff.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            Loading staff...
          </div>
        ) : staff.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 mb-4">No front desk staff found</p>
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 mx-auto"
            >
              <Plus size={20} />
              Add First Staff Member
            </Button>
          </div>
        ) : (
          <Table
            columns={columns}
            data={staff}
            keyExtractor={(item) => item.id}
          />
        )}
      </Card>

      {/* Create Staff Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add Front Desk Staff"
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
              securely. The staff member will use these credentials to log in.
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
              onClick={handleCreateStaff}
              disabled={isCreating}
              className="flex-1"
            >
              Create Staff
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedStaff(null);
        }}
        title="Front Desk Staff Details"
      >
        {selectedStaff && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Full Name
              </label>
              <div className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white">
                {selectedStaff.full_name}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Phone Number
              </label>
              <div className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white">
                {selectedStaff.phone}
              </div>
            </div>

            {selectedStaff.email && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <div className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white">
                  {selectedStaff.email}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Username
              </label>
              <div className="flex gap-2">
                <div className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white font-mono">
                  {selectedStaff.username || "N/A"}
                </div>
                {selectedStaff.username && (
                  <Button
                    variant="secondary"
                    onClick={() =>
                      copyToClipboard(selectedStaff.username!, "Username")
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

            {selectedStaff.centreName && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Centre
                </label>
                <div className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white">
                  {selectedStaff.centreName}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Status
              </label>
              <Badge variant={selectedStaff.isActive ? "success" : "danger"}>
                {selectedStaff.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>

            <Button
              variant="primary"
              onClick={() => {
                setShowDetailsModal(false);
                setSelectedStaff(null);
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
        message="Creating front desk staff..."
        minDisplayTime={3000}
      />
    </div>
  );
};

export default FrontDeskPage;
