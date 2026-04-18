/* eslint-disable @next/next/no-img-element */
'use client';
import { useState, useEffect, useMemo } from 'react';
import styles from './marketplace.module.css';
import { apiRequest } from '@/lib/client/api';

const categories = [
  { id: 'all', label: 'All Items', emoji: '🛍️' },
  { id: 'books', label: 'Books', emoji: '📚' },
  { id: 'electronics', label: 'Electronics', emoji: '💻' },
  { id: 'notes', label: 'Notes', emoji: '📝' },
  { id: 'accessories', label: 'Accessories', emoji: '🎒' },
  { id: 'sports', label: 'Sports', emoji: '⚽' },
  { id: 'clothing', label: 'Clothing', emoji: '👕' },
  { id: 'other', label: 'Other', emoji: '📦' },
];

function conditionLabel(condition) {
  const normalized = String(condition || '').toLowerCase();

  if (normalized === 'like_new') {
    return 'Like New';
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function conditionBadge(condition) {
  const normalized = String(condition || '').toLowerCase();

  if (normalized === 'new') {
    return 'badge-success';
  }

  if (normalized === 'like_new') {
    return 'badge-info';
  }

  return 'badge-warning';
}

export default function MarketplacePage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [showListModal, setShowListModal] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [newItem, setNewItem] = useState({
    title: '',
    category: 'books',
    price: '',
    condition: 'good',
    description: '',
  });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadListings() {
      try {
        const response = await apiRequest('/api/marketplace?status=active');
        if (mounted) {
          setListings(response.listings || []);
        }
      } catch (error) {
        if (mounted) {
          setToast({ type: 'error', message: error.message || 'Unable to load listings.' });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadListings();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const filtered = useMemo(() => {
    return [...listings]
      .filter(
        (item) =>
          (activeCategory === 'all' || item.category === activeCategory) &&
          (item.title.toLowerCase().includes(search.toLowerCase()) ||
            item.description.toLowerCase().includes(search.toLowerCase()))
      )
      .sort((left, right) => {
        if (sortBy === 'price-low') {
          return left.price - right.price;
        }

        if (sortBy === 'price-high') {
          return right.price - left.price;
        }

        if (sortBy === 'trust') {
          return (right.sellerTrustScore || 0) - (left.sellerTrustScore || 0);
        }

        return 0;
      });
  }, [listings, activeCategory, search, sortBy]);

  const handleListItem = async () => {
    if (!newItem.title || !newItem.price || !newItem.description) {
      setToast({ type: 'error', message: 'Fill all required fields.' });
      return;
    }

    try {
      const response = await apiRequest('/api/marketplace', {
        method: 'POST',
        requireAuth: true,
        body: {
          title: newItem.title,
          category: newItem.category,
          price: Number(newItem.price),
          condition: newItem.condition,
          description: newItem.description,
        },
      });

      setListings((current) => [response.listing, ...current]);
      setShowListModal(false);
      setNewItem({
        title: '',
        category: 'books',
        price: '',
        condition: 'good',
        description: '',
      });
      setToast({ type: 'success', message: 'Item listed successfully.' });
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Unable to list item.' });
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
            <div className={styles.headerBadge}>
              <span>SH</span>
              Fortress of Trust
            </div>
            <h1>Student Marketplace</h1>
            <p>Buy, sell, and trade with verified students.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowListModal(true)}>
            + List an Item
          </button>
        </div>

        <div className={styles.controlsRow}>
          <input
            type="text"
            className="input"
            placeholder="Search items..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={{ maxWidth: 400 }}
          />
          <select
            className="input"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            style={{ maxWidth: 200 }}
          >
            <option value="recent">Most Recent</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="trust">Trust Score</option>
          </select>
        </div>

        <div className={styles.categoryChips}>
          {categories.map((category) => (
            <button
              key={category.id}
              className={`chip ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.emoji} {category.label}
            </button>
          ))}
        </div>

        <p className={styles.resultCount}>
          {filtered.length} item{filtered.length !== 1 ? 's' : ''} found
        </p>

        <div className={styles.itemGrid}>
          {loading ? (
            <p>Loading listings...</p>
          ) : (
            filtered.map((item) => (
              <div key={item.id} className={styles.itemCard} onClick={() => setViewItem(item)}>
                <div className={styles.itemImage}>
                  {item.image ? (
                    <img src={item.image} alt={item.title} className={styles.productPhoto} />
                  ) : (
                    <span className={styles.categoryEmoji}>{categories.find((entry) => entry.id === item.category)?.emoji || '📦'}</span>
                  )}
                </div>
                <div className={styles.itemBody}>
                  <div className={styles.itemTopRow}>
                    <span className={`badge ${conditionBadge(item.condition)}`}>
                      {conditionLabel(item.condition)}
                    </span>
                    {item.sellerVerified && (
                      <span className={styles.verifiedBadge} title="Verified">
                        ✓
                      </span>
                    )}
                  </div>

                  <h3 className={styles.itemTitle}>{item.title}</h3>
                  <p className={styles.itemDesc}>{item.description}</p>

                  <div className={styles.itemFooter}>
                    <span className={styles.itemPrice}>₹{Number(item.price).toLocaleString('en-IN')}</span>
                    <div className={styles.sellerInfo}>
                      <span className={styles.sellerName}>{item.sellerName}</span>
                      <span className={styles.trustBadge}>⭐ {item.sellerTrustScore}</span>
                    </div>
                  </div>

                  <span className={styles.postedTime}>{item.postedAgo}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {!loading && filtered.length === 0 && (
          <div className="empty-state">
            <h3>No items found</h3>
            <p>Try adjusting your search.</p>
          </div>
        )}
      </div>

      {viewItem && (
        <div className="modal-overlay" onClick={() => setViewItem(null)}>
          <div className="modal" onClick={(event) => event.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className={styles.modalImage}>
              {viewItem.image ? (
                <img src={viewItem.image} alt={viewItem.title} className={styles.modalProductPhoto} />
              ) : (
                <span className={styles.modalCategoryEmoji}>{categories.find((entry) => entry.id === viewItem.category)?.emoji || '📦'}</span>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <h2 style={{ fontSize: '1.3rem' }}>{viewItem.title}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setViewItem(null)}>
                x
              </button>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <span className={`badge ${conditionBadge(viewItem.condition)}`}>
                {conditionLabel(viewItem.condition)}
              </span>
              <span className="badge badge-primary">
                {categories.find((entry) => entry.id === viewItem.category)?.label || 'Other'}
              </span>
            </div>

            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
              {viewItem.description}
            </p>

            <div className="divider" />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>Listed by</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 600 }}>{viewItem.sellerName}</span>
                  {viewItem.sellerVerified && <span className={styles.verifiedBadge}>✓</span>}
                  <span className={styles.trustBadge}>⭐ {viewItem.sellerTrustScore}</span>
                </div>
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.8rem',
                  fontWeight: 800,
                  color: 'var(--primary-400)',
                }}
              >
                ₹{Number(viewItem.price).toLocaleString('en-IN')}
              </span>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => {
                  setViewItem(null);
                  setToast({ type: 'success', message: 'Contact request sent.' });
                }}
              >
                Contact Seller
              </button>
              <button
                className="btn btn-accent"
                style={{ flex: 1 }}
                onClick={() => {
                  setViewItem(null);
                  setToast({ type: 'success', message: 'Added to wishlist.' });
                }}
              >
                Wishlist
              </button>
            </div>
          </div>
        </div>
      )}

      {showListModal && (
        <div className="modal-overlay" onClick={() => setShowListModal(false)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <h2 style={{ marginBottom: 20 }}>List a New Item</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="input-group">
                <label>Item Title *</label>
                <input
                  className="input"
                  placeholder="e.g., Engineering Textbook"
                  value={newItem.title}
                  onChange={(event) => setNewItem({ ...newItem, title: event.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Category</label>
                  <select
                    className="input"
                    value={newItem.category}
                    onChange={(event) => setNewItem({ ...newItem, category: event.target.value })}
                  >
                    {categories
                      .filter((entry) => entry.id !== 'all')
                      .map((entry) => (
                        <option key={entry.id} value={entry.id}>
                          {entry.label}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="input-group" style={{ flex: 1 }}>
                  <label>Condition</label>
                  <select
                    className="input"
                    value={newItem.condition}
                    onChange={(event) => setNewItem({ ...newItem, condition: event.target.value })}
                  >
                    <option value="new">New</option>
                    <option value="like_new">Like New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label>Price (₹) *</label>
                <input
                  className="input"
                  type="number"
                  placeholder="Enter price"
                  value={newItem.price}
                  onChange={(event) => setNewItem({ ...newItem, price: event.target.value })}
                />
              </div>

              <div className="input-group">
                <label>Description *</label>
                <textarea
                  className="input"
                  placeholder="Describe the item..."
                  value={newItem.description}
                  onChange={(event) => setNewItem({ ...newItem, description: event.target.value })}
                  rows={3}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                <button className="btn btn-primary" onClick={handleListItem} style={{ flex: 1 }}>
                  Publish
                </button>
                <button className="btn btn-secondary" onClick={() => setShowListModal(false)}>
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
