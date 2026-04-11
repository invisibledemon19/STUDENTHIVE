'use client';
import { useState, useEffect } from 'react';
import styles from './booking.module.css';

const resources = [
  { id: 1, name: 'Computer Lab A', type: 'lab', building: 'Tech Block', floor: '2nd', capacity: 40, amenities: ['Projector', 'AC', 'Wi-Fi', 'Whiteboard'] },
  { id: 2, name: 'Computer Lab B', type: 'lab', building: 'Tech Block', floor: '2nd', capacity: 35, amenities: ['Projector', 'AC', 'Wi-Fi'] },
  { id: 3, name: 'Physics Lab', type: 'lab', building: 'Science Block', floor: '1st', capacity: 30, amenities: ['AC', 'Instruments'] },
  { id: 4, name: 'Chemistry Lab', type: 'lab', building: 'Science Block', floor: '1st', capacity: 25, amenities: ['AC', 'Fume Hood'] },
  { id: 5, name: 'Electronics Lab', type: 'lab', building: 'Tech Block', floor: '3rd', capacity: 30, amenities: ['Oscilloscopes', 'AC'] },
  { id: 6, name: 'Biology Lab', type: 'lab', building: 'Science Block', floor: '2nd', capacity: 28, amenities: ['Microscopes', 'AC'] },
  { id: 7, name: 'Robotics Lab', type: 'lab', building: 'Innovation Hub', floor: '1st', capacity: 20, amenities: ['3D Printers', 'Tools'] },
  { id: 8, name: 'AI Research Lab', type: 'lab', building: 'Innovation Hub', floor: '2nd', capacity: 15, amenities: ['GPUs', 'Wi-Fi'] },
  { id: 9, name: 'Design Studio', type: 'lab', building: 'Arts Block', floor: '1st', capacity: 25, amenities: ['iMacs', 'Tablets'] },
  { id: 10, name: 'Network Lab', type: 'lab', building: 'Tech Block', floor: '3rd', capacity: 20, amenities: ['Routers', 'Switches'] },
  { id: 11, name: 'Main Auditorium', type: 'hall', building: 'Central Block', floor: 'Ground', capacity: 500, amenities: ['Projector', 'Sound System', 'Stage'] },
  { id: 12, name: 'Mini Auditorium', type: 'hall', building: 'Central Block', floor: '1st', capacity: 150, amenities: ['Projector', 'Sound System'] },
  { id: 13, name: 'Conference Hall', type: 'hall', building: 'Admin Block', floor: '3rd', capacity: 80, amenities: ['Video Conf', 'Whiteboard'] },
];

const timeSlots = ['8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM'];
const existingBookings = [
  { resourceId: 1, date: '2026-04-11', startSlot: 2, endSlot: 4 },
  { resourceId: 6, date: '2026-04-11', startSlot: 0, endSlot: 2 },
  { resourceId: 11, date: '2026-04-12', startSlot: 3, endSlot: 5 },
];

