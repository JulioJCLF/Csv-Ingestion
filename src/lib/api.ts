export async function uploadClaims(file: File) {
    const formData = new FormData()
    formData.append('file', file)
  
    const res = await fetch('/claims/upload', {
      method: 'POST',
      body: formData,
    })
  
    if (!res.ok) throw new Error('Error on CSV Upload')
  
    return res.json()
  }
  
  export async function fetchClaims(filters: {
    memberId?: string
    startDate?: string
    endDate?: string
  }) {
    const params = new URLSearchParams()
  
    if (filters.memberId) params.set('memberId', filters.memberId)
    if (filters.startDate) params.set('startDate', filters.startDate)
    if (filters.endDate) params.set('endDate', filters.endDate)
  
    const res = await fetch(`/claims?${params.toString()}`)
    if (!res.ok) throw new Error('Error on CSV Fetch')
    return res.json()
  }
  