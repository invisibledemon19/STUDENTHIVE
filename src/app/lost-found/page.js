'use client';
import { useState, useRef, useEffect, useMemo } from 'react';
import styles from './lostfound.module.css';
import { apiRequest } from '@/lib/client/api';

const locations = [
  'Library',
  'Computer Lab A',
  'Computer Lab B',
  'Physics Lab',
  'Chemistry Lab',
  'Main Auditorium',
  'Cafeteria',
  'Main Gate',
  'Parking Lot',
  'Workshop',
  'IT Department',
  'Sports Complex',
  'Hostel',
  'Other',
];

export default function LostFoundPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [reportType, setReportType] = useState('lost');
  const [toast, setToast] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const fileInputRef = useRef(null);
  const [newItem, setNewItem] = useState({
    title: '',
    location: '',
    description: '',
    tags: '',
  });
  const [uploadedImage, setUploadedImage] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadItems() {
      try {
        const response = await apiRequest('/api/lost-found');
        if (mounted) {
          setItems(response.items || []);
        }
      } catch (error) {
        if (mounted) {
          setToast({ type: 'error', message: error.message || 'Unable to load reports.' });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadItems();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const filtered = useMemo(
    () =>
      items.filter(
        (item) =>
          (activeTab === 'all' || item.type === activeTab) &&
          (search === '' ||
            item.title.toLowerCase().includes(search.toLowerCase()) ||
            (item.tags || []).some((tag) => tag.includes(search.toLowerCase())) ||
            item.location.toLowerCase().includes(search.toLowerCase()))
      ),
    [items, activeTab, search]
  );

  const handleImageUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => setUploadedImage(loadEvent.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleReport = async () => {
    if (!newItem.title || !newItem.location || !newItem.description) {
      setToast({ type: 'error', message: 'Fill all required fields.' });
      return;
    }

    try {
      const response = await apiRequest('/api/lost-found', {
        method: 'POST',
        requireAuth: true,
        body: {
          type: reportType,
          title: newItem.title,
          location: newItem.location,
          description: newItem.description,
          tags: newItem.tags,
          image: uploadedImage,
        },
      });

      setItems((current) => [response.item, ...current]);
      setShowReport(false);
      setNewItem({ title: '', location: '', description: '', tags: '' });
      setUploadedImage(null);

      const matchMessage = response.matches
        ? ` Potential matches found: ${response.matches.count}.`
        : '';

      setToast({
        type: 'success',
        message: `${reportType === 'lost' ? 'Lost' : 'Found'} item reported.${matchMessage}`,
      });
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Unable to submit report.' });
    }
  };

  const handleMarkRecovered = async (id) => {
    try {
      const response = await apiRequest('/api/lost-found', {
        method: 'PATCH',
        requireAuth: true,
        body: {
          id,
          status: 'recovered',
        },
      });

      setItems((current) =>
        current.map((item) => (item.id === id ? response.item : item))
      );
      setViewItem(null);
      setToast({ type: 'success', message: 'Item marked as recovered.' });
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Unable to update item.' });
    }
  };

  const getStatusColor = (status) =>
    status === 'active'
      ? 'badge-warning'
      : status === 'matched'
      ? 'badge-info'
      : status === 'recovered'
      ? 'badge-success'
      : 'badge-primary';

  const lostCount = items.filter((item) => item.type === 'lost' && item.status === 'active').length;
  const foundCount = items.filter((item) => item.type === 'found' && item.status === 'active').length;
  const recoveredCount = items.filter((item) => item.status === 'recovered').length;

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
            <h1>Lost & Found</h1>
            <p>Report lost items or claim found ones.</p>
          </div>
          <div className={styles.headerActions}>
            <button
              className="btn btn-primary"
              onClick={() => {
                setShowReport(true);
                setReportType('lost');
              }}
            >
              Report Lost
            </button>
            <button
              className="btn btn-accent"
              onClick={() => {
                setShowReport(true);
                setReportType('found');
              }}
            >
              Report Found
            </button>
          </div>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.miniStat}>
            <span className={styles.miniStatValue}>{lostCount}</span>
            <span className={styles.miniStatLabel}>Lost Items</span>
          </div>
          <div className={styles.miniStat}>
            <span className={styles.miniStatValue}>{foundCount}</span>
            <span className={styles.miniStatLabel}>Found Items</span>
          </div>
          <div className={styles.miniStat}>
            <span className={styles.miniStatValue}>{recoveredCount}</span>
            <span className={styles.miniStatLabel}>Recovered</span>
          </div>
          <div className={styles.miniStat}>
            <span className={styles.miniStatValue}>
              {Math.round((recoveredCount / (items.length || 1)) * 100)}%
            </span>
            <span className={styles.miniStatLabel}>Recovery Rate</span>
          </div>
        </div>

        <div className={styles.filtersRow}>
          <div className="tabs">
            {[
              { id: 'all', label: 'All Reports' },
              { id: 'lost', label: 'Lost' },
              { id: 'found', label: 'Found' },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            className="input"
            placeholder="Search by item, location, or tag..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={{ maxWidth: 320 }}
          />
        </div>

        <div className={styles.itemList}>
          {loading ? (
            <p>Loading reports...</p>
          ) : (
            filtered.map((item) => (
              <div key={item.id} className={styles.itemCard} onClick={() => setViewItem(item)}>
                <div className={`${styles.typeIndicator} ${styles[item.type]}`} />
                <div className={styles.itemContent}>
                  <div className={styles.itemTop}>
                    <div className={styles.itemMeta}>
                      <span className={`badge ${item.type === 'lost' ? 'badge-error' : 'badge-info'}`}>
                        {item.type === 'lost' ? 'LOST' : 'FOUND'}
                      </span>
                      <span className={`badge ${getStatusColor(item.status)}`}>{item.status}</span>
                    </div>
                    <span className={styles.itemDate}>{item.dateReported}</span>
                  </div>
                  <h3 className={styles.itemTitle}>{item.title}</h3>
                  <p className={styles.itemDesc}>{item.description}</p>
                  <div className={styles.itemBottom}>
                    <span className={styles.itemLocation}>{item.location}</span>
                    <div className={styles.itemTags}>
                      {(item.tags || []).slice(0, 3).map((tag, index) => (
                        <span key={index} className={styles.tag}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                {item.image && <img src={item.image} alt={item.title} className={styles.itemImage} />}
              </div>
            ))
          )}
        </div>

        {!loading && filtered.length === 0 && (
          <div className="empty-state">
            <h3>No items match your search</h3>
          </div>
        )}
      </div>

      {viewItem && (
        <div className="modal-overlay" onClick={() => setViewItem(null)}>
          <div className="modal" onClick={(event) => event.stopPropagation()} style={{ maxWidth: 560 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <span className={`badge ${viewItem.type === 'lost' ? 'badge-error' : 'badge-info'}`}>
                  {viewItem.type === 'lost' ? 'LOST' : 'FOUND'}
                </span>
                <span className={`badge ${getStatusColor(viewItem.status)}`}>{viewItem.status}</span>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setViewItem(null)}>
                x
              </button>
            </div>

            {viewItem.image && (
              <img
                src={viewItem.image}
                alt={viewItem.title}
                style={{ width: '100%', borderRadius: 12, marginBottom: 16, maxHeight: 200, objectFit: 'cover' }}
              />
            )}

            <h2 style={{ fontSize: '1.3rem', marginBottom: 8 }}>{viewItem.title}</h2>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.7 }}>
              {viewItem.description}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: '0.88rem' }}>
                <strong>Location:</strong> {viewItem.location}
              </span>
              <span style={{ fontSize: '0.88rem' }}>
                <strong>Date:</strong> {viewItem.dateReported}
              </span>
              <span style={{ fontSize: '0.88rem' }}>
                <strong>Reported by:</strong> {viewItem.reporterName}
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
              {(viewItem.tags || []).map((tag, index) => (
                <span key={index} className="chip">
                  #{tag}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              {viewItem.status !== 'recovered' ? (
                <>
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    onClick={() => {
                      setViewItem(null);
                      setToast({ type: 'success', message: 'Claim request sent.' });
                    }}
                  >
                    {viewItem.type === 'lost' ? 'I Found This' : 'This Is Mine'}
                  </button>
                  <button className="btn btn-secondary" onClick={() => handleMarkRecovered(viewItem.id)}>
                    Mark Recovered
                  </button>
                </>
              ) : (
                <div
                  style={{
                    padding: '12px 16px',
                    background: 'var(--success-light)',
                    borderRadius: '8px',
                    color: '#1B5E20',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    textAlign: 'center',
                    width: '100%',
                  }}
                >
                  Successfully recovered
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showReport && (
        <div className="modal-overlay" onClick={() => setShowReport(false)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <h2 style={{ marginBottom: 4 }}>Report {reportType === 'lost' ? 'Lost' : 'Found'} Item</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: 20 }}>
              {reportType === 'lost'
                ? 'Describe what you lost.'
                : 'Describe what you found.'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="input-group">
                <label>Item Name *</label>
                <input
                  className="input"
                  placeholder="e.g., Blue Backpack"
                  value={newItem.title}
                  onChange={(event) => setNewItem({ ...newItem, title: event.target.value })}
                />
              </div>

              <div className="input-group">
                <label>Location *</label>
                <select
                  className="input"
                  value={newItem.location}
                  onChange={(event) => setNewItem({ ...newItem, location: event.target.value })}
                >
                  <option value="">Select location...</option>
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Description *</label>
                <textarea
                  className="input"
                  placeholder="Detailed description..."
                  value={newItem.description}
                  onChange={(event) => setNewItem({ ...newItem, description: event.target.value })}
                  rows={3}
                />
              </div>

              <div className="input-group">
                <label>Tags (comma-separated)</label>
                <input
                  className="input"
                  placeholder="e.g., blue, nike, backpack"
                  value={newItem.tags}
                  onChange={(event) => setNewItem({ ...newItem, tags: event.target.value })}
                />
              </div>

              <div className="input-group">
                <label>Upload Image (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ width: '100%' }}
                >
                  {uploadedImage ? 'Image Uploaded' : 'Choose Image'}
                </button>
                {uploadedImage && (
                  <img
                    src={uploadedImage}
                    alt="Preview"
                    style={{ width: '100%', borderRadius: '8px', marginTop: 8, maxHeight: 150, objectFit: 'cover' }}
                  />
                )}
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                <button
                  className={`btn ${reportType === 'lost' ? 'btn-primary' : 'btn-accent'}`}
                  onClick={handleReport}
                  style={{ flex: 1 }}
                >
                  Submit Report
                </button>
                <button className="btn btn-secondary" onClick={() => setShowReport(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