export default function BookingPage() {
  const [filter, setFilter] = useState('all');
  const [selectedResource, setSelectedResource] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [startSlot, setStartSlot] = useState(-1);
  const [endSlot, setEndSlot] = useState(-1);
  const [purpose, setPurpose] = useState('');
  const [bookings, setBookings] = useState(existingBookings);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => { setSelectedDate(new Date().toISOString().split('T')[0]); }, []);

  const filteredResources = resources.filter(r => {
    const mf = filter === 'all' || r.type === filter;
    const ms = r.name.toLowerCase().includes(search.toLowerCase()) || r.building.toLowerCase().includes(search.toLowerCase());
    return mf && ms;
  });

  const isSlotBooked = (i) => !selectedResource || !selectedDate ? false : bookings.some(b => b.resourceId === selectedResource.id && b.date === selectedDate && i >= b.startSlot && i < b.endSlot);
  const hasConflict = () => { if(startSlot===-1||endSlot===-1||!selectedResource||!selectedDate)return false; const s=Math.min(startSlot,endSlot),e=Math.max(startSlot,endSlot)+1; return bookings.some(b=>b.resourceId===selectedResource.id&&b.date===selectedDate&&s<b.endSlot&&e>b.startSlot); };
  const isSlotSelected = (i) => { if(startSlot===-1)return false; return i>=Math.min(startSlot,endSlot)&&i<=Math.max(startSlot,endSlot); };

  const handleSlotClick = (i) => { if(isSlotBooked(i))return; if(startSlot===-1){setStartSlot(i);setEndSlot(i);}else if(endSlot===startSlot){setEndSlot(i);}else{setStartSlot(i);setEndSlot(i);} };

  const handleBooking = () => {
    if(!selectedResource||startSlot===-1||!selectedDate||!purpose){setToast({type:'error',message:'Please fill all booking details.'});setTimeout(()=>setToast(null),3000);return;}
    if(hasConflict()){setToast({type:'error',message:'⚠️ Conflict detected!'});setTimeout(()=>setToast(null),4000);return;}
    setBookings([...bookings,{resourceId:selectedResource.id,date:selectedDate,startSlot:Math.min(startSlot,endSlot),endSlot:Math.max(startSlot,endSlot)+1,purpose,status:'pending'}]);
    setShowModal(false);setStartSlot(-1);setEndSlot(-1);setPurpose('');
    setToast({type:'success',message:`✅ Booking submitted for ${selectedResource.name}!`});setTimeout(()=>setToast(null),4000);
  };

  return (
    <div className={styles.page}>
      {toast&&<div className="toast-container"><div className="toast" style={{borderLeft:`3px solid ${toast.type==='success'?'var(--success)':'var(--error)'}`}}><span>{toast.message}</span></div></div>}
      <div className={styles.container}>
        <div className={styles.header}><div><h1>Resource Booking</h1><p>Book labs, auditoriums, and facilities with zero conflicts.</p></div></div>
        <div className={styles.filtersRow}>
          <div className="tabs">{['all','lab','hall'].map(f=>(<button key={f} className={`tab ${filter===f?'active':''}`} onClick={()=>setFilter(f)}>{f==='all'?'All Resources':f==='lab'?'🧪 Labs':'🏛️ Halls'}</button>))}</div>
          <input type="text" className="input" placeholder="Search resources..." value={search} onChange={e=>setSearch(e.target.value)} style={{maxWidth:280}}/>
        </div>
        <div className={styles.resourceGrid}>
          {filteredResources.map(r=>(
            <div key={r.id} className={`${styles.resourceCard} ${selectedResource?.id===r.id?styles.selected:''}`} onClick={()=>{setSelectedResource(r);setStartSlot(-1);setEndSlot(-1);}}>
              <div className={styles.cardTop}><span className={styles.resourceType}>{r.type==='lab'?'🧪':'🏛️'}</span><span className="badge badge-primary">{r.type.toUpperCase()}</span></div>
              <h3>{r.name}</h3>
              <div className={styles.cardMeta}><span>📍 {r.building}, {r.floor} Floor</span><span>👥 {r.capacity} seats</span></div>
              <div className={styles.amenities}>{r.amenities.map((a,i)=><span key={i} className="chip">{a}</span>)}</div>
            </div>
          ))}
        </div>
        {selectedResource&&(
          <div className={styles.bookingPanel}>
            <div className={styles.bookingHeader}><h2>Book: {selectedResource.name}</h2><div className={styles.dateInput}><label>Date:</label><input type="date" className="input" value={selectedDate} onChange={e=>{setSelectedDate(e.target.value);setStartSlot(-1);setEndSlot(-1);}} min={new Date().toISOString().split('T')[0]}/></div></div>
            <p className={styles.slotInstruction}>Click to select start time, then click again for end time:</p>
            <div className={styles.timeGrid}>
              {timeSlots.map((slot,i)=>{const booked=isSlotBooked(i);const selected=isSlotSelected(i);return(
                <button key={i} className={`${styles.timeSlot} ${booked?styles.booked:''} ${selected?styles.selectedSlot:''}`} onClick={()=>handleSlotClick(i)} disabled={booked}>
                  <span className={styles.slotTime}>{slot}</span><span className={styles.slotStatus}>{booked?'Booked':selected?'Selected':'Available'}</span>
                </button>
              );})}
            </div>
            {hasConflict()&&<div className={styles.conflictWarning}>⚠️ <strong>Conflict Detected!</strong> The selected time overlaps with an existing booking.</div>}
            {startSlot!==-1&&<div className={styles.bookingSummary}><div className={styles.summaryInfo}><span>📅 {selectedDate}</span><span>🕐 {timeSlots[Math.min(startSlot,endSlot)]} — {timeSlots[Math.max(startSlot,endSlot)+1]||'End'}</span><span>📍 {selectedResource.name}</span></div><button className="btn btn-primary" onClick={()=>setShowModal(true)} disabled={hasConflict()}>Confirm Booking →</button></div>}
          </div>
        )}
      </div>
      {showModal&&(<div className="modal-overlay" onClick={()=>setShowModal(false)}><div className="modal" onClick={e=>e.stopPropagation()}><h2 style={{marginBottom:8}}>Confirm Booking</h2><p style={{marginBottom:24,fontSize:'0.9rem'}}>Booking <strong>{selectedResource?.name}</strong> on <strong>{selectedDate}</strong></p><div className="input-group" style={{marginBottom:20}}><label>Purpose of Booking</label><textarea className="input" placeholder="e.g., Data Structures Lab" value={purpose} onChange={e=>setPurpose(e.target.value)} rows={3}/></div><div style={{display:'flex',gap:12}}><button className="btn btn-primary" onClick={handleBooking} style={{flex:1}}>Submit Request</button><button className="btn btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button></div></div></div>)}
    </div>
  );
}
