import { SlotBlockingPanel } from "../../../components/SlotBlocking/SlotBlockingPanel";

const SlotBlockingPage = () => {
  // TODO: Get clinician context from route params or user context
  // For now, using placeholder values - admin can select clinician from dropdown
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Slot Management</h1>
        <p className="text-slate-400 text-sm">
          Block time slots when clinicians are unavailable
        </p>
      </div>
      {/* Pass default/placeholder values for now - component should handle clinician selection */}
      <SlotBlockingPanel
        clinicianId={1}
        centreId={1}
        clinicianName="Select Clinician"
      />
    </div>
  );
};

export default SlotBlockingPage;
