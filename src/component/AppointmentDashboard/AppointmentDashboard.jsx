import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Eye, Trash2, Search, SlidersHorizontal, Phone, Mail,
  Calendar, MessageSquare, X, TrendingUp, BookOpen,
  ListFilter, Loader2, Clock, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:1000/api';

// ── Status badge styles ──
const STATUS_STYLES = {
  pending:   { pill: 'bg-amber-100 text-amber-700 border border-amber-200',   dot: 'bg-amber-400',  icon: AlertCircle },
  confirmed: { pill: 'bg-emerald-100 text-emerald-700 border border-emerald-200', dot: 'bg-emerald-400', icon: CheckCircle },
  cancelled: { pill: 'bg-red-100 text-red-600 border border-red-200',         dot: 'bg-red-400',    icon: XCircle },
};

// ── Time slot styles ──
const TIME_STYLES = {
  'bg-blue-50 text-blue-700 border border-blue-100': ['09:00 AM', '10:00 AM', '11:00 AM'],
  'bg-orange-50 text-orange-700 border border-orange-100': ['12:00 PM'],
  'bg-violet-50 text-violet-700 border border-violet-100': ['02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'],
};

const getTimeStyle = (time) => {
  for (const [style, slots] of Object.entries(TIME_STYLES)) {
    if (slots.includes(time)) return style;
  }
  return 'bg-slate-100 text-slate-600 border border-slate-200';
};

const fmt = (dateStr, opts) => {
  try { return new Date(dateStr).toLocaleDateString('en-IN', opts); }
  catch { return '—'; }
};

