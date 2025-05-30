import { useState } from 'react'
import UploadForm from '@/components/UploadForm'
import ClaimTable from '@/components/ClaimTable'

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="w-screen flex flex-row gap-4 mx-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-6">
      <UploadForm onSuccess={() => setRefreshKey(k => k + 1)} />
      <ClaimTable key={refreshKey} />
    </div>
  )
}
