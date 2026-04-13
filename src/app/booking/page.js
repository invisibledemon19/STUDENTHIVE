'use client';
import { useState, useEffect } from 'react';
import styles from './booking.module.css';
import { apiRequest } from '@/lib/client/api';

const timeSlots = [
  '8:00 AM',
  '9:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '1:00 PM',
  '2:00 PM',
  '3:00 PM',
  '4:00 PM',
  '5:00 PM',
];

function slotToTime(slotIndex) {
  const hour = 8 + slotIndex;
  return `${String(hour).padStart(2, '0')}:00`;
}

function timeToSlot(time) {
  const [hours] = String(time || '00:00').split(':').map(Number);
  return hours - 8;
}

function bookingToSlotRange(booking) {
  return {
    startSlot: timeToSlot(booking.startTime),
    endSlot: timeToSlot(booking.endTime),
  };
}

export default function BookingPage() {
  const [filter, setFilter] = useState('all');
  const [resources, setResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [startSlot, setStartSlot] = useState(-1);
  const [endSlot, setEndSlot] = useState(-1);
  const [purpose, setPurpose] = useState('');
  const [bookings, setBookings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadResources() {
      try {
        const response = await apiRequest('/api/resources');
        if (mounted) {
          setResources(response.resources || []);
        }
      } catch (error) {
        if (mounted) {
          setToast({ type: 'error', message: error.message || 'Unable to load resources.' });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadResources();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadBookings() {
      if (!selectedResource || !selectedDate) {
        if (mounted) {
          setBookings([]);
        }
        return;
      }

      try {
        const query = `/api/bookings?resourceId=${selectedResource.id}&date=${selectedDate}`;
        const response = await apiRequest(query);
        if (mounted) {
          setBookings(response.bookings || []);
        }
      } catch (error) {
        if (mounted) {
          setToast({ type: 'error', message: error.message || 'Unable to load bookings.' });
        }
      }
    }

    loadBookings();
    return () => {
      mounted = false;
    };
  }, [selectedResource, selectedDate]);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const filteredResources = resources.filter((resource) => {
    const matchFilter = filter === 'all' || resource.type === filter;
    const query = search.toLowerCase();
    const matchSearch =
      resource.name.toLowerCase().includes(query) ||
      resource.building.toLowerCase().includes(query);
    return matchFilter && matchSearch;
  });

  const isSlotBooked = (index) => {
    if (!selectedResource || !selectedDate) {
      return false;
    }

    return bookings.some((booking) => {
      const range = bookingToSlotRange(booking);
      return index >= range.startSlot && index < range.endSlot;
    });
  };

  const hasConflict = () => {
    if (
      startSlot === -1 ||
      endSlot === -1 ||
      !selectedResource ||
      !selectedDate
    ) {
      return false;
    }

    const selectionStart = Math.min(startSlot, endSlot);
    const selectionEnd = Math.max(startSlot, endSlot) + 1;

    return bookings.some((booking) => {
      const range = bookingToSlotRange(booking);
      return selectionStart < range.endSlot && selectionEnd > range.startSlot;
    });
  };

  const isSlotSelected = (index) => {
    if (startSlot === -1) {
      return false;
    }

    return index >= Math.min(startSlot, endSlot) && index <= Math.max(startSlot, endSlot);
  };

  const handleSlotClick = (index) => {
    if (isSlotBooked(index)) {
      return;
    }

    if (startSlot === -1) {
      setStartSlot(index);
      setEndSlot(index);
      return;
    }

    if (endSlot === startSlot) {
      setEndSlot(index);
      return;
    }

    setStartSlot(index);
    setEndSlot(index);
  };

  const handleBooking = async () => {
    if (!selectedResource || startSlot === -1 || !selectedDate || !purpose.trim()) {
      setToast({ type: 'error', message: 'Please fill all booking details.' });
      return;
    }

    if (hasConflict()) {
      setToast({ type: 'error', message: 'Conflict detected for selected slot.' });
      return;
    }

    try {
      const bookingStart = slotToTime(Math.min(startSlot, endSlot));
      const bookingEnd = slotToTime(Math.max(startSlot, endSlot) + 1);

      const response = await apiRequest('/api/bookings', {
        method: 'POST',
        requireAuth: true,
        body: {
          resourceId: selectedResource.id,
          date: selectedDate,
          startTime: bookingStart,
          endTime: bookingEnd,
          purpose: purpose.trim(),
        },
      });

      setBookings((current) => [...current, response.booking]);
      setShowModal(false);
      setStartSlot(-1);
      setEndSlot(-1);
      setPurpose('');
      setToast({
        type: 'success',
        message: `Booking submitted for ${selectedResource.name}.`,
      });
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Unable to submit booking.' });
    }
  };

  return (
    <div className={styles.page}>
      {toast && (
        <div className="toast-container">
          <div
            className="toast"
            style={{
              borderLeft: `3px solid ${
                toast.type === 'success' ? 'var(--success)' : 'var(--error)'
              }`,
            }}
          >
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1>Resource Booking</h1>
            <p>Book labs, auditoriums, and facilities with zero conflicts.</p>
          </div>
        </div>

        <div className={styles.filtersRow}>
          <div className="tabs">
            {['all', 'lab', 'hall'].map((entry) => (
              <button
                key={entry}
                className={`tab ${filter === entry ? 'active' : ''}`}
                onClick={() => setFilter(entry)}
              >
                {entry === 'all' ? 'All Resources' : entry === 'lab' ? 'Labs' : 'Halls'}
              </button>
            ))}
          </div>

          <input
            type="text"
            className="input"
            placeholder="Search resources..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={{ maxWidth: 280 }}
          />
        </div>

        <div className={styles.resourceGrid}>
          {loading ? (
            <p>Loading resources...</p>
          ) : (
            filteredResources.map((resource) => (
              <div
                key={resource.id}
                className={`${styles.resourceCard} ${
                  selectedResource?.id === resource.id ? styles.selected : ''
                }`}
                onClick={() => {
                  setSelectedResource(resource);
                  setStartSlot(-1);
                  setEndSlot(-1);
                }}
              >
                <div className={styles.cardTop}>
                  <span className="badge badge-primary">{resource.type.toUpperCase()}</span>
                </div>
                <h3>{resource.name}</h3>
                <div className={styles.cardMeta}>
                  <span>
                    {resource.building}, {resource.floor} Floor
                  </span>
                  <span>{resource.capacity} seats</span>
                </div>
                <div className={styles.amenities}>
                  {(resource.amenities || []).map((amenity, index) => (
                    <span key={index} className="chip">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {selectedResource && (
          <div className={styles.bookingPanel}>
            <div className={styles.bookingHeader}>
              <h2>Book: {selectedResource.name}</h2>
              <div className={styles.dateInput}>
                <label>Date:</label>
                <input
                  type="date"
                  className="input"
                  value={selectedDate}
                  onChange={(event) => {
                    setSelectedDate(event.target.value);
                    setStartSlot(-1);
                    setEndSlot(-1);
                  }}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <p className={styles.slotInstruction}>
              Click once for start time, then click again for end time:
            </p>

            <div className={styles.timeGrid}>
              {timeSlots.map((slot, index) => {
                const booked = isSlotBooked(index);
                const selected = isSlotSelected(index);
                return (
                  <button
                    key={index}
                    className={`${styles.timeSlot} ${booked ? styles.booked : ''} ${
                      selected ? styles.selectedSlot : ''
                    }`}
                    onClick={() => handleSlotClick(index)}
                    disabled={booked}
                  >
                    <span className={styles.slotTime}>{slot}</span>
                    <span className={styles.slotStatus}>
                      {booked ? 'Booked' : selected ? 'Selected' : 'Available'}
                    </span>
                  </button>
                );
              })}
            </div>

            {hasConflict() && (
              <div className={styles.conflictWarning}>
                <strong>Conflict detected:</strong> selected time overlaps an existing booking.
              </div>
            )}

            {startSlot !== -1 && (
              <div className={styles.bookingSummary}>
                <div className={styles.summaryInfo}>
                  <span>{selectedDate}</span>
                  <span>
                    {timeSlots[Math.min(startSlot, endSlot)]} -{' '}
                    {timeSlots[Math.max(startSlot, endSlot) + 1] || 'End'}
                  </span>
                  <span>{selectedResource.name}</span>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowModal(true)}
                  disabled={hasConflict()}
                >
                  Confirm Booking
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <h2 style={{ marginBottom: 8 }}>Confirm Booking</h2>
            <p style={{ marginBottom: 24, fontSize: '0.9rem' }}>
              Booking <strong>{selectedResource?.name}</strong> on <strong>{selectedDate}</strong>
            </p>
            <div className="input-group" style={{ marginBottom: 20 }}>
              <label>Purpose of Booking</label>
              <textarea
                className="input"
                placeholder="e.g., Data Structures Lab"
                value={purpose}
                onChange={(event) => setPurpose(event.target.value)}
                rows={3}
              />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-primary" onClick={handleBooking} style={{ flex: 1 }}>
                Submit Request
              </button>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
