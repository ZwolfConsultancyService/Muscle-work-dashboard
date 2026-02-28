import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Calendar, Tag, Save, X, ExternalLink, ChevronDown, Loader2 } from 'lucide-react';
import { fetchGalleryById, updateGallery, deleteGallery } from '../../api/galleryApi';

const CATEGORIES = ['Clinic', 'Therapy', 'Exercise', 'Doctor'];

const CAT_ACCENTS = {
  Clinic:   'bg-blue-50 text-blue-700 border-blue-200',
  Therapy:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  Exercise: 'bg-orange-50 text-orange-700 border-orange-200',
  Doctor:   'bg-violet-50 text-violet-700 border-violet-200',
};
const DEFAULT_ACCENT = 'bg-rose-50 text-rose-700 border-rose-200';

const fmt = (d, opts) => { try { return new Date(d).toLocaleDateString('en-IN', opts); } catch { return '—'; } };

const GalleryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [image, setImage]             = useState(null);
  const [editMode, setEditMode]       = useState(false);
  const [editData, setEditData]       = useState({});
  const [deleteModal, setDeleteModal] = useState(false);
  const [saved, setSaved]             = useState(false);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [deleting, setDeleting]       = useState(false);
  const [fetchError, setFetchError]   = useState('');
  const [saveError, setSaveError]     = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await fetchGalleryById(id);
        setImage(data.data);
        setEditData({ ...data.data });
      } catch (e) {
        setFetchError(e?.response?.data?.message || 'Image not found');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleChange = e => setEditData({ ...editData, [e.target.name]: e.target.value });

  const handleUpdate = async () => {
    try {
      setSaving(true);
      setSaveError('');
      const { data } = await updateGallery(id, {
        title: editData.title,
        cat:   editData.cat,
      });
      setImage(data.data);
      setEditData({ ...data.data });
      setEditMode(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setSaveError(e?.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteGallery(id);
      navigate('/admin/gallery');
    } catch (e) {
      console.error('deleteGallery:', e);
      setDeleting(false);
      setDeleteModal(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f8f7f4' }}>
      <Loader2 size={32} style={{ color:'#9ca3af',animation:'spin 1s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (fetchError || !image) return (
    <div style={{ minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'DM Sans',sans-serif",background:'#f8f7f4' }}>
      <div style={{ textAlign:'center' }}>
        <p style={{ color:'#6b7280',marginBottom:16 }}>{fetchError || 'Image not found'}</p>
        <button onClick={() => navigate('/admin/gallery')}
          style={{ background:'#1a1a1a',color:'#fff',border:'none',borderRadius:10,padding:'10px 20px',cursor:'pointer',fontWeight:600 }}>
          Back to Gallery
        </button>
      </div>
    </div>
  );

  const catClass = CAT_ACCENTS[image.cat] || DEFAULT_ACCENT;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');
        .gd-root { font-family:'DM Sans',sans-serif; background:#f8f7f4; min-height:100vh; padding:2rem 1rem; }
        .gd-heading { font-family:'Cormorant Garamond',serif; }
        .gd-input { width:100%; padding:10px 14px; font-size:14px; border:1.5px solid #e5e7eb; border-radius:11px; font-family:'DM Sans',sans-serif; color:#111; background:#fff; outline:none; transition:border-color .2s,box-shadow .2s; box-sizing:border-box; }
        .gd-input:focus { border-color:#1a1a1a; box-shadow:0 0 0 3px rgba(26,26,26,.08); }
        .gd-select { width:100%; padding:10px 38px 10px 14px; font-size:14px; border:1.5px solid #e5e7eb; border-radius:11px; font-family:'DM Sans',sans-serif; color:#111; background:#fff; outline:none; appearance:none; cursor:pointer; }
        .gd-select:focus { border-color:#1a1a1a; box-shadow:0 0 0 3px rgba(26,26,26,.08); }
        .gd-label { display:block; font-size:11px; font-weight:600; color:#9ca3af; margin-bottom:5px; text-transform:uppercase; letter-spacing:.06em; }
        .info-row { display:flex; flex-direction:column; gap:4px; padding:14px 0; border-bottom:1px solid #f3f4f6; }
        .info-row:last-child { border-bottom:none; }
        .action-btn { display:inline-flex; align-items:center; gap:7px; padding:9px 20px; border-radius:11px; border:none; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600; cursor:pointer; transition:all .2s; }
        .btn-edit   { background:#f1f5f9; color:#334155; } .btn-edit:hover { background:#e2e8f0; }
        .btn-delete { background:#fff1f2; color:#f43f5e; } .btn-delete:hover { background:#ffe4e6; }
        .btn-save   { background:#1a1a1a; color:#fff; } .btn-save:hover:not(:disabled) { background:#333; } .btn-save:disabled { opacity:.7; cursor:not-allowed; }
        .btn-cancel { background:#f1f5f9; color:#334155; } .btn-cancel:hover { background:#e2e8f0; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation:fadeUp .3s ease both; }
        @keyframes spin { to{transform:rotate(360deg)} }
        .spin { animation:spin 1s linear infinite; }
      `}</style>

      <div className="gd-root">
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <button onClick={() => navigate('/admin/gallery')}
            style={{ display:'flex',alignItems:'center',gap:6,background:'none',border:'none',cursor:'pointer',color:'#6b7280',fontSize:14,fontFamily:"'DM Sans',sans-serif",marginBottom:28,padding:0 }}>
            <ArrowLeft size={16}/> Back to Gallery
          </button>

          <div style={{ display:'flex',flexWrap:'wrap',justifyContent:'space-between',alignItems:'flex-start',gap:16,marginBottom:28 }}>
            <div>
              <h1 className="gd-heading" style={{ fontSize:34,fontWeight:700,color:'#111',marginBottom:6 }}>
                {editMode ? 'Edit Image' : image.title}
              </h1>
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${catClass}`}>
                {image.cat}
              </span>
            </div>
            <div style={{ display:'flex',gap:10 }}>
              {!editMode ? (
                <>
                  <button className="action-btn btn-edit" onClick={() => { setSaveError(''); setEditMode(true); }}><Edit2 size={14}/> Edit</button>
                  <button className="action-btn btn-delete" onClick={() => setDeleteModal(true)}><Trash2 size={14}/> Delete</button>
                </>
              ) : (
                <>
                  <button className="action-btn btn-save" onClick={handleUpdate} disabled={saving}>
                    {saving ? <><Loader2 size={14} className="spin"/> Saving…</> : <><Save size={14}/> Save Changes</>}
                  </button>
                  <button className="action-btn btn-cancel" onClick={() => { setEditMode(false); setEditData({...image}); setSaveError(''); }}><X size={14}/> Cancel</button>
                </>
              )}
            </div>
          </div>

          {saved && (
            <div className="fade-up" style={{ background:'#f0fdf4',border:'1.5px solid #bbf7d0',borderRadius:12,padding:'12px 18px',marginBottom:20,display:'flex',alignItems:'center',gap:8 }}>
              <span style={{ fontSize:16 }}>✓</span>
              <p style={{ color:'#15803d',fontWeight:600,fontSize:14,margin:0 }}>Changes saved successfully</p>
            </div>
          )}
          {saveError && (
            <div className="fade-up" style={{ background:'#fff1f2',border:'1.5px solid #fecdd3',borderRadius:12,padding:'12px 18px',marginBottom:20 }}>
              <p style={{ color:'#be123c',fontSize:14,margin:0 }}>{saveError}</p>
            </div>
          )}

          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:24 }} className="detail-grid">
            {/* Image Preview */}
            <div style={{ background:'#fff',borderRadius:18,border:'1px solid rgba(0,0,0,0.07)',overflow:'hidden',boxShadow:'0 4px 20px rgba(0,0,0,0.06)' }}>
              <div style={{ aspectRatio:'1/1',overflow:'hidden',background:'#f3f4f6' }}>
                <img src={image.url || ''} alt={image.title}
                  style={{ width:'100%',height:'100%',objectFit:'cover',display:'block' }}
                  onError={e => { e.target.src='https://placehold.co/600x600?text=Image+Error'; }}/>
              </div>
              <div style={{ padding:'16px 20px',borderTop:'1px solid #f3f4f6' }}>
                <p style={{ fontSize:12,color:'#9ca3af',marginBottom:4 }}>Image URL</p>
                <a href={image.url || '#'} target="_blank" rel="noopener noreferrer"
                  style={{ color:'#3b82f6',fontSize:13,wordBreak:'break-all',display:'flex',alignItems:'flex-start',gap:4,textDecoration:'none' }}>
                  <ExternalLink size={13} style={{ flexShrink:0,marginTop:2 }}/>
                  <span>{image.url?.length > 60 ? image.url.slice(0, 60) + '…' : image.url || 'No URL'}</span>
                </a>
              </div>
            </div>

            {/* Info / Edit Panel */}
            <div style={{ background:'#fff',borderRadius:18,border:'1px solid rgba(0,0,0,0.07)',padding:'24px',boxShadow:'0 4px 20px rgba(0,0,0,0.06)' }}>
              <p style={{ fontSize:11,fontWeight:600,color:'#9ca3af',letterSpacing:'.06em',textTransform:'uppercase',marginBottom:16 }}>
                {editMode ? 'Edit Details' : 'Image Information'}
              </p>

              {editMode ? (
                <div style={{ display:'flex',flexDirection:'column',gap:16 }} className="fade-up">
                  <div>
                    <label className="gd-label">Title</label>
                    <input type="text" name="title" value={editData.title || ''} onChange={handleChange} className="gd-input" placeholder="Image title"/>
                  </div>
                  <div>
                    <label className="gd-label">Category</label>
                    <div style={{ position:'relative' }}>
                      <select name="cat" value={editData.cat || ''} onChange={handleChange} className="gd-select">
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <ChevronDown size={15} style={{ position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',pointerEvents:'none',color:'#9ca3af' }}/>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  {[
                    { icon: Tag,      label: 'Title',        value: image.title },
                    { icon: Tag,      label: 'Category',     value: image.cat },
                    { icon: Calendar, label: 'Uploaded On',  value: fmt(image.createdAt, { day:'numeric',month:'long',year:'numeric' }) },
                    { icon: Calendar, label: 'Last Updated', value: fmt(image.updatedAt, { day:'numeric',month:'long',year:'numeric' }) },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="info-row">
                      <span style={{ fontSize:11,fontWeight:600,color:'#9ca3af',textTransform:'uppercase',letterSpacing:'.05em',display:'flex',alignItems:'center',gap:5 }}>
                        <Icon size={12}/> {label}
                      </span>
                      <span style={{ fontSize:15,fontWeight:600,color:'#111' }}>{value}</span>
                    </div>
                  ))}
                  <div style={{ marginTop:16,background:'#f8f7f4',borderRadius:10,padding:'10px 14px' }}>
                    <p style={{ fontSize:11,color:'#9ca3af',marginBottom:4,fontWeight:600,textTransform:'uppercase',letterSpacing:'.05em' }}>Image ID</p>
                    <p style={{ fontSize:13,color:'#374151',fontFamily:'monospace',margin:0 }}>{image._id}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <style>{`@media(max-width:700px){ .detail-grid{ grid-template-columns:1fr !important; } }`}</style>
        </div>
      </div>

      {/* Delete Modal */}
      {deleteModal && (
        <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100,padding:16 }}>
          <div className="fade-up" style={{ background:'#fff',borderRadius:20,padding:'28px 32px',maxWidth:380,width:'100%',boxShadow:'0 32px 64px rgba(0,0,0,0.2)' }}>
            <div style={{ width:48,height:48,borderRadius:999,background:'#fff1f2',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px' }}>
              <Trash2 size={20} style={{ color:'#f43f5e' }}/>
            </div>
            <h3 className="gd-heading" style={{ fontSize:22,fontWeight:700,textAlign:'center',color:'#111',marginBottom:8 }}>Delete Image?</h3>
            <p style={{ color:'#6b7280',fontSize:13,textAlign:'center',lineHeight:1.6,marginBottom:24 }}>
              <strong style={{ color:'#111' }}>"{image.title}"</strong> will be permanently removed from the gallery and ImageKit.
            </p>
            <div style={{ display:'flex',gap:12 }}>
              <button onClick={() => setDeleteModal(false)} disabled={deleting}
                style={{ flex:1,border:'1.5px solid #e5e7eb',borderRadius:12,padding:'11px',fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:14,cursor:'pointer',background:'#fff',color:'#374151' }}>
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                style={{ flex:1,border:'none',borderRadius:12,padding:'11px',fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:14,cursor:deleting?'not-allowed':'pointer',background:'#f43f5e',color:'#fff',opacity:deleting?0.7:1,display:'flex',alignItems:'center',justifyContent:'center',gap:8 }}>
                {deleting ? <><Loader2 size={14} className="spin"/> Deleting…</> : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GalleryDetail;