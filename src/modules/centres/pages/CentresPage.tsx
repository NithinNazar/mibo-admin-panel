import React, { useState, useEffect } from "react";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Table from "../../../components/ui/Table";
import Modal from "../../../components/ui/Modal";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import { Plus, Edit, Trash2, MapPin, Phone } from "lucide-react";
import toast from "react-hot-toast";
import centreService from "../../../services/centreService";
import type {
  CreateCentreRequest,
  UpdateCentreRequest,
} from "../../../services/centreService";
import type { Centre } from "../../../types";

const CentresPage: React.FC = () => {
  const [centres, setCentres] = useState<Centre[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCentre, setEditingCentre] = useState<Centre | null>(null);
  const [formData, setFormData] = useState<CreateCentreRequest>({
    name: "",
    city: "bangalore",
    addressLine1: "",
    addressLine2: "",
    pincode: "",
    contactPhone: "",
  });

  useEffect(() => {
    fetchCentres();
  }, []);

  const fetchCentres = async () => {
    try {
      setLoading(true);
      const data = await centreService.getCentres();
      setCentres(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch centres");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (centre?: Centre) => {
    if (centre) {
      setEditingCentre(centre);
      setFormData({
        name: centre.name,
        city: centre.city,
        addressLine1: centre.address.split(",")[0] || "",
        addressLine2: centre.address.split(",")[1] || "",
        pincode: centre.phone.split("-")[1] || "",
        contactPhone: centre.phone,
      });
    } else {
      setEditingCentre(null);
      setFormData({
        name: "",
        city: "bangalore",
        addressLine1: "",
        addressLine2: "",
        pincode: "",
        contactPhone: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCentre(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !formData.name ||
      !formData.city ||
      !formData.addressLine1 ||
      !formData.pincode ||
      !formData.contactPhone
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingCentre) {
        await centreService.updateCentre(
          editingCentre.id,
          formData as UpdateCentreRequest
        );
        toast.success("Centre updated successfully");
      } else {
        await centreService.createCentre(formData);
        toast.success("Centre created successfully");
      }
      handleCloseModal();
      fetchCentres();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this centre?")) return;

    try {
      await centreService.deleteCentre(id);
      toast.success("Centre deleted successfully");
      fetchCentres();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete centre");
    }
  };

  const columns = [
    {
      key: "name",
      header: "Centre Name",
      render: (centre: Centre) => (
        <div>
          <div className="font-medium text-white">{centre.name}</div>
          <div className="text-sm text-slate-400 capitalize">{centre.city}</div>
        </div>
      ),
    },
    {
      key: "address",
      header: "Address",
      render: (centre: Centre) => (
        <div className="flex items-start gap-2">
          <MapPin size={16} className="text-slate-400 mt-1 flex-shrink-0" />
          <span className="text-slate-300">{centre.address}</span>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Contact",
      render: (centre: Centre) => (
        <div className="flex items-center gap-2">
          <Phone size={16} className="text-slate-400" />
          <span className="text-slate-300">{centre.phone}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (centre: Centre) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            centre.isActive
              ? "bg-green-500/20 text-green-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {centre.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (centre: Centre) => (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleOpenModal(centre)}
          >
            <Edit size={16} />
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(centre.id)}
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
          <h1 className="text-2xl font-bold text-white">Centres</h1>
          <p className="text-slate-400 mt-1">Manage hospital locations</p>
        </div>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          <Plus size={20} />
          Add Centre
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="text-center py-8 text-slate-400">
            Loading centres...
          </div>
        ) : centres.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            No centres found. Add your first centre to get started.
          </div>
        ) : (
          <Table columns={columns} data={centres} keyExtractor={(c) => c.id} />
        )}
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCentre ? "Edit Centre" : "Add New Centre"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Centre Name"
            type="text"
            placeholder="Enter centre name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Select
            label="City"
            value={formData.city}
            onChange={(e) =>
              setFormData({
                ...formData,
                city: e.target.value as "bangalore" | "kochi" | "mumbai",
              })
            }
            options={[
              { value: "bangalore", label: "Bangalore" },
              { value: "kochi", label: "Kochi" },
              { value: "mumbai", label: "Mumbai" },
            ]}
            required
          />

          <Input
            label="Address Line 1"
            type="text"
            placeholder="Street address"
            value={formData.addressLine1}
            onChange={(e) =>
              setFormData({ ...formData, addressLine1: e.target.value })
            }
            required
          />

          <Input
            label="Address Line 2"
            type="text"
            placeholder="Apartment, suite, etc. (optional)"
            value={formData.addressLine2}
            onChange={(e) =>
              setFormData({ ...formData, addressLine2: e.target.value })
            }
          />

          <Input
            label="Pincode"
            type="text"
            placeholder="Enter pincode"
            value={formData.pincode}
            onChange={(e) =>
              setFormData({ ...formData, pincode: e.target.value })
            }
            required
          />

          <Input
            label="Contact Phone"
            type="tel"
            placeholder="+91 9876543210"
            value={formData.contactPhone}
            onChange={(e) =>
              setFormData({ ...formData, contactPhone: e.target.value })
            }
            required
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
              {editingCentre ? "Update" : "Create"} Centre
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CentresPage;
