import React from "react";
import Card from "../ui/Card";

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  avatar: string;
  patientCount: number;
}

export interface TopDoctorsCardProps {
  doctors: Doctor[];
}

const TopDoctorsCard: React.FC<TopDoctorsCardProps> = ({ doctors }) => {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-white mb-4">Top Doctors</h3>
      <div className="space-y-3">
        {doctors.map((doctor) => (
          <div
            key={doctor.id}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
          >
            <div className="relative">
              <img
                src={doctor.avatar}
                alt={doctor.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {doctor.name}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {doctor.specialty}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-miboTeal">
                {doctor.patientCount}+
              </p>
              <p className="text-xs text-slate-500">patients</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default TopDoctorsCard;
