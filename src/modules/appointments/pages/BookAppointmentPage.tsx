import React from "react";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";

const BookAppointmentPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-semibold text-white mb-4">
          Book Appointment
        </h2>
        <p className="text-slate-400 mb-4">
          Appointment booking form coming soon...
        </p>
        <Button variant="primary">Book New Appointment</Button>
      </Card>
    </div>
  );
};

export default BookAppointmentPage;
