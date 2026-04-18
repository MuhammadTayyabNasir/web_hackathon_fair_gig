import { useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import api from '../api/client';

export default function ImportCsvPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState('');
  const inputRef = useRef();
  const queryClient = useQueryClient();

  function handleFile(e) {
    const f = e.target.files[0];
    if (f && !f.name.endsWith('.csv')) { toast.error('Only CSV files accepted'); return; }
    setFile(f);
    setResult(null);
  }

  async function handleImport() {
    if (!file) return;
    setLoading(true);
    setProgress('Importing rows...');
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await api.post('/api/v1/earnings/shifts/csv', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResult(res.data.data);
      await queryClient.invalidateQueries({ queryKey: ['shifts'] });
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Import failed');
    } finally {
      setLoading(false);
      setProgress('');
    }
  }

  const csvTemplate = `date,platform,hours,gross,deductions,net
2026-03-01,Careem,8,2400,720,1680
2026-03-02,Uber,6,1800,540,1260`;

  function downloadTemplate() {
    const blob = new Blob([csvTemplate], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'fairgig-template.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Layout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Import Shifts from CSV</h1>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-700">Required columns</h2>
            <button onClick={downloadTemplate} className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200">
              Download Template
            </button>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 font-mono text-xs text-slate-600">
            date, platform, hours, gross, deductions, net
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div
            onClick={() => inputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-colors ${
              file ? 'border-green-400 bg-green-50' : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50'
            }`}
          >
            <span className="mb-2 text-4xl">{file ? '✅' : '📤'}</span>
            <p className="font-medium text-slate-700">{file ? file.name : 'Click to select CSV file'}</p>
            <p className="mt-1 text-xs text-slate-500">{file ? `${(file.size/1024).toFixed(1)} KB` : 'Max 5MB'}</p>
            <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
          </div>

          {file && (
            <button
              onClick={handleImport}
              disabled={loading}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-800 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
              {loading ? progress : 'Import Shifts'}
            </button>
          )}
        </div>

        {result && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-slate-700">Import Results</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-slate-50 p-4 text-center">
                <div className="text-2xl font-bold text-slate-900">{result.total}</div>
                <div className="text-xs text-slate-500">Total Rows</div>
              </div>
              <div className="rounded-lg bg-green-50 p-4 text-center">
                <div className="text-2xl font-bold text-green-700">{result.imported}</div>
                <div className="text-xs text-green-600">Imported</div>
              </div>
              <div className="rounded-lg bg-red-50 p-4 text-center">
                <div className="text-2xl font-bold text-red-700">{result.failed}</div>
                <div className="text-xs text-red-600">Failed</div>
              </div>
            </div>
            {result.row_errors?.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-sm font-medium text-slate-700">Row errors:</p>
                <div className="max-h-40 overflow-y-auto rounded-lg bg-red-50 p-3">
                  {result.row_errors.map((e, i) => (
                    <p key={i} className="text-xs text-red-600">Row {e.row}: {e.error}</p>
                  ))}
                </div>
              </div>
            )}
            <p className="mt-4 text-xs text-slate-500">Shifts list was refreshed automatically after this import.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
