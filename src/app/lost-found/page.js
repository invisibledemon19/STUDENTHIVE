'use client';
import { useState, useRef } from 'react';
import styles from './lostfound.module.css';

const initialItems = [
  { id:1, type:'lost', title:'Blue Water Bottle (Milton)', location:'Library 2nd Floor', date:'2026-04-10', tags:['water bottle','blue','milton'], description:'Left on table near window around 3 PM.', reporter:'Priya M.', status:'active', image:null },
  { id:2, type:'found', title:'Graphing Calculator (Casio)', location:'Computer Lab A', date:'2026-04-10', tags:['calculator','casio'], description:'Found under desk after 2 PM class.', reporter:'Rahul K.', status:'active', image:null },
  { id:3, type:'lost', title:'Student ID Card', location:'Cafeteria', date:'2026-04-09', tags:['id card','identity'], description:'Lost in cafeteria during lunch.', reporter:'Ankit S.', status:'active', image:null },
  { id:4, type:'found', title:'Black Umbrella', location:'Main Gate', date:'2026-04-09', tags:['umbrella','black'], description:'Found near main gate entrance.', reporter:'Sara L.', status:'active', image:null },
  { id:5, type:'lost', title:'AirPods Pro', location:'Auditorium', date:'2026-04-08', tags:['airpods','apple','electronics'], description:'Left in white case during 10 AM seminar.', reporter:'Vikram D.', status:'matched', image:null },
  { id:6, type:'found', title:'Set of Keys (3 keys)', location:'Parking Lot B', date:'2026-04-08', tags:['keys','keychain'], description:'Found on blue keychain near bike parking.', reporter:'Meera J.', status:'active', image:null },
  { id:7, type:'lost', title:'Red Engineering Notebook', location:'Workshop', date:'2026-04-07', tags:['notebook','red','engineering'], description:'Red A3 engineering drawing notebook.', reporter:'Karan P.', status:'recovered', image:null },
  { id:8, type:'found', title:'USB Drive (32GB SanDisk)', location:'IT Department', date:'2026-04-07', tags:['usb','flash drive','sandisk'], description:'Found red SanDisk 32GB USB in IT lab.', reporter:'Nisha G.', status:'active', image:null },
];

const locations = ['Library','Computer Lab A','Computer Lab B','Physics Lab','Chemistry Lab','Main Auditorium','Cafeteria','Main Gate','Parking Lot','Workshop','IT Department','Sports Complex','Hostel','Other'];

