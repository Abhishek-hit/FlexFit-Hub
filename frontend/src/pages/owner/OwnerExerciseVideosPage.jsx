import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FiUpload, FiCopy, FiVideo } from 'react-icons/fi';
import { workoutApi } from '../../api/workoutApi';
import { useToast } from '../../context/ToastContext';
import { apiErrorMessage } from '../../api/axiosClient';
import EmptyState from '../../components/common/EmptyState';
import './Owner.css';

export default function OwnerExerciseVideosPage() {
  const { gymId } = useParams();
  const toast = useToast();
  const [uploads, setUploads] = useState([]);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e, type) {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      const { data } = await workoutApi.uploadMedia(gymId, formData, type);
      setUploads((prev) => [{ url: data.data.url, type, name: file.name }, ...prev]);
      toast.success('Uploaded — copy the URL and paste it into an exercise while building a workout plan.');
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Upload failed — check Cloudinary credentials.'));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  function copyUrl(url) {
    navigator.clipboard.writeText(url);
    toast.info('URL copied to clipboard.');
  }

  return (
    <div>
      <div className="page-title-row">
        <div><h1>Exercise Videos</h1><p className="subtitle">Upload tutorial & machine-usage videos, or exercise images</p></div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 22, display: 'flex', gap: 12 }}>
        <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
          <FiUpload /> Upload Video
          <input type="file" accept="video/*" hidden onChange={(e) => handleUpload(e, 'video')} disabled={uploading} />
        </label>
        <label className="btn btn-outline" style={{ cursor: 'pointer' }}>
          <FiUpload /> Upload Image
          <input type="file" accept="image/*" hidden onChange={(e) => handleUpload(e, 'image')} disabled={uploading} />
        </label>
      </div>

      {uploads.length === 0 ? (
        <EmptyState title="No uploads yet this session" subtitle="Uploaded media URLs can be pasted into exercise fields when building a Workout Plan." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {uploads.map((u, i) => (
            <div key={i} className="card card-pad" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FiVideo />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{u.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.url}</div>
                </div>
              </div>
              <button className="btn btn-sm btn-outline" onClick={() => copyUrl(u.url)}><FiCopy /> Copy URL</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
