import { useParams } from "react-router-dom";

const CentreAppointmentsPage: React.FC = () => {
  const { centreId } = useParams();

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-white">
        Centre Appointments – {centreId}
      </h2>
      <p className="text-sm text-slate-400">
        List of appointments for this centre will be shown here.
      </p>
    </div>
  );
};

export default CentreAppointmentsPage;
