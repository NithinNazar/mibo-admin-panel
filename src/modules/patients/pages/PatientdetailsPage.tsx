import { useParams } from "react-router-dom";

const PatientDetailsPage: React.FC = () => {
  const { id } = useParams();

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-white">
        Patient Details – {id}
      </h2>
      <p className="text-sm text-slate-400">
        Detailed patient view (profile, appointments, payments) will go here.
      </p>
    </div>
  );
};

export default PatientDetailsPage;
