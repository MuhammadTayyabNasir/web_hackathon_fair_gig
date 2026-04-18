import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import Layout from '../components/Layout';
import ImagePreview from '../components/ImagePreview';
import api from '../api/client';
import { auth, storage } from '../lib/firebase';
import { createUniqueId } from '../lib/unique-id';

const schema = z.object({
  platform_id: z.string().min(1, 'Platform required'),
  work_date: z.string().min(1, 'Date required'),
  shift_start: z.string().optional(),
  shift_end: z.string().optional(),
  hours_worked: z.coerce.number().positive('Hours must be > 0'),
  gross_earned: z.coerce.number().positive('Gross must be > 0'),
  platform_deductions: z.coerce.number().min(0, 'Deductions must be >= 0'),
});

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read image file'));
    reader.readAsDataURL(file);
  });
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Could not compress image'));
    }, type, quality);
  });
}

async function compressImage(file) {
  const fileData = await readImageFile(file);
  const image = new Image();
  image.src = fileData;

  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = () => reject(new Error('Invalid image file'));
  });

  const maxDimension = 1600;
  const ratio = Math.min(maxDimension / image.width, maxDimension / image.height, 1);
  const width = Math.round(image.width * ratio);
  const height = Math.round(image.height * ratio);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0, width, height);

  const outputType = 'image/jpeg';
  const qualitySteps = [0.85, 0.75, 0.65, 0.55, 0.45];
  let compressedBlob = null;

  for (const quality of qualitySteps) {
    const blob = await canvasToBlob(canvas, outputType, quality);
    compressedBlob = blob;
    if (blob.size <= MAX_UPLOAD_BYTES) {
      break;
    }
  }

  if (!compressedBlob || compressedBlob.size > MAX_UPLOAD_BYTES) {
    throw new Error('Compressed image is still larger than 5MB. Please pick a smaller image.');
  }

  return new File([compressedBlob], `${file.name.replace(/\.[^.]+$/, '') || 'shift'}-compressed.jpg`, {
    type: outputType,
    lastModified: Date.now(),
  });
}

