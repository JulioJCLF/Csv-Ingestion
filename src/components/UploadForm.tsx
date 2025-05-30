import { useState } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { uploadClaims } from '@/lib/api'

interface UploadResult {
  successCount: number
  errorCount: number
  errors: { row: number; message: string }[]
}

export default function UploadForm({ onSuccess = () => { } }: { onSuccess?: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleUpload = async () => {
    if (!file) return

    setLoading(true)
    setResult(null)
    try {
      const res = await uploadClaims(file)
      
      setResult(res)
      if (res.errorCount === 0) {
        onSuccess()
      }
    } catch (error) {
      setResult({
        successCount: 0,
        errorCount: 1,
        errors: [{
          row: 0,
          message: error instanceof Error ? error.message : 'Upload failed. Please try again.'
        }]
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile)
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null)
  }

  return (
    <div className="max-w-4xl p-6">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl shadow-2xl border border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/5"></div>
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-gray-800/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-gray-900/5 rounded-full blur-lg"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                Upload Claims Data
              </h2>
            </div>
            <p className="text-gray-700 text-lg">
              Import your CSV file to process claims efficiently
            </p>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div
            className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ${dragActive
                ? 'border-white bg-gray-700 scale-105'
                : file
                  ? 'border-green-400 bg-gray-700'
                  : 'border-gray-600 bg-gray-800 hover:border-white hover:bg-gray-700'
              }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={loading}
            />

            <div className="text-center space-y-4">
              {file ? (
                <div className="flex flex-col items-center space-y-3">
                  <div className="p-4 bg-green-100 rounded-full">
                    <FileText className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{file.name}</p>
                    <p className="text-sm text-gray-300">
                      {(file.size / 1024).toFixed(1)} KB • Ready to upload
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-3">
                  <div className={`p-4 rounded-full transition-colors ${dragActive ? 'bg-gray-700' : 'bg-gray-700'
                    }`}>
                    <Upload className={`w-8 h-8 transition-colors ${dragActive ? 'text-white' : 'text-gray-300'
                      }`} />
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      Drop your CSV file here, or click to browse
                    </p>
                    <p className="text-sm text-gray-300">
                      Supports CSV files up to 10MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className={`px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform ${!file || loading
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-gray-200 via-gray-300 to-gray-400 text-gray-800 hover:from-gray-300 hover:to-gray-200 hover:scale-105 hover:shadow-xl active:scale-95'
                }`}
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Upload className="w-5 h-5" />
                  Upload & Process
                </div>
              )}
            </button>
          </div>

          {result && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-lg font-bold text-green-800">
                        {result.successCount} Successful
                      </p>
                      <p className="text-sm text-green-600">
                        Claims processed successfully
                      </p>
                    </div>
                  </div>
                </div>

                {result.errorCount > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                  <div className="flex items-center gap-3"> 
                    <AlertCircle className="w-8 h-8 text-red-600" />
                    <div>
                      <p className="text-lg font-bold text-red-800">
                        {result.errorCount} Errors
                      </p>
                      <p className="text-sm text-red-600">
                        Issues found during processing
                      </p>
                    </div>
                  </div>
                </div>
              )}
              </div>

              {result.errors.length > 0 && (
                <div className="bg-red-900/20 border border-red-800 rounded-2xl p-6">
                  <h3 className="font-bold text-red-400 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Error Details
                  </h3>
                  <div className="space-y-2">
                    {result.errors.map((error, i) => (
                      <div
                        key={i}
                        className="bg-gray-800 border border-red-800/50 rounded-xl p-4 animate-in slide-in-from-left-2 duration-300"
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="bg-red-900/30 text-red-400 px-2 py-1 rounded-lg text-xs font-mono font-bold">
                            Row {error.row}
                          </div>
                          <p className="text-red-300 flex-1">{error.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.errorCount === 0 && (
                <div className="text-center p-6 bg-green-900/20 border border-green-800 rounded-2xl">
                  <div className="inline-flex items-center gap-2 text-green-400 font-semibold text-lg">
                    <CheckCircle className="w-6 h-6" />
                    All claims processed successfully!
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}