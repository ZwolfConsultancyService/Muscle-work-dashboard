import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Eye, Trash2, Search, LayoutGrid, List, ImageOff, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchGallery, deleteGallery } from '../../api/galleryApi';

const CAT_ACCENTS = {
  Clinic:   { bg: 'bg-blue-500',    light: 'bg-blue-50 text-blue-700 border-blue-200'     },
  Therapy:  { bg: 'bg-emerald-500', light: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  Exercise: { bg: 'bg-orange-500',  light: 'bg-orange-50 text-orange-700 border-orange-200' },
  Doctor:   { bg: 'bg-violet-500',  light: 'bg-violet-50 text-violet-700 border-violet-200' },
};
const DEFAULT_ACCENT = { bg: 'bg-rose-500', light: 'bg-rose-50 text-rose-700 border-rose-200' };

const fmt = d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });


const GalleryList = () => {
  const navigate = useNavigate();
  const [images, setImages]           = useState([]);
  const [categories, setCategories]   = useState([]);
  const [searchTerm, setSearchTerm]   = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [viewMode, setViewMode]       = useState('grid');
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, title: '', cat: '' });
  const [lightbox, setLightbox]       = useState(null);
  const [loading, setLoading]         = useState(true);
  const [deleting, setDeleting]       = useState(false);

  const loadImages = useCallback(async (cat) => {
    try {
      setLoading(true);
      const { data } = await fetchGallery(cat !== 'all' ? cat : null);

      const imgs = data.data || [];

      // Build category counts from images
      const countMap = {};
      imgs.forEach(img => {
        countMap[img.cat] = (countMap[img.cat] || 0) + 1;
      });
      const cats = Object.entries(countMap).map(([category, imageCount]) => ({ category, imageCount }));

      setImages(imgs);
      setCategories(cats);
    } catch (e) {
      console.error('fetchGallery:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadImages('all'); }, [loadImages]);

  const handleCategoryChange = (cat) => {
    setSelectedCat(cat);
    loadImages(cat);
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteGallery(deleteModal.id);
      setImages(prev => prev.filter(img => img._id !== deleteModal.id));
      setCategories(prev =>
        prev.map(c => c.category === deleteModal.cat
          ? { ...c, imageCount: c.imageCount - 1 }
          : c
        ).filter(c => c.imageCount > 0)
      );
    } catch (e) {
      console.error('deleteGallery:', e);
    } finally {
      setDeleting(false);
      setDeleteModal({ show: false, id: null, title: '', cat: '' });
    }
  };

  // Search by title or cat
  const filtered = images.filter(img => {
    const q = searchTerm.toLowerCase();
    return img.title?.toLowerCase().includes(q) || img.cat?.toLowerCase().includes(q);
  });

  const CatBadge = ({ cat, size = 'sm' }) => {
    const a = CAT_ACCENTS[cat] || DEFAULT_ACCENT;
    return (
      <span className={`inline-flex items-center gap-1 border rounded-full font-semibold ${size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'} ${a.light}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${a.bg}`} />
        {cat}
      </span>
    );
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');
        .gl-root { font-family:'DM Sans',sans-serif; background:#f8f7f4; min-height:100vh; padding:2rem 1.5rem; }
        .gl-heading { font-family:'Cormorant Garamond',serif; }
        .gl-card { background:#fff; border-radius:16px; overflow:hidden; border:1px solid rgba(0,0,0,0.06); transition:transform .3s cubic-bezier(.34,1.56,.64,1),box-shadow .3s ease; cursor:pointer; }
        .gl-card:hover { transform:translateY(-6px); box-shadow:0 20px 40px rgba(0,0,0,0.12); }
        .gl-img-wrap { position:relative; overflow:hidden; }
        .gl-img-wrap img { transition:transform .5s ease; }
        .gl-card:hover .gl-img-wrap img { transform:scale(1.08); }
        .gl-overlay { position:absolute; inset:0; background:linear-gradient(to top,rgba(0,0,0,0.55) 0%,transparent 60%); opacity:0; transition:opacity .3s ease; display:flex; align-items:flex-end; padding:12px; }
        .gl-card:hover .gl-overlay { opacity:1; }
        .gl-cat-pill { position:absolute; top:10px; left:10px; backdrop-filter:blur(8px); background:rgba(255,255,255,0.9); border-radius:999px; padding:3px 10px; font-size:11px; font-weight:600; }
        .tab-btn { padding:6px 18px; border-radius:999px; font-size:13px; font-weight:600; transition:all .2s; border:1.5px solid transparent; cursor:pointer; }
        .tab-btn.active { background:#1a1a1a; color:#fff; }
        .tab-btn.inactive { background:transparent; color:#6b7280; border-color:#e5e7eb; }
        .tab-btn.inactive:hover { border-color:#1a1a1a; color:#1a1a1a; }
        .icon-btn { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; transition:all .15s; cursor:pointer; border:none; }
        .icon-btn.view { background:#eff6ff; color:#3b82f6; } .icon-btn.view:hover { background:#dbeafe; }
        .icon-btn.del  { background:#fff1f2; color:#f43f5e; } .icon-btn.del:hover  { background:#ffe4e6; }
        .add-btn { background:#1a1a1a; color:#fff; border:none; border-radius:12px; padding:10px 20px; font-size:14px; font-weight:600; display:flex; align-items:center; gap:8px; cursor:pointer; transition:background .2s,transform .15s; font-family:'DM Sans',sans-serif; }
        .add-btn:hover { background:#333; transform:translateY(-1px); }
        .search-wrap input { font-family:'DM Sans',sans-serif; border:1.5px solid #e5e7eb; border-radius:12px; padding:10px 14px 10px 40px; font-size:14px; outline:none; transition:border-color .2s,box-shadow .2s; background:#fff; color:#111; width:100%; }
        .search-wrap input:focus { border-color:#1a1a1a; box-shadow:0 0 0 3px rgba(26,26,26,0.08); }
        .stat-card { background:#fff; border-radius:14px; border:1px solid rgba(0,0,0,0.06); padding:20px 24px; }
        .list-row { display:flex; align-items:center; gap:16px; padding:12px 16px; border-radius:12px; background:#fff; border:1px solid rgba(0,0,0,0.06); transition:box-shadow .2s; }
        .list-row:hover { box-shadow:0 4px 16px rgba(0,0,0,0.08); }
        .lightbox-bg { position:fixed; inset:0; z-index:100; background:rgba(0,0,0,0.85); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; padding:24px; }
        .lightbox-img { max-width:90vw; max-height:80vh; border-radius:16px; box-shadow:0 40px 80px rgba(0,0,0,0.5); object-fit:contain; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation:fadeUp .4s ease both; }
        @keyframes spin { to{transform:rotate(360deg)} }
        .spin { animation:spin 1s linear infinite; }
      `}</style>

      <div className="gl-root">
        <div style={{ maxWidth:1280, margin:'0 auto' }}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="gl-heading text-4xl font-bold text-gray-900 mb-1">Gallery</h1>
              <p className="text-sm text-gray-400">Manage and organise your clinic images</p>
            </div>
            <button className="add-btn" onClick={() => navigate('/admin/gallery/add')}>
              <Plus size={16}/> Add New Image
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { label:'Total Images',  value: images.length },
              { label:'Categories',    value: categories.length },
              { label:'Showing',       value: filtered.length },
              { label:'Active Filter', value: selectedCat === 'all' ? 'All' : selectedCat, accent: true },
            ].map(({ label, value, accent }) => (
              <div key={label} className="stat-card fade-up">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">{label}</p>
                <p className={`text-2xl font-bold ${accent ? 'text-amber-500' : 'text-gray-900'}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6 items-start sm:items-center">
            <div className="search-wrap flex-1 relative">
              <Search size={16} style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'#9ca3af' }}/>
              <input placeholder="Search by title or category…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
            </div>
            <div className="flex gap-2 flex-wrap">
              {['all', ...categories.map(c => c.category)].map(cat => (
                <button key={cat} onClick={() => handleCategoryChange(cat)}
                  className={`tab-btn ${selectedCat === cat ? 'active' : 'inactive'}`}>
                  {cat === 'all' ? 'All' : cat}
                  {cat !== 'all' && <span className="ml-1 opacity-50 text-xs">({categories.find(c=>c.category===cat)?.imageCount})</span>}
                </button>
              ))}
            </div>
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
              {[['grid', LayoutGrid], ['list', List]].map(([mode, Icon]) => (
                <button key={mode} onClick={() => setViewMode(mode)}
                  style={{ background:viewMode===mode?'#fff':'transparent', borderRadius:10, padding:'6px 10px', border:'none', cursor:'pointer', color:viewMode===mode?'#111':'#9ca3af' }}>
                  <Icon size={16}/>
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <div style={{ display:'flex', justifyContent:'center', padding:'60px 0' }}>
              <Loader2 size={32} className="spin" style={{ color:'#9ca3af' }}/>
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-gray-200">
              <ImageOff size={40} className="text-gray-300 mb-4"/>
              <p className="text-gray-500 font-medium mb-1">No images found</p>
              <p className="text-gray-400 text-sm mb-6">Try a different search or category</p>
              <button className="add-btn" onClick={() => navigate('/admin/gallery/add')}>
                <Plus size={14}/> Add Image
              </button>
            </div>
          )}

          {/* Grid View */}
          {!loading && filtered.length > 0 && viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filtered.map((img, i) => {
                const acc = CAT_ACCENTS[img.cat] || DEFAULT_ACCENT;
                return (
                  <div key={img._id} className="gl-card fade-up" style={{ animationDelay:`${i*50}ms` }}>
                    <div className="gl-img-wrap" style={{ height:200 }}>
                      <img src={img.url || 'https://placehold.co/400x200?text=No+Image'}
                           alt={img.title}
                           style={{ width:'100%',height:'100%',objectFit:'cover',display:'block' }}
                           onError={e=>{e.target.src='https://placehold.co/400x200?text=Error';}}/>
                      <div className="gl-cat-pill">
                        <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${acc.bg}`} style={{ verticalAlign:'middle' }}/>
                        {img.cat}
                      </div>
                      <div className="gl-overlay">
                        <p className="text-white text-sm font-semibold drop-shadow">{img.title}</p>
                      </div>
                    </div>
                    <div style={{ padding:'14px 16px' }}>
                      <p className="font-semibold text-gray-900 text-sm mb-0.5 truncate">{img.title}</p>
                      <p className="text-xs text-gray-400 mb-3">{fmt(img.createdAt)}</p>
                      <div className="flex gap-2">
                        <button className="icon-btn view flex-1" style={{ width:'auto',borderRadius:10 }}
                          onClick={() => navigate(`/admin/gallery/${img._id}`)}>
                          <Eye size={15}/><span className="ml-1.5 text-xs font-semibold">View</span>
                        </button>
                        <button className="icon-btn del"
                          onClick={() => setDeleteModal({ show:true, id:img._id, title:img.title, cat:img.cat })}>
                          <Trash2 size={15}/>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* List View */}
          {!loading && filtered.length > 0 && viewMode === 'list' && (
            <div className="flex flex-col gap-2">
              {filtered.map((img, i) => (
                <div key={img._id} className="list-row fade-up" style={{ animationDelay:`${i*40}ms` }}>
                  <img src={img.url || 'https://placehold.co/56x56?text=No+Img'}
                       alt={img.title}
                       style={{ width:56,height:56,borderRadius:10,objectFit:'cover',flexShrink:0,cursor:'pointer' }}
                       onClick={() => setLightbox(img)}
                       onError={e=>{e.target.src='https://placehold.co/56x56?text=Err';}}/>
                  <div style={{ flex:1,minWidth:0 }}>
                    <p className="font-semibold text-gray-900 text-sm truncate">{img.title}</p>
                    <p className="text-xs text-gray-400">{fmt(img.createdAt)}</p>
                  </div>
                  <CatBadge cat={img.cat}/>
                  <div className="flex gap-2 flex-shrink-0">
                    <button className="icon-btn view" onClick={() => navigate(`/admin/gallery/${img._id}`)}>
                      <Eye size={15}/>
                    </button>
                    <button className="icon-btn del"
                      onClick={() => setDeleteModal({ show:true, id:img._id, title:img.title, cat:img.cat })}>
                      <Trash2 size={15}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filtered.length > 0 && (
            <p className="text-xs text-gray-400 text-right mt-4">{filtered.length} of {images.length} images</p>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="lightbox-bg" onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)}
            style={{ position:'absolute',top:20,right:20,background:'rgba(255,255,255,0.15)',border:'none',borderRadius:999,padding:8,cursor:'pointer',color:'#fff' }}>
            <X size={20}/>
          </button>
          <div onClick={e=>e.stopPropagation()} style={{ textAlign:'center' }}>
            <img src={lightbox.url || ''} alt={lightbox.title} className="lightbox-img"/>
            <p style={{ color:'#fff',marginTop:16,fontFamily:"'DM Sans',sans-serif",fontSize:15,fontWeight:600 }}>{lightbox.title}</p>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal.show && (
        <div className="lightbox-bg" style={{ background:'rgba(0,0,0,0.5)' }}>
          <div style={{ background:'#fff',borderRadius:20,padding:'28px 32px',maxWidth:380,width:'100%',boxShadow:'0 32px 64px rgba(0,0,0,0.25)' }}>
            <div style={{ width:48,height:48,borderRadius:999,background:'#fff1f2',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px' }}>
              <Trash2 size={20} style={{ color:'#f43f5e' }}/>
            </div>
            <h3 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:700,textAlign:'center',color:'#111',marginBottom:8 }}>Delete Image?</h3>
            <p style={{ color:'#6b7280',fontSize:13,textAlign:'center',lineHeight:1.6,marginBottom:24 }}>
              <strong style={{ color:'#111' }}>"{deleteModal.title}"</strong> will be permanently removed. This cannot be undone.
            </p>
            <div style={{ display:'flex',gap:12 }}>
              <button onClick={() => setDeleteModal({ show:false,id:null,title:'',cat:'' })} disabled={deleting}
                style={{ flex:1,border:'1.5px solid #e5e7eb',borderRadius:12,padding:'10px',fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:14,cursor:'pointer',background:'#fff',color:'#374151' }}>
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                style={{ flex:1,border:'none',borderRadius:12,padding:'10px',fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:14,cursor:deleting?'not-allowed':'pointer',background:'#f43f5e',color:'#fff',opacity:deleting?0.7:1,display:'flex',alignItems:'center',justifyContent:'center',gap:8 }}>
                {deleting ? <><Loader2 size={14} className="spin"/> Deleting…</> : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GalleryList;