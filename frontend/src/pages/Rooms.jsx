import { useEffect, useState } from "react";
import { Search, Plus, RefreshCw, Pencil, Trash2, X, AlertCircle } from "lucide-react";
import api from "../services/api";

const emptyForm = {
  room_number: "",
  room_type: "",
  room_occupancy: "",
  room_price: "",
  availability_status: true,
};

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [addForm, setAddForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editOriginalNumber, setEditOriginalNumber] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchRooms = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/room/allrooms");
      setRooms(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to fetch rooms. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const filteredRooms = rooms.filter((r) =>
    String(r.room_number || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const openAdd = () => {
    setAddForm(emptyForm);
    setFormError("");
    setShowAdd(true);
  };

  const openEdit = (room) => {
    setEditOriginalNumber(room.room_number);
    setEditForm({
      room_number: room.room_number ?? "",
      room_type: room.room_type ?? "",
      room_occupancy: room.room_occupancy ?? "",
      room_price: room.room_price ?? "",
      availability_status:
        room.availability_status === undefined ? true : room.availability_status,
    });
    setFormError("");
    setShowEdit(true);
  };

  const openDelete = (room) => {
    setDeleteTarget(room);
    setFormError("");
    setShowDelete(true);
  };

  const closeModals = () => {
    setShowAdd(false);
    setShowEdit(false);
    setShowDelete(false);
    setDeleteTarget(null);
    setFormError("");
  };

  const buildPayload = (form) => ({
    room_number: String(form.room_number).trim(),
    room_type: String(form.room_type).trim(),
    room_occupancy: Number(form.room_occupancy),
    room_price: Number(form.room_price),
    availability_status: Boolean(form.availability_status),
  });

  const handleAdd = async (e) => {
    e.preventDefault();
    setFormError("");
    if (
      !addForm.room_number ||
      !addForm.room_type ||
      addForm.room_occupancy === "" ||
      addForm.room_price === ""
    ) {
      setFormError("All fields are required.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/room", buildPayload(addForm));
      closeModals();
      await fetchRooms();
    } catch (err) {
      setFormError(
        err?.response?.data?.detail || err?.message || "Failed to add room."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      await api.patch(
        `/room/update/${encodeURIComponent(editOriginalNumber)}`,
        buildPayload(editForm)
      );
      closeModals();
      await fetchRooms();
    } catch (err) {
      setFormError(
        err?.response?.data?.detail || err?.message || "Failed to update room."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setFormError("");
    setSubmitting(true);
    try {
      await api.delete(
        `/room/delete/${encodeURIComponent(deleteTarget.room_number)}`
      );
      closeModals();
      await fetchRooms();
    } catch (err) {
      setFormError(
        err?.response?.data?.detail || err?.message || "Failed to delete room."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-white min-h-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Rooms</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage all hotel rooms, their availability and pricing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchRooms}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Room
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by room number..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            Loading rooms...
          </div>
        ) : error ? (
          <div className="p-6 flex items-start gap-3 text-sm text-red-700 bg-red-50 border-b border-red-200">
            <AlertCircle className="w-5 h-5 mt-0.5" />
            <div>
              <p className="font-medium">Failed to load rooms</p>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No rooms found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left font-medium px-4 py-3">Room #</th>
                  <th className="text-left font-medium px-4 py-3">Type</th>
                  <th className="text-left font-medium px-4 py-3">Occupancy</th>
                  <th className="text-left font-medium px-4 py-3">Price</th>
                  <th className="text-left font-medium px-4 py-3">Status</th>
                  <th className="text-right font-medium px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredRooms.map((room) => (
                  <tr key={room.id ?? room.room_number} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {room.room_number}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{room.room_type}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {room.room_occupancy}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {room.room_price}
                    </td>
                    <td className="px-4 py-3">
                      {room.availability_status ? (
                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded">
                          Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 rounded">
                          Occupied
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(room)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => openDelete(room)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 bg-white border border-red-300 rounded hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAdd && (
        <Modal title="Add Room" onClose={closeModals}>
          <RoomForm
            form={addForm}
            setForm={setAddForm}
            onSubmit={handleAdd}
            onCancel={closeModals}
            submitting={submitting}
            formError={formError}
            submitLabel="Add Room"
          />
        </Modal>
      )}

      {showEdit && (
        <Modal title={`Edit Room ${editOriginalNumber}`} onClose={closeModals}>
          <RoomForm
            form={editForm}
            setForm={setEditForm}
            onSubmit={handleEdit}
            onCancel={closeModals}
            submitting={submitting}
            formError={formError}
            submitLabel="Save Changes"
          />
        </Modal>
      )}

      {showDelete && deleteTarget && (
        <Modal title="Delete Room" onClose={closeModals}>
          <div className="space-y-4">
            <p className="text-sm text-slate-700">
              Are you sure you want to delete room{" "}
              <span className="font-semibold text-slate-900">
                {deleteTarget.room_number}
              </span>
              ? This action cannot be undone.
            </p>
            {formError && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
                {formError}
              </div>
            )}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={closeModals}
                className="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-60"
              >
                {submitting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="bg-white w-full max-w-md rounded-lg shadow-lg border border-slate-200">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-slate-700 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function RoomForm({
  form,
  setForm,
  onSubmit,
  onCancel,
  submitting,
  formError,
  submitLabel,
}) {
  const update = (key, value) => setForm({ ...form, [key]: value });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">
          Room Number
        </label>
        <input
          type="text"
          value={form.room_number}
          onChange={(e) => update("room_number", e.target.value)}
          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">
          Room Type
        </label>
        <input
          type="text"
          value={form.room_type}
          onChange={(e) => update("room_type", e.target.value)}
          placeholder="Single, Double, Suite..."
          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Occupancy
          </label>
          <input
            type="number"
            min="1"
            value={form.room_occupancy}
            onChange={(e) => update("room_occupancy", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Price
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.room_price}
            onChange={(e) => update("room_price", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="availability_status"
          type="checkbox"
          checked={!!form.availability_status}
          onChange={(e) => update("availability_status", e.target.checked)}
          className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="availability_status" className="text-sm text-slate-700">
          Available
        </label>
      </div>

      {formError && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
          {formError}
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-60"
        >
          {submitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}