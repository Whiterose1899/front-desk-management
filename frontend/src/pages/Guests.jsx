import { useEffect, useState } from "react";
import { Search, Plus, RefreshCw, Pencil, Trash2, X, AlertCircle, Loader2 } from "lucide-react";
import api from "../services/api";

const emptyForm = {
  first_name: "",
  last_name: "",
  email_address: "",
  phone_number: "",
};

export default function Guests() {
  const [guests, setGuests] = useState([]);
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

  const fetchGuests = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/guest");
      setGuests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to fetch guests. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, []);

  const filteredGuests = guests.filter((g) => {
    const term = search.toLowerCase().trim();
    if (!term) return true;
    return (
      String(g.first_name || "").toLowerCase().includes(term) ||
      String(g.last_name || "").toLowerCase().includes(term) ||
      String(g.email_address || "").toLowerCase().includes(term)
    );
  });

  const openAdd = () => {
    setAddForm(emptyForm);
    setFormError("");
    setShowAdd(true);
  };

  const openEdit = (guest) => {
    setEditForm({
      id: guest.id,
      first_name: guest.first_name ?? "",
      last_name: guest.last_name ?? "",
      email_address: guest.email_address ?? "",
      phone_number: guest.phone_number ?? "",
    });
    setFormError("");
    setShowEdit(true);
  };

  const openDelete = (guest) => {
    setDeleteTarget(guest);
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
    first_name: String(form.first_name).trim(),
    last_name: String(form.last_name).trim(),
    email_address: String(form.email_address).trim(),
    phone_number: String(form.phone_number).trim(),
  });

  const buildUpdatePayload = (form) => ({
    id: form.id,
    first_name: String(form.first_name).trim(),
    last_name: String(form.last_name).trim(),
    email_address: String(form.email_address).trim(),
    phone_number: String(form.phone_number).trim(),
  });

  const handleAdd = async (e) => {
    e.preventDefault();
    setFormError("");
    if (
      !addForm.first_name ||
      !addForm.last_name ||
      !addForm.email_address ||
      !addForm.phone_number
    ) {
      setFormError("All fields are required.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/guest", buildCreatePayload(addForm));
      closeModals();
      await fetchGuests();
    } catch (err) {
      setFormError(
        err?.response?.data?.detail || err?.message || "Failed to add guest."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!editForm.id) {
      setFormError("Invalid guest.");
      return;
    }
    setSubmitting(true);
    try {
      await api.patch("/guests/", buildUpdatePayload(editForm));
      closeModals();
      await fetchGuests();
    } catch (err) {
      setFormError(
        err?.response?.data?.detail || err?.message || "Failed to update guest."
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
      await api.delete(`/guest/delete/${encodeURIComponent(deleteTarget.id)}`);
      closeModals();
      await fetchGuests();
    } catch (err) {
      setFormError(
        err?.response?.data?.detail || err?.message || "Failed to delete guest."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return "-";
    try {
      const d = new Date(value);
      if (isNaN(d.getTime())) return String(value);
      return d.toLocaleString();
    } catch {
      return String(value);
    }
  };

  return (
    <div className="p-6 bg-white min-h-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Guests</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage all hotel guests and their contact details.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchGuests}
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
            Add Guest
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
            placeholder="Search by first name, last name, or email..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 flex items-center justify-center text-slate-500 text-sm gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading guests...
          </div>
        ) : error ? (
          <div className="p-6 flex items-start gap-3 text-sm text-red-700 bg-red-50 border-b border-red-200">
            <AlertCircle className="w-5 h-5 mt-0.5" />
            <div>
              <p className="font-medium">Failed to load guests</p>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        ) : filteredGuests.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No guests found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left font-medium px-4 py-3">ID</th>
                  <th className="text-left font-medium px-4 py-3">First Name</th>
                  <th className="text-left font-medium px-4 py-3">Last Name</th>
                  <th className="text-left font-medium px-4 py-3">Email</th>
                  <th className="text-left font-medium px-4 py-3">Phone</th>
                  <th className="text-left font-medium px-4 py-3">Created At</th>
                  <th className="text-right font-medium px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredGuests.map((guest) => (
                  <tr key={guest.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{guest.id}</td>
                    <td className="px-4 py-3 text-slate-700">{guest.first_name}</td>
                    <td className="px-4 py-3 text-slate-700">{guest.last_name}</td>
                    <td className="px-4 py-3 text-slate-700">{guest.email_address}</td>
                    <td className="px-4 py-3 text-slate-700">{guest.phone_number}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(guest.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(guest)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => openDelete(guest)}
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
        <Modal title="Add Guest" onClose={closeModals}>
          <GuestForm
            form={addForm}
            setForm={setAddForm}
            onSubmit={handleAdd}
            onCancel={closeModals}
            submitting={submitting}
            formError={formError}
            submitLabel="Add Guest"
          />
        </Modal>
      )}

      {showEdit && (
        <Modal title={`Edit Guest #${editForm.id ?? ""}`} onClose={closeModals}>
          <GuestForm
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
        <Modal title="Delete Guest" onClose={closeModals}>
          <div className="space-y-4">
            <p className="text-sm text-slate-700">
              Are you sure you want to delete guest{" "}
              <span className="font-semibold text-slate-900">
                {deleteTarget.first_name} {deleteTarget.last_name}
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

function GuestForm({
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
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">First Name</label>
          <input
            type="text"
            value={form.first_name}
            onChange={(e) => update("first_name", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Last Name</label>
          <input
            type="text"
            value={form.last_name}
            onChange={(e) => update("last_name", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
        <input
          type="email"
          value={form.email_address}
          onChange={(e) => update("email_address", e.target.value)}
          placeholder="guest@example.com"
          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
        <input
          type="text"
          value={form.phone_number}
          onChange={(e) => update("phone_number", e.target.value)}
          placeholder="+1 555 123 4567"
          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
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