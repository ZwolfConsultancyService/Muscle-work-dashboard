import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon, CheckCircle, ChevronDown, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createGalleryByFile } from '../../api/galleryApi.js'

// ── Muscle Work categories ──
const CATEGORIES = ['Clinic', 'Therapy', 'Exercise', 'Doctor'];

const GalleryForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData]         = useState({ title: '', cat: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview]           = useState(null);
  const [success, setSuccess]           = useState(false);
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);

  const handleChange = e => { setFormData({ ...formData, [e.target.name]: e.target.value }); setError(''); };

  const handleFileChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please select a valid image file'); return; }
    if (file.size > 5 * 1024 * 1024)    { setError('File size must be under 5MB'); return; }
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setError('');
  };

  const clearPreview = () => { setSelectedFile(null); setPreview(null); };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (!selectedFile)    { setError('Please select an image file'); return; }
    if (!formData.cat)    { setError('Please select a category'); return; }
    if (!formData.title)  { setError('Please enter a title'); return; }

    try {
      setLoading(true);
      await createGalleryByFile(selectedFile, {
        title: formData.title,
        cat:   formData.cat,
      });
      setSuccess(true);
      setTimeout(() => navigate('/admin/gallery'), 1800);
    } catch (e) {
      setError(e?.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');
        .gf-root    { font-family:'DM Sans',sans-serif; background:#f8f7f4; min-height:100vh; padding:2rem 1rem; }
        .gf-heading { font-family:'Cormorant Garamond',serif; }
        .gf-input { width:100%; padding:11px 14px; font-size:14px; border:1.5px solid #e5e7eb; border-radius:12px; font-family:'DM Sans',sans-serif; color:#111; background:#fff; outline:none; transition:border-color .2s,box-shadow .2s; box-sizing:border-box; }
        .gf-input:focus { border-color:#1a1a1a; box-shadow:0 0 0 3px rgba(26,26,26,.08); }
        .gf-input.err { border-color:#f43f5e; }
        .gf-input::placeholder { color:#b0b7c3; }
        .gf-select { width:100%; padding:11px 40px 11px 14px; font-size:14px; border:1.5px solid #e5e7eb; border-radius:12px; font-family:'DM Sans',sans-serif; color:#111; background:#fff; outline:none; appearance:none; cursor:pointer; transition:border-color .2s,box-shadow .2s; }
        .gf-select:focus { border-color:#1a1a1a; box-shadow:0 0 0 3px rgba(26,26,26,.08); }
        .gf-select.err { border-color:#f43f5e; }
        .gf-label { display:block; font-size:12px; font-weight:600; color:#374151; margin-bottom:6px; text-transform:uppercase; letter-spacing:.05em; }
        .gf-required { color:#f43f5e; margin-left:2px; }
        .drop-zone { border:2px dashed #d1d5db; border-radius:14px; padding:40px 24px; text-align:center; cursor:pointer; transition:border-color .2s,background .2s; background:#fafafa; }
        .drop-zone:hover { border-color:#1a1a1a; background:#f5f5f5; }
        .submit-btn { flex:1; background:#1a1a1a; color:#fff; border:none; border-radius:13px; padding:13px 24px; font-family:'DM Sans',sans-serif; font-size:15px; font-weight:600; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:background .2s,transform .15s; }
        .submit-btn:hover:not(:disabled) { background:#333; transform:translateY(-1px); }
        .submit-btn:disabled { opacity:0.7; cursor:not-allowed; }
        .cancel-btn { padding:13px 24px; border-radius:13px; border:1.5px solid #e5e7eb; font-family:'DM Sans',sans-serif; font-size:15px; font-weight:600; cursor:pointer; background:#fff; color:#374151; transition:border-color .2s,background .2s; }
        .cancel-btn:hover { border-color:#9ca3af; background:#f9fafb; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation:fadeUp .35s ease both; }
        @keyframes spin { to{transform:rotate(360deg)} }
        .spin { animation:spin 1s linear infinite; }
      `}</style>

      <div className="gf-root">
        <div style={{ maxWidth:680, margin:'0 auto' }}>
          <button onClick={() => navigate('/admin/gallery')}
            style={{ display:'flex',alignItems:'center',gap:6,background:'none',border:'none',cursor:'pointer',color:'#6b7280',fontSize:14,fontFamily:"'DM Sans',sans-serif",marginBottom:28,padding:0 }}>
            <ArrowLeft size={16}/> Back to Gallery
          </button>

          <div style={{ marginBottom:32 }}>
            <h1 className="gf-heading" style={{ fontSize:36,fontWeight:700,color:'#111',marginBottom:4 }}>Add New Image</h1>
            <p style={{ color:'#9ca3af',fontSize:14 }}>Upload a clinic photo to your gallery</p>
          </div>

          {success && (
            <div className="fade-up" style={{ background:'#f0fdf4',border:'1.5px solid #bbf7d0',borderRadius:14,padding:'14px 18px',display:'flex',alignItems:'center',gap:10,marginBottom:24 }}>
              <CheckCircle size={18} style={{ color:'#22c55e',flexShrink:0 }}/>
              <p style={{ color:'#15803d',fontWeight:600,fontSize:14,margin:0 }}>Image uploaded successfully! Redirecting…</p>
            </div>
          )}

          {error && (
            <div className="fade-up" style={{ background:'#fff1f2',border:'1.5px solid #fecdd3',borderRadius:14,padding:'14px 18px',marginBottom:24 }}>
              <p style={{ color:'#be123c',fontSize:14,margin:0 }}>{error}</p>
            </div>
          )}

          <div style={{ background:'#fff',borderRadius:20,border:'1px solid rgba(0,0,0,0.07)',padding:32,boxShadow:'0 4px 24px rgba(0,0,0,0.06)' }}>
            <form onSubmit={handleSubmit}>

              {/* File Upload */}
              <div style={{ marginBottom:24 }}>
                <label className="gf-label">Upload Image <span className="gf-required">*</span></label>
                {!preview ? (
                  <div className="drop-zone">
                    <input type="file" id="fileInput" accept="image/*" onChange={handleFileChange} style={{ display:'none' }}/>
                    <label htmlFor="fileInput" style={{ cursor:'pointer' }}>
                      <ImageIcon size={36} style={{ color:'#d1d5db',margin:'0 auto 12px',display:'block' }}/>
                      <p style={{ color:'#374151',fontWeight:600,fontSize:14,margin:'0 0 4px' }}>Click to upload</p>
                      <p style={{ color:'#9ca3af',fontSize:13,margin:0 }}>PNG, JPG, JPEG, WEBP · Max 5MB</p>
                    </label>
                  </div>
                ) : (
                  <div style={{ position:'relative' }}>
                    <img src={preview} alt="Preview" style={{ width:'100%',height:220,objectFit:'cover',borderRadius:14,display:'block' }}/>
                    <button type="button" onClick={clearPreview}
                      style={{ position:'absolute',top:10,right:10,background:'rgba(0,0,0,0.6)',border:'none',borderRadius:999,padding:6,cursor:'pointer',color:'#fff',display:'flex' }}>
                      <X size={14}/>
                    </button>
                    <p style={{ marginTop:8,fontSize:13,color:'#6b7280' }}>{selectedFile?.name}</p>
                  </div>
                )}
              </div>

              {/* Title */}
              <div style={{ marginBottom:20 }}>
                <label className="gf-label">Title <span className="gf-required">*</span></label>
                <input type="text" name="title" value={formData.title} onChange={handleChange}
                  placeholder="e.g., Our Clinic Reception"
                  className={`gf-input ${error && !formData.title ? 'err' : ''}`}/>
              </div>

              {/* Category */}
              <div style={{ marginBottom:32 }}>
                <label className="gf-label">Category <span className="gf-required">*</span></label>
                <div style={{ position:'relative' }}>
                  <select name="cat" value={formData.cat} onChange={handleChange}
                    className={`gf-select ${error && !formData.cat ? 'err' : ''}`}>
                    <option value="">— Select a category —</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={16} style={{ position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',pointerEvents:'none',color:'#9ca3af' }}/>
                </div>
              </div>

              <div style={{ display:'flex',gap:12 }}>
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? <><Loader2 size={16} className="spin"/> Uploading…</> : <><Upload size={16}/> Upload Image</>}
                </button>
                <button type="button" onClick={() => navigate('/admin/gallery')} className="cancel-btn">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default GalleryForm;