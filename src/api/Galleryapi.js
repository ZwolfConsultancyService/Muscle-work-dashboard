// src/api/galleryApi.js
import api from './Axiosinstance';

// ── GET all images (optional category filter) ─────────────────────────────────
export const fetchGallery = (cat = null) => {
  const params = cat && cat !== "All" ? { cat } : {};
  return api.get("/gallery", { params });
};

// ── GET single image by ID ────────────────────────────────────────────────────
export const fetchGalleryById = (id) => api.get(`/gallery/${id}`);

// ── GET category-wise stats ───────────────────────────────────────────────────
export const fetchGalleryStats = () => api.get("/gallery/stats");

// ── POST — File upload (multipart/form-data) ──────────────────────────────────
export const createGalleryByFile = (file, { title, cat }) => {
  const fd = new FormData();
  fd.append("file",  file);
  fd.append("title", title);
  fd.append("cat",   cat);
  return api.post("/gallery", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// ── PATCH — update title or category ─────────────────────────────────────────
export const updateGallery = (id, { title, cat }) => {
  const body = {};
  if (title !== undefined) body.title = title;
  if (cat   !== undefined) body.cat   = cat;
  return api.patch(`/gallery/${id}`, body);
};

// ── DELETE — removes from ImageKit + DB ──────────────────────────────────────
export const deleteGallery = (id) => api.delete(`/gallery/${id}`);

// ── Aliases (backward compatibility) ─────────────────────────────────────────
export const uploadGalleryImage  = createGalleryByFile;
export const deleteGalleryImage  = deleteGallery;
export const updateGalleryImage  = updateGallery;