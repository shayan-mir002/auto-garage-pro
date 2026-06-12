import { useEffect, useState } from 'react';
import { Clock, RefreshCw, Loader2, ToggleLeft, ToggleRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { DEFAULT_TIME_SLOTS, formatTime } from '../../utils/constants';
import toast from 'react-hot-toast';

export default function ManageTimeSlots() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  useEffect(() => { fetchSlots(); }, []);

  const fetchSlots = async () => {
    setLoading(true);
    const { data } = await supabase.from('time_slots').select('*').order('slot_time');
    if (data && data.length > 0) {
      setSlots(data);
    } else {
      // Show defaults if table is empty
      setSlots(DEFAULT_TIME_SLOTS.map((t) => ({ id: null, slot_time: t, is_active: true })));
    }
    setLoading(false);
  };

  const toggleSlot = async (slot) => {
    if (!slot.id) {
      // Slot not yet in DB — seed all defaults first
      await seedDefaults();
      return;
    }
    const newVal = !slot.is_active;
    const { error } = await supabase.from('time_slots').update({ is_active: newVal }).eq('id', slot.id);
    if (error) { toast.error('Failed to update slot.'); return; }
    setSlots((prev) => prev.map((s) => s.id === slot.id ? { ...s, is_active: newVal } : s));
    toast.success(`${formatTime(slot.slot_time)} ${newVal ? 'enabled' : 'disabled'}.`);
  };

  const seedDefaults = async () => {
    const { error } = await supabase.from('time_slots').upsert(
      DEFAULT_TIME_SLOTS.map((t) => ({ slot_time: t, is_active: true })),
      { onConflict: 'slot_time' }
    );
    if (error) { toast.error('Failed to seed slots.'); return; }
    toast.success('Default time slots initialized.');
    fetchSlots();
  };

  const resetAll = async () => {
    if (!window.confirm('Reset all slots to active?')) return;
    setResetting(true);
    const { error } = await supabase.from('time_slots').upsert(
      DEFAULT_TIME_SLOTS.map((t) => ({ slot_time: t, is_active: true })),
      { onConflict: 'slot_time' }
    );
    if (error) { toast.error('Reset failed.'); }
    else { toast.success('All slots reset to active.'); fetchSlots(); }
    setResetting(false);
  };

  const activeCount = slots.filter((s) => s.is_active).length;

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-display font-bold text-xl">Time Slots</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            {activeCount} of {slots.length} slots active · Mon–Sat, 8 AM–5 PM
          </p>
        </div>
        <button onClick={resetAll} disabled={resetting} className="btn-outline text-sm py-2">
          {resetting ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          Reset All
        </button>
      </div>

      <div className="card p-5">
        <p className="text-slate-400 text-sm mb-5 leading-relaxed">
          Toggle individual time slots on or off. Disabled slots will be greyed out and unselectable on the booking form. Changes apply immediately.
        </p>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-16 bg-dark-600 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {slots.map((slot) => (
              <button
                key={slot.slot_time}
                onClick={() => toggleSlot(slot)}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 group ${
                  slot.is_active
                    ? 'bg-brand-900/30 border-brand-700/50 hover:border-brand-500'
                    : 'bg-dark-700 border-dark-300/40 hover:border-dark-200 opacity-60'
                }`}
              >
                <div className="text-left">
                  <p className={`text-sm font-semibold ${slot.is_active ? 'text-white' : 'text-slate-500 line-through'}`}>
                    {formatTime(slot.slot_time)}
                  </p>
                  <p className={`text-xs mt-0.5 ${slot.is_active ? 'text-brand-400' : 'text-slate-600'}`}>
                    {slot.is_active ? 'Available' : 'Disabled'}
                  </p>
                </div>
                {slot.is_active
                  ? <ToggleRight size={22} className="text-brand-400" />
                  : <ToggleLeft size={22} className="text-slate-600" />
                }
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="card p-4 flex items-start gap-3">
        <Clock size={16} className="text-accent-orange mt-0.5 flex-shrink-0" />
        <p className="text-slate-400 text-sm leading-relaxed">
          <span className="text-white font-medium">Note: </span>
          Disabling a slot prevents new bookings but does not affect existing appointments already scheduled in that slot.
        </p>
      </div>
    </div>
  );
}
