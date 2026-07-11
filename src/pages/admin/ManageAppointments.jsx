import React, { useEffect, useState, Fragment } from 'react';
import { CalendarDays, Filter, Loader2, X, Trash2, ChevronDown, Users, FileText } from 'lucide-react';
import { getAll, query, update, insert, remove } from '../../lib/supabase';
import toast from 'react-hot-toast';

const STATUSES = ['All', 'Pending', 'In Progress', 'Ready for Pickup', 'Completed', 'Cancelled'];

const STATUS_COLORS = {
  Pending:            'badge-pending',
  'In Progress':      'bg-blue-900/30 text-blue-400 border border-blue-700/40 px-2.5 py-0.5 rounded-full text-xs font-semibold',
  'Ready for Pickup': 'bg-green-900/30 text-green-400 border border-green-700/40 px-2.5 py-0.5 rounded-full text-xs font-semibold',
  Completed:          'badge-completed',
  Cancelled:          'badge-cancelled',
};

export default function ManageAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [mechanics, setMechanics]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState('All');
  const [dateFilter, setDateFilter]     = useState('');
  const [expandedId, setExpandedId]     = useState(null);
  const [notesMap, setNotesMap]         = useState({});

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [mechanicsList, appts] = await Promise.all([
      query('mechanics', (r) => r.is_available === true),
      getAll('appointments'),
    ]);
    const mechanicsData = mechanicsList.map(({ id, name }) => ({ id, name }));
    appts.sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date));
    setAppointments(appts.map((a) => ({ ...a, mechanic_name: mechanicsData.find((m) => m.id === a.mechanic_id)?.name })));
    setMechanics(mechanicsData);
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    await update('appointments', id, { status });
    const appt = appointments.find(a => a.id === id);
    if (appt) {
      await insert('notifications', {
        user_id: appt.user_id,
        customer_email: appt.customer_email,
        title: 'Appointment Update',
        message: `Your appointment for ${appt.service_type} is now: ${status}.`,
        type: status === 'Completed' ? 'success' : 'info'
      });
    }
    toast.success(`Marked as ${status}`);
    setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));
  };

  const assignMechanic = async (id, mechanicId) => {
    const val = mechanicId === '' ? null : mechanicId;
    await update('appointments', id, { mechanic_id: val });
    const mech = mechanics.find(m => m.id === mechanicId);
    const appt = appointments.find(a => a.id === id);
    
    if (appt && mech) {
      await insert('notifications', {
        user_id: appt.user_id,
        customer_email: appt.customer_email,
        title: 'Mechanic Assigned',
        message: `${mech.name} has been assigned to your ${appt.car_model}.`,
        type: 'success'
      });
    }
    
    setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, mechanic_id: val, mechanics: mech || null } : a));
    toast.success(mech ? `Assigned to ${mech.name}` : 'Mechanic removed');
  };

  const saveMechanicNotes = async (id) => {
    const notes = notesMap[id] ?? '';
    await update('appointments', id, { mechanic_notes: notes });
    setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, mechanic_notes: notes } : a));
    toast.success('Notes saved');
  };

  const deleteAppointment = async (id) => {
    if (!window.confirm('Delete this appointment?')) return;
    await remove('appointments', id);
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    toast.success('Appointment deleted.');
  };

  const filtered = appointments.filter((a) => {
    const matchStatus = filter === 'All' || a.status === filter;
    const matchDate   = !dateFilter || a.appointment_date === dateFilter;
    return matchStatus && matchDate;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-display font-bold text-xl">Appointments</h2>
        <p className="text-slate-500 text-sm">{filtered.length} records</p>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <Filter size={14} className="text-slate-500" />
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === s ? 'bg-brand-gradient text-white' : 'bg-dark-600 border border-dark-300 text-slate-400 hover:text-white'}`}>
              {s}
            </button>
          ))}
        </div>
        <div className="sm:ml-auto flex items-center gap-2">
          <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="input py-1.5 text-sm" />
          {dateFilter && (
            <button onClick={() => setDateFilter('')} className="text-slate-500 hover:text-white"><X size={14} /></button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="table-wrapper rounded-xl">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Vehicle</th>
                <th>Service</th>
                <th>Date / Time</th>
                <th>Status</th>
                <th>Mechanic</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={7}><div className="h-4 bg-dark-600 rounded animate-pulse" /></td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-slate-500 py-10">No appointments found.</td></tr>
              ) : filtered.map((a) => (
                <Fragment key={a.id}>
                  <tr className="cursor-pointer hover:bg-dark-600/30" onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}>
                    <td>
                      <div className="text-white font-medium">{a.customer_name}</div>
                      <div className="text-slate-500 text-xs">{a.customer_email}</div>
                    </td>
                    <td>{a.car_model}</td>
                    <td>{a.service_type}</td>
                    <td>
                      <div>{a.appointment_date}</div>
                      <div className="text-slate-500 text-xs">{a.time_slot}</div>
                    </td>
                    <td>
                      <select
                        value={a.status}
                        onChange={(e) => { e.stopPropagation(); updateStatus(a.id, e.target.value); }}
                        onClick={(e) => e.stopPropagation()}
                        className="select py-1 text-xs"
                      >
                        {STATUSES.filter(s => s !== 'All').map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td>
                      <select
                        value={a.mechanic_id || ''}
                        onChange={(e) => { e.stopPropagation(); assignMechanic(a.id, e.target.value); }}
                        onClick={(e) => e.stopPropagation()}
                        className="select py-1 text-xs"
                      >
                        <option value="">-- Unassigned --</option>
                        {mechanics.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <button onClick={(e) => { e.stopPropagation(); setExpandedId(expandedId === a.id ? null : a.id); }}
                          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-dark-600 transition-colors" title="Notes">
                          <FileText size={14} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); deleteAppointment(a.id); }}
                          className="p-1.5 rounded-md text-red-400 hover:bg-red-400/10 transition-colors" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded mechanic notes row */}
                  {expandedId === a.id && (
                    <tr key={`${a.id}_notes`}>
                      <td colSpan={7} className="bg-dark-700/50 px-4 py-3">
                        <div className="flex gap-3 items-start">
                          <div className="flex-1">
                            <label className="label mb-1">Mechanic Notes (visible to customer)</label>
                            <textarea
                              rows={2}
                              className="input resize-none text-sm"
                              placeholder="Add internal notes or updates for the customer..."
                              defaultValue={a.mechanic_notes || ''}
                              onChange={(e) => setNotesMap(n => ({ ...n, [a.id]: e.target.value }))}
                            />
                          </div>
                          <button
                            onClick={() => saveMechanicNotes(a.id)}
                            className="btn-primary text-sm py-2 mt-5"
                          >
                            Save Notes
                          </button>
                        </div>
                        {a.notes && (
                          <p className="text-slate-500 text-xs mt-2">
                            <span className="text-slate-400 font-medium">Customer Notes:</span> {a.notes}
                          </p>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
