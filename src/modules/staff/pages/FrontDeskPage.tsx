import React, { useState, useEffect } from "react";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Modal from "../../../components/ui/Modal";
import Table from "../../../components/ui/Table";
import Badge from "../../../components/ui/Badge";
import { Plus, Eye, EyeOff, Copy, Check } from "lucide-react";
import toast from "react-hot-toast";
import centreService from "../../../services/centreService";
import staffService from "../../../services/staffService";
import type { Centre } from "../../../types";

interface FrontDeskStaff {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
  username: string;
  centreId: string;
  centreName: string;
  isActive: boolean;
  createdAt: Date;
}

interface NewStaffCredentials {
  username: string;
  password: string;
}

const FrontDeskPage: React.FC = () => {
  const [staff, setStaff] = useState<FrontDeskStaff[]>([]);
  const [centres, setCentres] = useState<Centre[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [newCredentials, setNewCredentials] =
    useState<NewStaffCredentials | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
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
      // TODO: Implement API call to fetch front desk staff
      // const data = await staffService.getFrontDeskStaff();
      // setStaff(data);
      setStaff([]); // Placeholder
    } catch (error: any) {
      toast.error("Failed to fetch front desk staff");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStaff = async () => {
    try {
      if (!formData.full_name || !formData.phone || !formData.centreId) {
        toast.error("Please fill in all required fields");
        return;
      }

      setLoading(true);

      // TODO: Implement API call
      // const response = await staffService.createFrontDeskStaff(formData);

      // Mock response for now
      const response = {
        user: {
          id: "10",
          full_name: formData.full_name,
          phone: formData.phone,
          email: formData.email,
          username: `frontdesk_${formData.full_name
            .toLowerCase()
            .replace(/\s+/g, "_")}`,
          centreId: formData.centreId,
          isActive: true,
          createdAt: new Date(),
        },
        credentials: {
          username: `frontdesk_${formData.full_name
            .toLowerCase()
            .replace(/\s+/g, "_")}`,
          password: "Abc12345", // This would come from backend
        },
      };

      // Show credentials modal
      setNewCredentials(response.credentials);
      setShowCreateModal(false);
      setShowCredentialsModal(true);

      // Reset form
      setFormData({
        full_name: "",
        phone: "",
        email: "",
        centreId: "",
      });

      // Refresh list
      await fetchFrontDeskStaff();

      toast.success("Front desk staff created successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create staff");
    } finally {
      setLoading(false);
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

  const columns = [
    {
      header: "Name",
      accessor: "full_name" as keyof FrontDeskStaff,
    },
    {
      header: "Phone",
      accessor: "phone" as keyof FrontDeskStaff,
    },
    {
      header: "Email",
      accessor: "email" as keyof FrontDeskStaff,
      render: (value: string | undefined) => value || "-",
    },
    {
      header: "Username",
      accessor: "username" as keyof FrontDeskStaff,
    },
    {
      header: "Centre",
      accessor: "centreName" as keyof FrontDeskStaff,
    },
    {
      header: "Status",
      accessor: "isActive" as keyof FrontDeskStaff,
      render: (value: boolean) => (
        <Badge variant={value ? "success" : "error"}>
          {value ? "Active" : "Inactive"}
        </Badge>
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
          <Table columns={columns} data={staff} />
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

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-4">
            <p className="text-sm text-blue-400">
              <strong>Note:</strong> Username and password will be automatically
              generated and shown only once. Make sure to save them securely.
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
              loading={loading}
              className="flex-1"
            >
              Create Staff
            </Button>
          </div>
        </div>
      </Modal>

      {/* Credentials Modal */}
      <Modal
        isOpen={showCredentialsModal}
        onClose={() => {
          setShowCredentialsModal(false);
          setNewCredentials(null);
          setShowPassword(false);
        }}
        title="Staff Credentials Created"
      >
        <div className="space-y-6">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <p className="text-sm text-yellow-400 font-medium">
              ⚠️ Important: Save these credentials now!
            </p>
            <p className="text-sm text-yellow-400 mt-1">
              These credentials will not be shown again. Make sure to save them
              securely and share with the staff member.
            </p>
          </div>

          {newCredentials && (
            <div className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Username
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white font-mono">
                    {newCredentials.username}
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      copyToClipboard(newCredentials.username, "Username")
                    }
                    className="px-4"
                  >
                    {copiedField === "Username" ? (
                      <Check size={20} className="text-green-400" />
                    ) : (
                      <Copy size={20} />
                    )}
                  </Button>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white font-mono flex items-center justify-between">
                    <span>
                      {showPassword ? newCredentials.password : "••••••••"}
                    </span>
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      copyToClipboard(newCredentials.password, "Password")
                    }
                    className="px-4"
                  >
                    {copiedField === "Password" ? (
                      <Check size={20} className="text-green-400" />
                    ) : (
                      <Copy size={20} />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-slate-700/50 rounded-lg p-4">
            <p className="text-sm text-slate-300">
              <strong>Login URL:</strong>
            </p>
            <p className="text-sm text-miboTeal mt-1 font-mono">
              {window.location.origin}/login
            </p>
          </div>

          <Button
            variant="primary"
            onClick={() => {
              setShowCredentialsModal(false);
              setNewCredentials(null);
              setShowPassword(false);
            }}
            className="w-full"
          >
            I've Saved the Credentials
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default FrontDeskPage;
