import { useParams } from "react-router-dom";

const ClinicianAppointmentsPage: React.FC = () => {
  const { clinicianId } = useParams();

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-white">
        Clinician Appointments – {clinicianId}
      </h2>
      <p className="text-sm text-slate-400">
        Day view of appointments for this clinician will be shown here.
      </p>
    </div>
  );
};

export default ClinicianAppointmentsPage;
