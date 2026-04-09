import React from "react";
import Card from "../../../components/ui/Card";
import { useAuth } from "../../../contexts/AuthContext";

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-semibold text-white mb-4">Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-400">Name</label>
            <p className="text-white">{user?.full_name || user?.name}</p>
          </div>
          <div>
            <label className="text-sm text-slate-400">Email</label>
            <p className="text-white">{user?.email || "N/A"}</p>
          </div>
          <div>
            <label className="text-sm text-slate-400">Phone</label>
            <p className="text-white">{user?.phone || "N/A"}</p>
          </div>
          <div>
            <label className="text-sm text-slate-400">Role</label>
            <p className="text-white">{user?.role.replace(/_/g, " ")}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProfilePage;
