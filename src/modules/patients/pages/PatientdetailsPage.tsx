import React from "react";
import { useParams } from "react-router-dom";
import Card from "../../../components/ui/Card";

const PatientDetailsPage: React.FC = () => {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-semibold text-white mb-4">
          Patient Details – {id}
        </h2>
        <p className="text-slate-400">
          Detailed patient view (profile, appointments, payments) will go here.
        </p>
      </Card>
    </div>
  );
};

export default PatientDetailsPage;
