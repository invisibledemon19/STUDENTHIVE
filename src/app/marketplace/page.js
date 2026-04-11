'use client';
import { useState } from 'react';
import styles from './marketplace.module.css';

const categories = [
  { id: 'all', label: 'All Items', emoji: '📦' }, { id: 'books', label: 'Books', emoji: '📚' },
  { id: 'electronics', label: 'Electronics', emoji: '💻' }, { id: 'notes', label: 'Notes', emoji: '📝' },
  { id: 'accessories', label: 'Accessories', emoji: '🎧' }, { id: 'sports', label: 'Sports', emoji: '⚽' },
  { id: 'clothing', label: 'Clothing', emoji: '👕' }, { id: 'other', label: 'Other', emoji: '🎁' },
];

const initialListings = [
  { id:1, title:'Data Structures by Cormen (CLRS)', category:'books', price:450, condition:'Good', seller:'Priya Mehta', verified:true, trustScore:4.8, image:'📘', postedAgo:'2 hours ago', description:'3rd edition, minor highlights.' },
  { id:2, title:'HP Scientific Calculator', category:'electronics', price:800, condition:'Like New', seller:'Rahul Kumar', verified:true, trustScore:4.9, image:'🔢', postedAgo:'5 hours ago', description:'HP 35s. Used for one semester.' },
  { id:3, title:'Complete Physics Notes (Sem 3)', category:'notes', price:150, condition:'Digital', seller:'Ankit Sharma', verified:true, trustScore:4.5, image:'📄', postedAgo:'1 day ago', description:'Handwritten + typed notes.' },
  { id:4, title:'Sony WH-1000XM4 Headphones', category:'accessories', price:12000, condition:'Good', seller:'Sara Lakshmi', verified:true, trustScore:4.7, image:'🎧', postedAgo:'3 hours ago', description:'ANC headphones, 2 years old.' },
  { id:5, title:'Badminton Racket (Yonex)', category:'sports', price:1200, condition:'Like New', seller:'Vikram Dev', verified:true, trustScore:4.6, image:'🏸', postedAgo:'6 hours ago', description:'Yonex Astrox 88D.' },
  { id:6, title:'Organic Chemistry by Morrison', category:'books', price:350, condition:'Fair', seller:'Meera Joshi', verified:true, trustScore:4.3, image:'📗', postedAgo:'1 day ago', description:'7th edition. Some wear.' },
  { id:7, title:'Arduino Starter Kit', category:'electronics', price:1500, condition:'New', seller:'Karan Patel', verified:true, trustScore:5.0, image:'🔌', postedAgo:'4 hours ago', description:'Unopened Arduino Uno kit.' },
  { id:8, title:'College Hoodie (2024)', category:'clothing', price:600, condition:'New', seller:'Nisha Gupta', verified:true, trustScore:4.4, image:'🧥', postedAgo:'8 hours ago', description:'Size L. Official merchandise.' },
  { id:9, title:'Desk Lamp (LED)', category:'other', price:500, condition:'Good', seller:'Ravi Teja', verified:false, trustScore:3.9, image:'💡', postedAgo:'2 days ago', description:'Adjustable LED desk lamp.' },
];