export default function LostFoundPage() {
  const [items, setItems] = useState(initialItems);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [reportType, setReportType] = useState('lost');
  const [toast, setToast] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const fileInputRef = useRef(null);
  const [newItem, setNewItem] = useState({ title:'', location:'', description:'', tags:'' });
  const [uploadedImage, setUploadedImage] = useState(null);

  const filtered = items.filter(item => (activeTab==='all'||item.type===activeTab) && (search===''||item.title.toLowerCase().includes(search.toLowerCase())||item.tags.some(t=>t.includes(search.toLowerCase()))||item.location.toLowerCase().includes(search.toLowerCase())));

  const handleImageUpload = (e) => { const file = e.target.files[0]; if(file){ const reader = new FileReader(); reader.onload = ev => setUploadedImage(ev.target.result); reader.readAsDataURL(file); } };

  const handleReport = () => {
    if(!newItem.title||!newItem.location||!newItem.description){setToast({type:'error',message:'Fill all required fields.'});setTimeout(()=>setToast(null),3000);return;}
    setItems([{id:items.length+1,type:reportType,title:newItem.title,location:newItem.location,date:new Date().toISOString().split('T')[0],tags:newItem.tags.split(',').map(t=>t.trim().toLowerCase()).filter(Boolean),description:newItem.description,reporter:'You',status:'active',image:uploadedImage},...items]);
    setShowReport(false);setNewItem({title:'',location:'',description:'',tags:''});setUploadedImage(null);
    setToast({type:'success',message:`✅ ${reportType==='lost'?'Lost':'Found'} item reported! AI matching active.`});setTimeout(()=>setToast(null),4000);
  };

  const handleMarkRecovered = (id) => { setItems(items.map(i=>i.id===id?{...i,status:'recovered'}:i)); setViewItem(null); setToast({type:'success',message:'🎉 Item marked as recovered!'}); setTimeout(()=>setToast(null),3000); };
  const getStatusColor = s => s==='active'?'badge-warning':s==='matched'?'badge-info':s==='recovered'?'badge-success':'badge-primary';
  const lostCount = items.filter(i=>i.type==='lost'&&i.status==='active').length;
  const foundCount = items.filter(i=>i.type==='found'&&i.status==='active').length;
  const recoveredCount = items.filter(i=>i.status==='recovered').length;

  return (
    <div className={styles.page}>
      {toast&&<div className="toast-container"><div className="toast" style={{borderLeft:`3px solid ${toast.type==='success'?'var(--success)':'var(--error)'}`}}><span>{toast.message}</span></div></div>}
      <div className={styles.container}>
        <div className={styles.header}><div><h1>Lost & Found</h1><p>AI-powered recovery system. Report lost items or claim found ones.</p></div><div className={styles.headerActions}><button className="btn btn-primary" onClick={()=>{setShowReport(true);setReportType('lost');}}>🔍 Report Lost</button><button className="btn btn-accent" onClick={()=>{setShowReport(true);setReportType('found');}}>📦 Report Found</button></div></div>
        <div className={styles.statsRow}><div className={styles.miniStat}><span className={styles.miniStatValue}>{lostCount}</span><span className={styles.miniStatLabel}>Lost Items</span></div><div className={styles.miniStat}><span className={styles.miniStatValue}>{foundCount}</span><span className={styles.miniStatLabel}>Found Items</span></div><div className={styles.miniStat}><span className={styles.miniStatValue}>{recoveredCount}</span><span className={styles.miniStatLabel}>Recovered</span></div><div className={styles.miniStat}><span className={styles.miniStatValue}>{Math.round((recoveredCount/(items.length||1))*100)}%</span><span className={styles.miniStatLabel}>Recovery Rate</span></div></div>
        <div className={styles.filtersRow}><div className="tabs">{[{id:'all',label:'All Reports'},{id:'lost',label:'🔍 Lost'},{id:'found',label:'📦 Found'}].map(t=><button key={t.id} className={`tab ${activeTab===t.id?'active':''}`} onClick={()=>setActiveTab(t.id)}>{t.label}</button>)}</div><input type="text" className="input" placeholder="Search by item, location, or tag..." value={search} onChange={e=>setSearch(e.target.value)} style={{maxWidth:320}}/></div>
        <div className={styles.itemList}>{filtered.map(item=>(
          <div key={item.id} className={styles.itemCard} onClick={()=>setViewItem(item)}>
            <div className={`${styles.typeIndicator} ${styles[item.type]}`}/>
            <div className={styles.itemContent}>
              <div className={styles.itemTop}><div className={styles.itemMeta}><span className={`badge ${item.type==='lost'?'badge-error':'badge-info'}`}>{item.type==='lost'?'🔍 LOST':'📦 FOUND'}</span><span className={`badge ${getStatusColor(item.status)}`}>{item.status}</span></div><span className={styles.itemDate}>{item.date}</span></div>
              <h3 className={styles.itemTitle}>{item.title}</h3><p className={styles.itemDesc}>{item.description}</p>
              <div className={styles.itemBottom}><span className={styles.itemLocation}>📍 {item.location}</span><div className={styles.itemTags}>{item.tags.slice(0,3).map((t,i)=><span key={i} className={styles.tag}>#{t}</span>)}</div></div>
            </div>
            {item.image&&<img src={item.image} alt={item.title} className={styles.itemImage}/>}
          </div>
        ))}</div>
        {filtered.length===0&&<div className="empty-state"><p style={{fontSize:'3rem',marginBottom:16}}>🔎</p><h3>No items match your search</h3></div>}
      </div>
      {viewItem&&(<div className="modal-overlay" onClick={()=>setViewItem(null)}><div className="modal" onClick={e=>e.stopPropagation()} style={{maxWidth:560}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}><div style={{display:'flex',gap:8}}><span className={`badge ${viewItem.type==='lost'?'badge-error':'badge-info'}`}>{viewItem.type==='lost'?'🔍 LOST':'📦 FOUND'}</span><span className={`badge ${getStatusColor(viewItem.status)}`}>{viewItem.status}</span></div><button className="btn btn-ghost btn-icon" onClick={()=>setViewItem(null)}>✕</button></div>
        {viewItem.image&&<img src={viewItem.image} alt={viewItem.title} style={{width:'100%',borderRadius:12,marginBottom:16,maxHeight:200,objectFit:'cover'}}/>}
        <h2 style={{fontSize:'1.3rem',marginBottom:8}}>{viewItem.title}</h2><p style={{fontSize:'0.92rem',color:'var(--text-secondary)',marginBottom:16,lineHeight:1.7}}>{viewItem.description}</p>
        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:16}}><span style={{fontSize:'0.88rem'}}>📍 <strong>Location:</strong> {viewItem.location}</span><span style={{fontSize:'0.88rem'}}>📅 <strong>Date:</strong> {viewItem.date}</span><span style={{fontSize:'0.88rem'}}>👤 <strong>Reported by:</strong> {viewItem.reporter}</span></div>
        <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:20}}>{viewItem.tags.map((t,i)=><span key={i} className="chip">#{t}</span>)}</div>
        <div style={{display:'flex',gap:12}}>{viewItem.status!=='recovered'?<><button className="btn btn-primary" style={{flex:1}} onClick={()=>{setViewItem(null);setToast({type:'success',message:'📩 Claim request sent!'});setTimeout(()=>setToast(null),3000);}}>{viewItem.type==='lost'?'I Found This!':'This Is Mine!'}</button><button className="btn btn-secondary" onClick={()=>handleMarkRecovered(viewItem.id)}>Mark Recovered</button></>:<div style={{padding:'12px 16px',background:'var(--success-light)',borderRadius:'8px',color:'#1B5E20',fontSize:'0.9rem',fontWeight:600,textAlign:'center',width:'100%'}}>✅ Successfully recovered!</div>}</div>
      </div></div>)}
      {showReport&&(<div className="modal-overlay" onClick={()=>setShowReport(false)}><div className="modal" onClick={e=>e.stopPropagation()}>
        <h2 style={{marginBottom:4}}>Report {reportType==='lost'?'Lost':'Found'} Item</h2><p style={{fontSize:'0.85rem',color:'var(--text-tertiary)',marginBottom:20}}>{reportType==='lost'?'Describe what you lost.':'Describe what you found.'}</p>
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <div className="input-group"><label>Item Name *</label><input className="input" placeholder="e.g., Blue Backpack" value={newItem.title} onChange={e=>setNewItem({...newItem,title:e.target.value})}/></div>
          <div className="input-group"><label>Location *</label><select className="input" value={newItem.location} onChange={e=>setNewItem({...newItem,location:e.target.value})}><option value="">Select location...</option>{locations.map(l=><option key={l} value={l}>{l}</option>)}</select></div>
          <div className="input-group"><label>Description *</label><textarea className="input" placeholder="Detailed description..." value={newItem.description} onChange={e=>setNewItem({...newItem,description:e.target.value})} rows={3}/></div>
          <div className="input-group"><label>Tags (comma-separated)</label><input className="input" placeholder="e.g., blue, nike, backpack" value={newItem.tags} onChange={e=>setNewItem({...newItem,tags:e.target.value})}/></div>
          <div className="input-group"><label>Upload Image (optional)</label><input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} style={{display:'none'}}/><button type="button" className="btn btn-secondary" onClick={()=>fileInputRef.current?.click()} style={{width:'100%'}}>{uploadedImage?'✅ Image Uploaded':'📷 Choose Image'}</button>{uploadedImage&&<img src={uploadedImage} alt="Preview" style={{width:'100%',borderRadius:'8px',marginTop:8,maxHeight:150,objectFit:'cover'}}/>}</div>
          <div style={{display:'flex',gap:12,marginTop:4}}><button className={`btn ${reportType==='lost'?'btn-primary':'btn-accent'}`} onClick={handleReport} style={{flex:1}}>Submit Report</button><button className="btn btn-secondary" onClick={()=>setShowReport(false)}>Cancel</button></div>
        </div>
      </div></div>)}
    </div>
  );
}
