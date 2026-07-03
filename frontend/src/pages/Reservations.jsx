import { useEffect, useState } from "react";
import { Search, Plus, RefreshCw, Pencil, Trash2, X, AlertCircle, Loader2 } from "lucide-react";
import api from "../services/api";

const emptyForm = {
  room_id: "",
  guest_id: "",
  check_in: "",
  check_out: "",
};

export default function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [addForm, setAddForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState({ id: null, ...emptyForm });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchReservations = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/reservation/all");
      setReservations(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      if (err?.response?.status === 404) {
        setReservations([]);
      } else {
        setError(
          err?.response?.data?.detail ||
            err?.message ||
            "Failed to fetch reservations. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const filteredReservations = reservations.filter((r) => {
    const term = search.toLowerCase().trim();
    if (!term) return true;
    return (
      String(r.room_number || "").toLowerCase().includes(term) ||
      String(r.guest_name || "").toLowerCase().includes(term)
    );
  });

  const openAdd = () => {
    setAddForm(emptyForm);
    setFormError("");
    setShowAdd(true);
  };

  const openEdit = (reservation) => {
    setEditForm({
      id: reservation.id,
      room_id: "",
      guest_id: "",
      check_in: formatDateForInput(reservation.check_in),
      check_out: formatDateForInput(reservation.check_out),
    });
    setFormError("");
    setShowEdit(true);
  };

  const openDelete = (reservation) => {
    setDeleteTarget(reservation);
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

  const buildCreatePayload = (form) => ({
    room_id: Number(form.room_id),
    guest_id: Number(form.guest_id),
    check_in: form.check_in,
    check_out: form.check_out,
  });

  const buildUpdatePayload = (form) => {
    const payload = { id: Number(form.id) };
    if (form.room_id !== "" && form.room_id !== null && form.room_id !== undefined) {
      payload.room_id = Number(form.room_id);
    }
    if (form.guest_id !== "" && form.guest_id !== null && form.guest_id !== undefined) {
      payload.guest_id = Number(form.guest_id);
    }
    if (form.check_in) payload.check_in = form.check_in;
    if (form.check_out) payload.check_out = form.check_out;
    return payload;
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setFormError("");
    if (
      addForm.room_id === "" ||
      addForm.guest_id === "" ||
      !addForm.check_in ||
      !addForm.check_out
    ) {
      setFormError("All fields are required.");
      return;
    }
    if (addForm.check_in >= addForm.check_out) {
      setFormError("Check-out must be after check-in.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/reservation/", buildCreatePayload(addForm));
      closeModals();
      await fetchReservations();
    } catch (err) {
      setFormError(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to add reservation."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!editForm.id) {
      setFormError("Invalid reservation.");
      return;
    }
    if (
      editForm.check_in &&
      editForm.check_out &&
      editForm.check_in >= editForm.check_out
    ) {
      setFormError("Check-out must be after check-in.");
      return;
    }
    setSubmitting(true);
    try {
      await api.patch("/reservation/guest/update", buildUpdatePayload(editForm));
      closeModals();
      await fetchReservations();
    } catch (err) {
      setFormError(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to update reservation."
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
        `/reservation/delete/${encodeURIComponent(deleteTarget.id)}`
      );
      closeModals();
      await fetchReservations();
    } catch (err) {
      setFormError(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to delete reservation."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-white min-h-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Reservations</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage all guest reservations, check-ins and check-outs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchReservations}
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
            Add Reservation
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
            placeholder="Search by room number or guest name..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 flex items-center justify-center text-slate-500 text-sm gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading reservations...
          </div>
        ) : error ? (
          <div className="p-6 flex items-start gap-3 text-sm text-red-700 bg-red-50 border-b border-red-200">
            <AlertCircle className="w-5 h-5 mt-0.5" />
            <div>
              <p className="font-medium">Failed to load reservations</p>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No reservations found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left font-medium px-4 py-3">Reservation ID</th>
                  <th className="text-left font-medium px-4 py-3">Room Number</th>
                  <th className="text-left font-medium px-4 py-3">Guest Name</th>
                  <th className="text-left font-medium px-4 py-3">Check In</th>
                  <th className="text-left font-medium px-4 py-3">Check Out</th>
                  <th className="text-left font-medium px-4 py-3">Duration Of Stay</th>
                  <th className="text-right font-medium px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredReservations.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{r.id}</td>
                    <td className="px-4 py-3 text-slate-700">{r.room_number}</td>
                    <td className="px-4 py-3 text-slate-700">{r.guest_name}</td>
                    <td className="px-4 py-3 text-slate-700">{formatDateDisplay(r.check_in)}</td>
                    <td className="px-4 py-3 text-slate-700">{formatDateDisplay(r.check_out)}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {r.duration_of_stay}{" "}
                      <span className="text-slate-500">
                        {Number(r.duration_of_stay) === 1 ? "night" : "nights"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(r)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => openDelete(r)}
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
        <Modal title="Add Reservation" onClose={closeModals}>
          <ReservationForm
            form={addForm}
            setForm={setAddForm}
            onSubmit={handleAdd}
            onCancel={closeModals}
            submitting={submitting}
            formError={formError}
            submitLabel="Add Reservation"
          />
        </Modal>
      )}

      {showEdit && (
        <Modal title={`Edit Reservation #${editForm.id ?? ""}`} onClose={closeModals}>
          <ReservationForm
            form={editForm}
            setForm={setEditForm}
            onSubmit={handleEdit}
            onCancel={closeModals}
            submitting={submitting}
            formError={formError}
            submitLabel="Save Changes"
            isEdit
          />
        </Modal>
      )}

      {showDelete && deleteTarget && (
        <Modal title="Delete Reservation" onClose={closeModals}>
          <div className="space-y-4">
            <p className="text-sm text-slate-700">
              Are you sure you want to delete reservation{" "}
              <span className="font-semibold text-slate-900">#{deleteTarget.id}</span>{" "}
              for{" "}
              <span className="font-semibold text-slate-900">{deleteTarget.guest_name}</span>{" "}
              in room{" "}
              <span className="font-semibold text-slate-900">{deleteTarget.room_number}</span>
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

function ReservationForm({
  form,
  setForm,
  onSubmit,
  onCancel,
  submitting,
  formError,
  submitLabel,
  isEdit = false,
}) {
  const update = (key, value) => setForm({ ...form, [key]: value });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Room ID</label>
          <input
            type="number"
            min="1"
            value={form.room_id}
            onChange={(e) => update("room_id", e.target.value)}
            placeholder={isEdit ? "Leave empty to keep" : "e.g. 1"}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Guest ID</label>
          <input
            type="number"
            min="1"
            value={form.guest_id}
            onChange={(e) => update("guest_id", e.target.value)}
            placeholder={isEdit ? "Leave empty to keep" : "e.g. 1"}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Check In</label>
          <input
            type="date"
            value={form.check_in}
            onChange={(e) => update("check_in", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Check Out</label>
          <input
            type="date"
            value={form.check_out}
            onChange={(e) => update("check_out", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
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

function formatDateForInput(value) {
  if (!value) return "";
  try {
    const s = String(value);
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
    const d = new Date(s);
    if (isNaN(d.getTime())) return "";
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  } catch {
    return "";
  }
}

function formatDateDisplay(value) {
  if (!value) return "-";
  try {
    const s = String(value);
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return d.toISOString().slice(0, 10);
  } catch {
    return String(value);
  }
}