export default function MarketplacePage() {
  const [listings, setListings] = useState(initialListings);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [showListModal, setShowListModal] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [newItem, setNewItem] = useState({ title:'', category:'books', price:'', condition:'Good', description:'' });
  const [toast, setToast] = useState(null);

  const filtered = listings
    .filter(item => (activeCategory==='all'||item.category===activeCategory) && (item.title.toLowerCase().includes(search.toLowerCase())||item.description.toLowerCase().includes(search.toLowerCase())))
    .sort((a,b) => sortBy==='price-low'?a.price-b.price:sortBy==='price-high'?b.price-a.price:sortBy==='trust'?b.trustScore-a.trustScore:0);

  const handleListItem = () => {
    if(!newItem.title||!newItem.price||!newItem.description){setToast({type:'error',message:'Fill all required fields.'});setTimeout(()=>setToast(null),3000);return;}
    setListings([{id:listings.length+1,...newItem,price:Number(newItem.price),seller:'You',verified:true,trustScore:5.0,image:categories.find(c=>c.id===newItem.category)?.emoji||'📦',postedAgo:'Just now'},...listings]);
    setShowListModal(false);setNewItem({title:'',category:'books',price:'',condition:'Good',description:''});
    setToast({type:'success',message:'✅ Item listed successfully!'});setTimeout(()=>setToast(null),3000);
  };

  return (
    <div className={styles.page}>
      {toast&&<div className="toast-container"><div className="toast" style={{borderLeft:`3px solid ${toast.type==='success'?'var(--success)':'var(--error)'}`}}><span>{toast.message}</span></div></div>}
      <div className={styles.container}>
        <div className={styles.header}><div><div className={styles.headerBadge}><span>🛡️</span>Fortress of Trust</div><h1>Student Marketplace</h1><p>Buy, sell, and trade with verified students.</p></div><button className="btn btn-primary" onClick={()=>setShowListModal(true)}>+ List an Item</button></div>
        <div className={styles.controlsRow}><input type="text" className="input" placeholder="Search items..." value={search} onChange={e=>setSearch(e.target.value)} style={{maxWidth:400}}/><select className="input" value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{maxWidth:200}}><option value="recent">Most Recent</option><option value="price-low">Price: Low → High</option><option value="price-high">Price: High → Low</option><option value="trust">Trust Score</option></select></div>
        <div className={styles.categoryChips}>{categories.map(c=><button key={c.id} className={`chip ${activeCategory===c.id?'active':''}`} onClick={()=>setActiveCategory(c.id)}>{c.emoji} {c.label}</button>)}</div>
        <p className={styles.resultCount}>{filtered.length} item{filtered.length!==1?'s':''} found</p>
        <div className={styles.itemGrid}>
          {filtered.map(item=>(
            <div key={item.id} className={styles.itemCard} onClick={()=>setViewItem(item)}>
              <div className={styles.itemImage}><span>{item.image}</span></div>
              <div className={styles.itemBody}>
                <div className={styles.itemTopRow}><span className={`badge ${item.condition==='New'?'badge-success':item.condition==='Like New'?'badge-info':'badge-warning'}`}>{item.condition}</span>{item.verified&&<span className={styles.verifiedBadge} title="Verified">✓</span>}</div>
                <h3 className={styles.itemTitle}>{item.title}</h3>
                <p className={styles.itemDesc}>{item.description}</p>
                <div className={styles.itemFooter}><span className={styles.itemPrice}>₹{item.price.toLocaleString()}</span><div className={styles.sellerInfo}><span className={styles.sellerName}>{item.seller}</span><span className={styles.trustBadge}>⭐ {item.trustScore}</span></div></div>
                <span className={styles.postedTime}>{item.postedAgo}</span>
              </div>
            </div>
          ))}
        </div>
        {filtered.length===0&&<div className="empty-state"><p style={{fontSize:'3rem',marginBottom:16}}>🔍</p><h3>No items found</h3><p>Try adjusting your search.</p></div>}
      </div>
      {viewItem&&(<div className="modal-overlay" onClick={()=>setViewItem(null)}><div className="modal" onClick={e=>e.stopPropagation()} style={{maxWidth:560}}>
        <div className={styles.modalImage}><span>{viewItem.image}</span></div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}><h2 style={{fontSize:'1.3rem'}}>{viewItem.title}</h2><button className="btn btn-ghost btn-icon" onClick={()=>setViewItem(null)}>✕</button></div>
        <div style={{display:'flex',gap:8,marginBottom:16}}><span className={`badge ${viewItem.condition==='New'?'badge-success':'badge-info'}`}>{viewItem.condition}</span><span className="badge badge-primary">{categories.find(c=>c.id===viewItem.category)?.label}</span></div>
        <p style={{fontSize:'0.92rem',color:'var(--text-secondary)',lineHeight:1.6,marginBottom:20}}>{viewItem.description}</p>
        <div className="divider"/>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}><div><span style={{fontSize:'0.82rem',color:'var(--text-tertiary)'}}>Listed by</span><div style={{display:'flex',alignItems:'center',gap:8}}><span style={{fontWeight:600}}>{viewItem.seller}</span>{viewItem.verified&&<span className={styles.verifiedBadge}>✓</span>}<span className={styles.trustBadge}>⭐ {viewItem.trustScore}</span></div></div><span style={{fontFamily:'var(--font-display)',fontSize:'1.8rem',fontWeight:800,color:'var(--primary-400)'}}>₹{viewItem.price.toLocaleString()}</span></div>
        <div style={{display:'flex',gap:12}}><button className="btn btn-primary" style={{flex:1}} onClick={()=>{setViewItem(null);setToast({type:'success',message:'📩 Contact request sent!'});setTimeout(()=>setToast(null),3000);}}>Contact Seller</button><button className="btn btn-accent" style={{flex:1}} onClick={()=>{setViewItem(null);setToast({type:'success',message:'🛒 Added to wishlist!'});setTimeout(()=>setToast(null),3000);}}>Wishlist</button></div>
      </div></div>)}
      {showListModal&&(<div className="modal-overlay" onClick={()=>setShowListModal(false)}><div className="modal" onClick={e=>e.stopPropagation()}>
        <h2 style={{marginBottom:20}}>List a New Item</h2>
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <div className="input-group"><label>Item Title *</label><input className="input" placeholder="e.g., Engineering Textbook" value={newItem.title} onChange={e=>setNewItem({...newItem,title:e.target.value})}/></div>
          <div style={{display:'flex',gap:12}}><div className="input-group" style={{flex:1}}><label>Category</label><select className="input" value={newItem.category} onChange={e=>setNewItem({...newItem,category:e.target.value})}>{categories.filter(c=>c.id!=='all').map(c=><option key={c.id} value={c.id}>{c.label}</option>)}</select></div><div className="input-group" style={{flex:1}}><label>Condition</label><select className="input" value={newItem.condition} onChange={e=>setNewItem({...newItem,condition:e.target.value})}><option>New</option><option>Like New</option><option>Good</option><option>Fair</option></select></div></div>
          <div className="input-group"><label>Price (₹) *</label><input className="input" type="number" placeholder="Enter price" value={newItem.price} onChange={e=>setNewItem({...newItem,price:e.target.value})}/></div>
          <div className="input-group"><label>Description *</label><textarea className="input" placeholder="Describe the item..." value={newItem.description} onChange={e=>setNewItem({...newItem,description:e.target.value})} rows={3}/></div>
          <div style={{display:'flex',gap:12,marginTop:4}}><button className="btn btn-primary" onClick={handleListItem} style={{flex:1}}>Publish</button><button className="btn btn-secondary" onClick={()=>setShowListModal(false)}>Cancel</button></div>
        </div>
      </div></div>)}
    </div>
  );
}
