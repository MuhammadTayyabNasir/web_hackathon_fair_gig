import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import ImagePreview from '../components/ImagePreview';
import api from '../api/client';
import { auth, storage } from '../lib/firebase';
import { createUniqueId } from '../lib/unique-id';
import { playSound } from '../lib/sounds';

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

export default function AddShiftPage() {
  const navigate = useNavigate();
  const [platforms, setPlatforms] = useState([]);
  const [loadingPlatforms, setLoadingPlatforms] = useState(true);
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const [showCustomPlatform, setShowCustomPlatform] = useState(false);
  const [customPlatformName, setCustomPlatformName] = useState('');

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      work_date: new Date().toISOString().slice(0, 10),
      hours_worked: '8',
      gross_earned: '',
      platform_deductions: '',
    },
  });

  const gross = watch('gross_earned');
  const deductions = watch('platform_deductions');
  const shiftStart = watch('shift_start');
  const shiftEnd = watch('shift_end');
  const hoursWorked = watch('hours_worked');

  const net = Math.max(0, Number(gross) - Number(deductions));
  const commissionPct = gross > 0 ? ((deductions / gross) * 100).toFixed(1) : '0.0';

  // Auto-calculate hours from shift start/end
  useEffect(() => {
    if (shiftStart && shiftEnd) {
      const [startH, startM] = shiftStart.split(':').map(Number);
      const [endH, endM] = shiftEnd.split(':').map(Number);
      const startMins = startH * 60 + startM;
      const endMins = endH * 60 + endM;
      let diffMins = endMins - startMins;
      
      // Handle overnight shifts
      if (diffMins < 0) diffMins += 24 * 60;
      
      const hours = (diffMins / 60).toFixed(1);
      setValue('hours_worked', hours);
    }
  }, [shiftStart, shiftEnd, setValue]);

  useEffect(() => {
    api.get('/api/v1/earnings/platforms').then(r => {
      setPlatforms(r.data.data.platforms || []);
    }).catch(() => toast.error('Could not load platforms'))
      .finally(() => setLoadingPlatforms(false));
  }, []);

  async function onSubmit(data) {
    try {
      playSound('click');
      let finalPlatformId = data.platform_id;
      
      // Handle custom platform
      if (data.platform_id === 'CUSTOM' && customPlatformName.trim()) {
        const normalized = customPlatformName.trim().toLowerCase();
        
        // Check if platform with normalized name already exists
        const existing = platforms.find(p => p.name.toLowerCase() === normalized);
        if (existing) {
          finalPlatformId = existing.id;
          toast.success(`Using existing platform: ${existing.name}`);
          playSound('success');
        } else {
          // Create new custom platform
          const createResponse = await api.post('/api/v1/earnings/platforms', { 
            name: customPlatformName.trim() 
          });
          finalPlatformId = createResponse.data?.data?.platform?.id;
          if (!finalPlatformId) {
            throw new Error('Failed to create custom platform');
          }
          toast.success(`Created platform: ${customPlatformName}`);
          playSound('success');
          // Add to list
          setPlatforms([...platforms, { id: finalPlatformId, name: customPlatformName }]);
        }
      }

      const net_received = Number(data.gross_earned) - Number(data.platform_deductions);
      const shiftResponse = await api.post('/api/v1/earnings/shifts', { 
        ...data, 
        platform_id: finalPlatformId,
        net_received 
      });
      const shiftId = shiftResponse.data?.data?.shift?.id;

      if (screenshotFile && shiftId) {
        setUploadingScreenshot(true);
        const compressedScreenshot = await compressImage(screenshotFile);

        const firebaseUid = auth.currentUser?.uid;
        if (!firebaseUid) {
          throw new Error('Please sign in again before uploading a screenshot.');
        }

        const storagePath = `worker-uploads/${firebaseUid}/shifts/${shiftId}/${createUniqueId('shift')}.jpg`;
        const screenshotRef = ref(storage, storagePath);
        const uploadResult = await uploadBytes(screenshotRef, compressedScreenshot, { contentType: compressedScreenshot.type });
        const downloadUrl = await getDownloadURL(uploadResult.ref);

        await api.post(`/api/v1/earnings/shifts/${shiftId}/screenshot-url`, {
          storage_url: downloadUrl,
          mime_type: compressedScreenshot.type,
          file_size_bytes: compressedScreenshot.size,
          original_filename: compressedScreenshot.name,
        });

        toast.success('Shift added and screenshot uploaded!');
      } else {
        toast.success('Shift added!');
      }
      playSound('success');
      navigate('/worker/shifts');
    } catch (err) {
      playSound('error');
      toast.error(err.response?.data?.message || err.message || 'Could not add shift');
    } finally {
      setUploadingScreenshot(false);
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="animate-in-up">
          <h1 className="text-3xl font-bold text-cyan-50">Log a Shift 📝</h1>
          <p className="mt-1 text-sm text-cyan-200/70">Record your work details and earnings</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-2xl border border-cyan-300/25 bg-slate-900/60 p-6 shadow-[0_15px_45px_rgba(2,6,23,0.45)] backdrop-blur-lg">
          {/* Grid fields with staggered animations */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0 }}
            className="grid gap-4 sm:grid-cols-2"
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-cyan-100">Platform <span className="text-red-400">*</span></label>
              <select 
                {...register('platform_id')} 
                disabled={loadingPlatforms}
                onChange={(e) => {
                  setShowCustomPlatform(e.target.value === 'CUSTOM');
                  playSound('click');
                }}
                className="w-full rounded-lg border border-cyan-300/40 bg-slate-800/70 px-3 py-2.5 text-sm text-cyan-100 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 transition-all cursor-pointer hover:border-cyan-300/60"
                title="Select your work platform"
              >
                <option value="" className="bg-slate-900 text-cyan-100">Select platform...</option>
                {platforms.map(p => <option key={p.id} value={p.id} className="bg-slate-900 text-cyan-100">{p.name}</option>)}
                <option value="CUSTOM" className="bg-slate-900 text-cyan-100">+ Add Custom Platform</option>
              </select>
              {errors.platform_id && <p className="mt-1 text-xs text-red-400">{errors.platform_id.message}</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-cyan-100">Work Date <span className="text-red-400">*</span></label>
              <input 
                {...register('work_date')} 
                type="date"
                className="w-full rounded-lg border border-cyan-300/40 bg-slate-800/70 px-3 py-2.5 text-sm text-cyan-100 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 transition-all cursor-pointer"
                title="Date of work shift"
              />
              {errors.work_date && <p className="mt-1 text-xs text-red-400">{errors.work_date.message}</p>}
            </div>
          </motion.div>

          {showCustomPlatform && (
            <div className="animated-in rounded-lg border border-fuchsia-400/40 bg-fuchsia-950/30 p-4">
              <label className="mb-2 block text-sm font-medium text-fuchsia-200">Platform Name <span className="text-red-400">*</span></label>
              <input 
                type="text"
                value={customPlatformName}
                onChange={(e) => setCustomPlatformName(e.target.value)}
                placeholder="e.g., Careem, Uber, Bykea, foodpanda..."
                className="w-full rounded-lg border border-fuchsia-300/40 bg-slate-800/70 px-3 py-2.5 text-sm text-fuchsia-100 placeholder:text-fuchsia-300/60 focus:border-fuchsia-300 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/30"
                title="Enter custom platform name"
              />
              <p className="mt-1 text-xs text-fuchsia-200/70">Platform names are normalized (CAREEM → careem). If it exists, we'll use the existing one.</p>
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-cyan-100">Shift Screenshot</label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => {
                const file = event.target.files?.[0];
                setScreenshotFile(file || null);
                playSound('click');
              }}
              className="w-full rounded-lg border border-cyan-300/40 bg-slate-800/70 px-3 py-2 text-sm text-cyan-100 file:mr-4 file:rounded-md file:border-0 file:bg-cyan-950 file:px-3 file:py-2 file:text-cyan-200 hover:file:bg-cyan-900 transition-all"
              title="Optional: Upload a screenshot of your shift"
            />
            <p className="mt-1 text-xs text-cyan-200/70">Optional. Attach a shift photo for verifier review.</p>
            <ImagePreview file={screenshotFile} onRemove={() => setScreenshotFile(null)} />
          </div>

          <div className="rounded-lg border border-cyan-400/20 bg-cyan-950/20 p-4">
            <h3 className="mb-3 text-sm font-medium text-cyan-100">Shift Timing</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-medium text-cyan-200">Start Time 🕐</label>
                <input 
                  {...register('shift_start')} 
                  type="time"
                  className="w-full rounded-lg border border-cyan-300/40 bg-slate-800/70 px-3 py-2.5 text-sm text-cyan-100 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                  title="Shift start time - automatically calculates hours worked"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-cyan-200">End Time 🕒</label>
                <input 
                  {...register('shift_end')} 
                  type="time"
                  className="w-full rounded-lg border border-cyan-300/40 bg-slate-800/70 px-3 py-2.5 text-sm text-cyan-100 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                  title="Shift end time - automatically calculates hours worked"
                />
              </div>
            </div>
            <p className="mt-2 text-xs text-cyan-200/70">Hours worked will auto-calculate. You can still edit manually.</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-cyan-100">Hours Worked ⏱️ <span className="text-red-400">*</span></label>
            <input 
              {...register('hours_worked')} 
              type="number" 
              step="0.1" 
              min="0"
              className="w-full rounded-lg border border-cyan-300/40 bg-slate-800/70 px-3 py-2.5 text-sm text-cyan-100 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
              title="Total hours worked (auto-calculated from shift times, but modifiable)"
            />
            {errors.hours_worked && <p className="mt-1 text-xs text-red-400">{errors.hours_worked.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-cyan-100">Gross Earned (PKR) <span className="text-red-400">*</span></label>
              <input 
                {...register('gross_earned')} 
                type="number" 
                step="0.01" 
                min="0" 
                placeholder="2400"
                className="w-full rounded-lg border border-cyan-300/40 bg-slate-800/70 px-3 py-2.5 text-sm text-cyan-100 placeholder:text-cyan-300/40 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                title="Total gross earnings before deductions"
              />
              {errors.gross_earned && <p className="mt-1 text-xs text-red-400">{errors.gross_earned.message}</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-cyan-100">Platform Deductions (PKR) <span className="text-red-400">*</span></label>
              <input 
                {...register('platform_deductions')} 
                type="number" 
                step="0.01" 
                min="0" 
                placeholder="720"
                className="w-full rounded-lg border border-cyan-300/40 bg-slate-800/70 px-3 py-2.5 text-sm text-cyan-100 placeholder:text-cyan-300/40 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                title="Commission and fees deducted by platform"
              />
              {errors.platform_deductions && <p className="mt-1 text-xs text-red-400">{errors.platform_deductions.message}</p>}
            </div>
          </div>

          {/* Live deduction breakdown */}
          {gross > 0 && (
            <div className="rounded-xl border border-lime-400/30 bg-gradient-to-r from-lime-950/40 to-cyan-950/40 p-4 animate-in">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs text-cyan-200/80">Gross</p>
                  <p className="font-bold text-cyan-100">PKR {Number(gross).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-cyan-200/80">Commission {commissionPct}%</p>
                  <p className="font-bold text-red-400">−PKR {Number(deductions || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-cyan-200/80">Net</p>
                  <p className="font-bold text-lime-300">PKR {net.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={isSubmitting || loadingPlatforms || uploadingScreenshot}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 py-3 text-sm font-semibold text-white hover:from-cyan-500 hover:to-blue-500 disabled:opacity-60 transition-all duration-200 shadow-[0_8px_20px_rgba(34,211,238,0.3)]"
            title="Save shift and upload screenshot"
          >
            {(isSubmitting || uploadingScreenshot) && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
            {isSubmitting || uploadingScreenshot ? 'Saving...' : 'Save Shift'}
          </button>
        </form>
      </div>
    </Layout>
  );
}
