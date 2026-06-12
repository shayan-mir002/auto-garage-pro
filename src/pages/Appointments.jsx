import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { CalendarDays, Clock, User, Car, Wrench, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { DEFAULT_TIME_SLOTS, formatTime } from '../utils/constants';
import toast from 'react-hot-toast';

const SERVICE_TYPES = ['Basic Package', 'Standard Package', 'Premium Package', 'Oil Change', 'Brake Service', 'Tire Rotation', 'Engine Diagnostics', 'General Repair'];

export default function Appointments() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    car_model: '',
    service_type: searchParams.get('service') ? `${searchParams.get('service')} Package` : '',
    notes: '',
  });
  const [date, setDate] = useState(null);
  const [slot, setSlot] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [availableSlots, setAvailableSlots] = useState(DEFAULT_TIME_SLOTS);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Fetch booked slots when date changes
  useEffect(() => {
    if (!date) return;
    fetchBookedSlots(date);
    setSlot('');
  }, [date]);

  // Fetch active slots from DB
  useEffect(() => {
    fetchAvailableSlots();
  }, []);

  const fetchAvailableSlots = async () => {
    const { data } = await supabase.from('time_slots').select('slot_time').eq('is_active', true).order('slot_time');
    if (data && data.length > 0) setAvailableSlots(data.map((r) => r.slot_time));
  };

  const fetchBookedSlots = async (selectedDate) => {
    setLoadingSlots(true);
    const dateStr = selectedDate.toISOString().split('T')[0];
    const { data } = await supabase
      .from('appointments')
      .select('time_slot')
      .eq('appointment_date', dateStr)
      .neq('status', 'Cancelled');
    setBookedSlots(data ? data.map((r) => r.time_slot) : []);
    setLoadingSlots(false);
  };

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date) { toast.error('Please select a date.'); return; }
    if (!slot) { toast.error('Please select a time slot.'); return; }
    if (!form.service_type) { toast.error('Please select a service type.'); return; }

    setSubmitting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id || null;

      const { error } = await supabase.from('appointments').insert({
        ...form,
        user_id: userId,
        appointment_date: date.toISOString().split('T')[0],
        time_slot: slot,
        status: 'Pending',
      });

      if (error) {
        if (error.code === '23505') {
          toast.error('That time slot is already booked. Please choose another.');
        } else {
          throw error;
        }
      } else {
        setSuccess(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      const msg = err.message || err.error_description || 'Failed to book appointment.';
      toast.error(`Error: ${msg}`);
      console.error('Booking Error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Disable past dates and Sundays
  const isDisabledDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today || date.getDay() === 0;
  };

  if (success) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex items-center justify-center">
        <div className="card max-w-md w-full mx-4 p-10 text-center animate-slide-up">
          <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={32} className="text-green-400" />
          </div>
          <h2 className="text-2xl font-display font-bold text-white mb-3">Appointment Confirmed!</h2>
          <p className="text-slate-400 text-sm mb-2">
            <span className="text-white font-medium">{form.customer_name}</span>, your appointment is booked for:
          </p>
          <div className="bg-dark-600 rounded-lg p-4 mb-6 text-sm space-y-1.5">
            <p className="text-slate-300"><span className="text-slate-500">Service:</span> {form.service_type}</p>
            <p className="text-slate-300"><span className="text-slate-500">Date:</span> {date?.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p className="text-slate-300"><span className="text-slate-500">Time:</span> {formatTime(slot)}</p>
            <p className="text-slate-300"><span className="text-slate-500">Vehicle:</span> {form.car_model}</p>
          </div>
          <p className="text-slate-500 text-xs mb-6">A confirmation will be sent to <span className="text-slate-300">{form.customer_email}</span></p>
          <div className="flex gap-3">
            <button onClick={() => { setSuccess(false); setDate(null); setSlot(''); setForm({ customer_name:'',customer_email:'',car_model:'',service_type:'',notes:'' }); }} className="btn-outline flex-1 justify-center text-sm">
              Book Another
            </button>
            <button onClick={() => navigate('/')} className="btn-primary flex-1 justify-center text-sm">
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="section-badge"><CalendarDays size={12} /> Appointments</span>
          <h1 className="section-title">Book a Service</h1>
          <p className="section-subtitle mx-auto">Fill in your details and we'll confirm your appointment within 30 minutes.</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-6">
          {/* Row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label"><User size={13} className="inline mr-1.5 -mt-0.5" />Customer Name <span className="text-red-400">*</span></label>
              <input name="customer_name" value={form.customer_name} onChange={handleChange}
                className="input" placeholder="John Smith" required />
            </div>
            <div>
              <label className="label">Email Address <span className="text-red-400">*</span></label>
              <input name="customer_email" type="email" value={form.customer_email} onChange={handleChange}
                className="input" placeholder="john@email.com" required />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label"><Car size={13} className="inline mr-1.5 -mt-0.5" />Car Model <span className="text-red-400">*</span></label>
              <input name="car_model" value={form.car_model} onChange={handleChange}
                className="input" placeholder="e.g. Toyota Camry 2020" required />
            </div>
            <div>
              <label className="label"><Wrench size={13} className="inline mr-1.5 -mt-0.5" />Service Type <span className="text-red-400">*</span></label>
              <select name="service_type" value={form.service_type} onChange={handleChange} className="select" required>
                <option value="">-- Select a service --</option>
                {SERVICE_TYPES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Date picker */}
          <div>
            <label className="label"><CalendarDays size={13} className="inline mr-1.5 -mt-0.5" />Appointment Date <span className="text-red-400">*</span></label>
            <DatePicker
              selected={date}
              onChange={setDate}
              filterDate={(d) => !isDisabledDate(d)}
              placeholderText="Click to select a date"
              className="input w-full"
              dateFormat="MMMM d, yyyy"
              minDate={new Date()}
              wrapperClassName="w-full"
            />
            <p className="text-slate-600 text-xs mt-1.5">Monday – Saturday. Sundays are closed.</p>
          </div>

          {/* Time slots */}
          <div>
            <label className="label">
              <Clock size={13} className="inline mr-1.5 -mt-0.5" />
              Time Slot <span className="text-red-400">*</span>
              {date && <span className="text-slate-500 text-xs ml-2">({bookedSlots.length} slot{bookedSlots.length !== 1 ? 's' : ''} booked)</span>}
            </label>
            {!date ? (
              <p className="text-slate-500 text-sm py-3">Please select a date first to see available slots.</p>
            ) : loadingSlots ? (
              <div className="flex items-center gap-2 text-slate-500 text-sm py-3">
                <Loader2 size={14} className="animate-spin" /> Loading slots...
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {availableSlots.map((t) => {
                  const booked = bookedSlots.includes(t);
                  const selected = slot === t;
                  return (
                    <button
                      type="button"
                      key={t}
                      disabled={booked}
                      onClick={() => setSlot(t)}
                      className={`py-2.5 rounded-lg text-sm font-medium border transition-all duration-200 ${
                        booked ? 'bg-dark-800 border-dark-400/30 text-dark-200 cursor-not-allowed line-through' :
                        selected ? 'bg-brand-gradient border-brand-600 text-white shadow-glow-blue' :
                        'bg-dark-700 border-dark-300 text-slate-400 hover:border-brand-700 hover:text-white'
                      }`}
                    >
                      {formatTime(t)}
                    </button>
                  );
                })}
              </div>
            )}
            <div className="flex gap-4 mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-brand-700 inline-block" /> Selected</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-dark-700 border border-dark-300 inline-block" /> Available</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-dark-800 border border-dark-400/30 inline-block" /> Booked</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="label">Additional Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange}
              className="input resize-none" rows={3}
              placeholder="Describe any specific issues with your vehicle..." />
          </div>

          <button type="submit" disabled={submitting} className="btn-accent w-full justify-center text-base py-3.5">
            {submitting ? <><Loader2 size={18} className="animate-spin" /> Booking...</> : <><CalendarDays size={18} /> Confirm Appointment</>}
          </button>
        </form>
      </div>
    </div>
  );
}