export default function EditShiftPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [platforms, setPlatforms] = useState([]);
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);

  const { data: shiftData, isLoading } = useQuery({
    queryKey: ['shift', id],
    queryFn: () => api.get(`/api/v1/earnings/shifts/${id}`).then((r) => r.data),
  });

  const shift = shiftData?.data?.shift;
  const verificationStatus = shift?.verification_status || 'pending';
  const isEditable = verificationStatus !== 'verified';

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    api.get('/api/v1/earnings/platforms')
      .then((r) => setPlatforms(r.data?.data?.platforms || []))
      .catch(() => toast.error('Could not load platforms'));
  }, []);

  useEffect(() => {
    if (!shift) return;
    reset({
      platform_id: shift.platform_id,
      work_date: String(shift.work_date).slice(0, 10),
      shift_start: shift.shift_start || '',
      shift_end: shift.shift_end || '',
      hours_worked: shift.hours_worked || '',
      gross_earned: shift.gross_earned || '',
      platform_deductions: shift.platform_deductions || '',
    });
  }, [shift, reset]);

  async function onSubmit(values) {
    if (!isEditable) {
      toast.error('Verified shifts are locked and cannot be edited.');
      return;
    }

    try {
      const net_received = Number(values.gross_earned) - Number(values.platform_deductions);
      await api.put(`/api/v1/earnings/shifts/${id}`, {
        ...values,
        net_received,
      });

      if (screenshotFile) {
        setUploadingScreenshot(true);
        const compressedScreenshot = await compressImage(screenshotFile);
        const firebaseUid = auth.currentUser?.uid;
        if (!firebaseUid) {
          throw new Error('Please sign in again before uploading a screenshot.');
        }

        const storagePath = `worker-uploads/${firebaseUid}/shifts/${id}/${createUniqueId('shift')}.jpg`;
        const screenshotRef = ref(storage, storagePath);
        const uploadResult = await uploadBytes(screenshotRef, compressedScreenshot, { contentType: compressedScreenshot.type });
        const downloadUrl = await getDownloadURL(uploadResult.ref);

        await api.post(`/api/v1/earnings/shifts/${id}/screenshot-url`, {
          storage_url: downloadUrl,
          mime_type: compressedScreenshot.type,
          file_size_bytes: compressedScreenshot.size,
          original_filename: compressedScreenshot.name,
        });
      }

      await queryClient.invalidateQueries({ queryKey: ['shifts'] });
      await queryClient.invalidateQueries({ queryKey: ['shift', id] });
      await queryClient.invalidateQueries({ queryKey: ['verifier-queue'] });
      toast.success('Shift updated. Status moved to pending for re-review.');
      navigate('/worker/shifts');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Could not update shift');
    } finally {
      setUploadingScreenshot(false);
    }
  }

  if (isLoading) return <Layout><div className="h-64 animate-pulse rounded-xl bg-slate-200" /></Layout>;
  if (!shift) return <Layout><div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">Shift not found.</div></Layout>;

  return (
    <Layout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-cyan-50">Edit Shift</h1>
          <p className="mt-1 text-sm text-cyan-200/70">You can edit pending, flagged, and unverifiable shifts. Verified shifts are locked.</p>
        </div>

        <div className="rounded-xl border border-cyan-300/25 bg-slate-900/50 p-4 text-sm text-cyan-100">
          Current verification status: <span className="font-semibold uppercase">{verificationStatus}</span>
          {!isEditable && <p className="mt-1 text-xs text-lime-200">This shift is verified and cannot be changed.</p>}
          {isEditable && <p className="mt-1 text-xs text-cyan-200/80">Saving changes sets status back to pending so verifier can review updated data.</p>}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-2xl border border-cyan-300/25 bg-slate-900/60 p-6 shadow-[0_15px_45px_rgba(2,6,23,0.45)] backdrop-blur-lg">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-cyan-100">Platform</label>
              <select
                {...register('platform_id')}
                disabled={!isEditable}
                className="w-full rounded-lg border border-cyan-300/40 bg-slate-800/70 px-3 py-2.5 text-sm text-cyan-100"
              >
                <option value="">Select platform...</option>
                {platforms.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              {errors.platform_id && <p className="mt-1 text-xs text-red-400">{errors.platform_id.message}</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-cyan-100">Work Date</label>
              <input {...register('work_date')} type="date" disabled={!isEditable} className="w-full rounded-lg border border-cyan-300/40 bg-slate-800/70 px-3 py-2.5 text-sm text-cyan-100" />
              {errors.work_date && <p className="mt-1 text-xs text-red-400">{errors.work_date.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-cyan-100">Shift Start</label>
              <input {...register('shift_start')} type="time" disabled={!isEditable} className="w-full rounded-lg border border-cyan-300/40 bg-slate-800/70 px-3 py-2.5 text-sm text-cyan-100" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-cyan-100">Shift End</label>
              <input {...register('shift_end')} type="time" disabled={!isEditable} className="w-full rounded-lg border border-cyan-300/40 bg-slate-800/70 px-3 py-2.5 text-sm text-cyan-100" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-cyan-100">Hours Worked</label>
              <input {...register('hours_worked')} type="number" step="0.1" min="0" disabled={!isEditable} className="w-full rounded-lg border border-cyan-300/40 bg-slate-800/70 px-3 py-2.5 text-sm text-cyan-100" />
              {errors.hours_worked && <p className="mt-1 text-xs text-red-400">{errors.hours_worked.message}</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-cyan-100">Gross (PKR)</label>
              <input {...register('gross_earned')} type="number" step="0.01" min="0" disabled={!isEditable} className="w-full rounded-lg border border-cyan-300/40 bg-slate-800/70 px-3 py-2.5 text-sm text-cyan-100" />
              {errors.gross_earned && <p className="mt-1 text-xs text-red-400">{errors.gross_earned.message}</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-cyan-100">Deductions (PKR)</label>
              <input {...register('platform_deductions')} type="number" step="0.01" min="0" disabled={!isEditable} className="w-full rounded-lg border border-cyan-300/40 bg-slate-800/70 px-3 py-2.5 text-sm text-cyan-100" />
              {errors.platform_deductions && <p className="mt-1 text-xs text-red-400">{errors.platform_deductions.message}</p>}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-cyan-100">Replace Screenshot</label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              disabled={!isEditable}
              onChange={(event) => setScreenshotFile(event.target.files?.[0] || null)}
              className="w-full rounded-lg border border-cyan-300/40 bg-slate-800/70 px-3 py-2 text-sm text-cyan-100 file:mr-4 file:rounded-md file:border-0 file:bg-cyan-950 file:px-3 file:py-2 file:text-cyan-200"
            />
            <p className="mt-1 text-xs text-cyan-200/70">Optional. Uploading a new screenshot will also trigger pending re-review.</p>
            <ImagePreview file={screenshotFile} onRemove={() => setScreenshotFile(null)} />
            {shift.screenshot_url && !screenshotFile && (
              <a href={shift.screenshot_url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-cyan-200 underline">View current screenshot</a>
            )}
          </div>

          <button
            type="submit"
            disabled={!isEditable || isSubmitting || uploadingScreenshot}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {(isSubmitting || uploadingScreenshot) && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
            {isSubmitting || uploadingScreenshot ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </Layout>
  );
}
