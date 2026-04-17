import React, { useState, useEffect } from "react";
import appointmentService from "../../services/appointmentService";
import api from "../../services/api";

interface NotesPanelProps {
  appointmentId: number;
  onClose: () => void;
  onSave: () => void;
}

const NotesPanel: React.FC<NotesPanelProps> = ({
  appointmentId,
  onClose,
  onSave,
}) => {
  const [notes, setNotes] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotes();
  }, [appointmentId]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await appointmentService.getAppointmentById(
        appointmentId.toString(),
      );
      const existingNotes = response.notes || "";
      setNotes(existingNotes);
      setIsEditing(existingNotes === "");
    } catch (error) {
      console.error("Failed to fetch notes:", error);
      setError("Failed to load notes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      await api.patch(`/appointments/${appointmentId}/notes`, { notes });
      onSave();
    } catch (error) {
      console.error("Failed to save notes:", error);
      setError("Failed to save notes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (notes) {
      setIsEditing(false);
    } else {
      onClose();
    }
  };

  return (
    <div className="notes-panel-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="notes-panel bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="notes-header flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Appointment Notes</h2>
          <button
            onClick={onClose}
            className="close-button text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        <div className="notes-content p-4">
          {loading ? (
            <div className="text-center py-8">Loading notes...</div>
          ) : (
            <>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={!isEditing}
                placeholder="Enter appointment notes here..."
                rows={10}
                className={`notes-textarea w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  !isEditing ? "bg-gray-50 cursor-not-allowed" : ""
                }`}
              />

              <div className="notes-actions flex gap-3 mt-4">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="save-button bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-2 rounded-lg font-medium"
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                    {notes && (
                      <button
                        onClick={handleCancel}
                        className="cancel-button bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg font-medium"
                      >
                        Cancel
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="edit-button bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium"
                  >
                    Edit
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotesPanel;