const StatusBadge = ({ status, size = 'sm' }) => {
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full whitespace-nowrap
      ${size === 'sm' ? 'text-xs px-2.5 py-0.5' : 'text-sm px-3 py-1'} ${s.pill}`}>
      <Icon className="w-3 h-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const AppointmentDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected]         = useState(null);
  const [deleteModal, setDeleteModal]   = useState({ show: false, id: null });
  const [deleting, setDeleting]         = useState(false);
  const [updatingId, setUpdatingId]     = useState(null);

  // ── Fetch all appointments ──
  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE}/appointments`);
      setAppointments(res.data.data || []);
    } catch {
      setError('Failed to load appointments. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  // ── Update status ──
  const handleStatusUpdate = async (id, status) => {
    setUpdatingId(id);
    try {
      const res = await axios.patch(`${API_BASE}/appointments/${id}/status`, { status });
      setAppointments(prev =>
        prev.map(a => a._id === id ? res.data.data : a)
      );
      if (selected?._id === id) setSelected(res.data.data);
    } catch {
      alert('Status update failed. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Delete appointment ──
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(`${API_BASE}/appointments/${deleteModal.id}`);
      setAppointments(prev => prev.filter(a => a._id !== deleteModal.id));
      if (selected?._id === deleteModal.id) setSelected(null);
      setDeleteModal({ show: false, id: null });
    } catch {
      alert('Delete failed. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  // ── Stats ──
  const today      = new Date().toISOString().split('T')[0];
  const todayCount = appointments.filter(a => a.createdAt?.slice(0, 10) === today).length;
  const pendingCount    = appointments.filter(a => a.status === 'pending').length;
  const confirmedCount  = appointments.filter(a => a.status === 'confirmed').length;

  // ── Filter ──
  const filtered = appointments.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = a.name?.toLowerCase().includes(q) ||
                        a.phone?.includes(q) ||
                        a.email?.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // ── Loading ──
  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-orange-400 animate-spin mx-auto mb-3" />
        <p className="text-slate-500 text-sm">Loading appointments…</p>
      </div>
    </div>
  );

  // ── Error ──
  if (error) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white border border-red-100 rounded-2xl p-8 max-w-md text-center shadow-sm">
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <X className="w-6 h-6 text-red-400" />
        </div>
        <h3 className="font-bold text-slate-900 mb-2">Connection Error</h3>
        <p className="text-slate-500 text-sm mb-5">{error}</p>
        <button onClick={fetchAppointments}
          className="bg-slate-900 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-slate-700 transition-colors">
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Appointments</h1>
          <p className="text-slate-500 text-sm mt-0.5">All appointment requests from Muscle Work Physiotherapy</p>
        </div>
        <button onClick={fetchAppointments}
          className="flex items-center gap-2 text-xs text-slate-400 bg-white border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors">
          <TrendingUp className="w-3.5 h-3.5 text-orange-400" />
          Refresh
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total',     value: appointments.length, Icon: BookOpen,    color: 'text-slate-700',   bg: 'bg-slate-100' },
          { label: 'Today',     value: todayCount,          Icon: TrendingUp,  color: 'text-orange-600',  bg: 'bg-orange-100' },
          { label: 'Pending',   value: pendingCount,        Icon: AlertCircle, color: 'text-amber-600',   bg: 'bg-amber-100' },
          { label: 'Confirmed', value: confirmedCount,      Icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
        ].map(({ label, value, Icon, color, bg }) => (
          <div key={label} className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</p>
              <span className={`${bg} p-1.5 rounded-lg`}>
                <Icon className={`w-3.5 h-3.5 ${color}`} />
              </span>
            </div>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name, phone or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-orange-300 focus:border-orange-300 outline-none placeholder-slate-400 text-slate-700"
          />
        </div>
        <div className="relative">
          <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="pl-9 pr-8 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-orange-300 outline-none appearance-none cursor-pointer text-slate-700"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['#', 'Patient', 'Phone', 'Date & Time', 'Status', 'Submitted On', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-20 text-slate-400">
                    <Search className="w-8 h-8 mx-auto mb-3 opacity-30" />
                    No appointments found
                  </td>
                </tr>
              ) : filtered.map((a, i) => (
                <tr key={a._id} className="border-b border-slate-50 hover:bg-orange-50/30 transition-colors group">
                  <td className="px-5 py-4 text-slate-300 font-mono text-xs">{String(i + 1).padStart(2, '0')}</td>

                  {/* Patient */}
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-800">{a.name}</p>
                    {a.email && <p className="text-xs text-slate-400 mt-0.5">{a.email}</p>}
                  </td>

                  {/* Phone */}
                  <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{a.phone}</td>

                  {/* Date + Time */}
                  <td className="px-5 py-4">
                    <p className="text-slate-700 font-medium whitespace-nowrap">
                      {a.date ? fmt(a.date, { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </p>
                    {a.time && (
                      <span className={`inline-flex items-center gap-1 text-xs mt-1 px-2 py-0.5 rounded-full font-medium ${getTimeStyle(a.time)}`}>
                        <Clock className="w-2.5 h-2.5" /> {a.time}
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <StatusBadge status={a.status || 'pending'} />
                  </td>

                  {/* Submitted on */}
                  <td className="px-5 py-4 text-slate-400 text-xs whitespace-nowrap">
                    {fmt(a.createdAt, { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setSelected(a)}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-2 rounded-lg transition-colors" title="View details">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteModal({ show: true, id: a._id })}
                        className="bg-red-50 hover:bg-red-100 text-red-500 p-2 rounded-lg transition-colors" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-50 bg-slate-50/50">
            <p className="text-xs text-slate-400">Showing {filtered.length} of {appointments.length} appointments</p>
          </div>
        )}
      </div>

      {/* ── Detail Modal ── */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white">
              <div>
                <h2 className="font-bold text-slate-900">Appointment Detail</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Submitted on {fmt(selected.createdAt, { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <button onClick={() => setSelected(null)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Name + Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-400 mb-1 font-medium">Full Name</p>
                  <p className="font-semibold text-slate-800">{selected.name}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-400 mb-1 font-medium">Phone</p>
                  <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-orange-400" />{selected.phone}
                  </p>
                </div>
              </div>

              {/* Email */}
              {selected.email && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-400 mb-1 font-medium">Email Address</p>
                  <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-orange-400" />{selected.email}
                  </p>
                </div>
              )}

              {/* Date + Time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-400 mb-1 font-medium">Preferred Date</p>
                  <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-orange-400" />
                    {selected.date ? fmt(selected.date, { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-400 mb-1 font-medium">Time Slot</p>
                  <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-orange-400" />
                    {selected.time || '—'}
                  </p>
                </div>
              </div>

              {/* Status update */}
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-400 mb-3 font-medium">Update Status</p>
                <div className="flex gap-2 flex-wrap">
                  {['pending', 'confirmed', 'cancelled'].map(s => (
                    <button
                      key={s}
                      disabled={updatingId === selected._id || selected.status === s}
                      onClick={() => handleStatusUpdate(selected._id, s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border
                        ${selected.status === s
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}
                        disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {updatingId === selected._id
                        ? <Loader2 className="w-3 h-3 animate-spin inline" />
                        : s.charAt(0).toUpperCase() + s.slice(1)
                      }
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              {selected.message && (
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                  <p className="text-xs text-orange-500 mb-2 font-medium flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" /> Message from patient
                  </p>
                  <p className="text-slate-700 text-sm leading-relaxed">{selected.message}</p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center sticky bottom-0 bg-white">
              <button
                onClick={() => { setDeleteModal({ show: true, id: selected._id }); setSelected(null); }}
                className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete appointment
              </button>
              <button onClick={() => setSelected(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-700 text-white rounded-lg text-sm font-semibold transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center mb-1">Delete Appointment?</h3>
            <p className="text-slate-500 text-sm text-center mb-6">This action cannot be undone. The appointment will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal({ show: false, id: null })} disabled={deleting}
                className="flex-1 border border-slate-200 hover:bg-slate-50 font-semibold py-2.5 rounded-xl transition-colors text-sm text-slate-700 disabled:opacity-50">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                {deleting ? <><Loader2 className="w-4 h-4 animate-spin" /> Deleting…</> : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AppointmentDashboard;