import { http } from 'msw'
import { parse } from 'papaparse'
import { z } from 'zod'
import { isValid, parseISO } from 'date-fns'

const claimSchema = z.object({
  claimId: z.string().min(1),
  memberId: z.string().min(1),
  serviceDate: z.string().refine(val => isValid(parseISO(val)), {
    message: 'Invalid date',
  }),
  totalAmount: z.string().refine(val => {
    const num = parseInt(val)
    return !isNaN(num) && num > 0
  }, {
    message: 'Invalid totalAmount (not a positive integer)',
  }),
  diagnosisCodes: z.string().optional(),
})

type Claim = z.infer<typeof claimSchema>

type InvalidClaim = {
  rowData: any
  row: number
  errors: string[]
}

let storedClaims: Claim[] = []

export const handlers = [
  http.post('/claims/upload', async ({ request }) => {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const text = await file.text()
    
    const parsed = parse(text, {
      header: true,
      skipEmptyLines: true,
    })

    const validClaims: Claim[] = []
    const invalidClaims: InvalidClaim[] = []

    parsed.data.forEach((row: any, index: number) => {
      const result = claimSchema.safeParse(row)
      if (!result.success) {
        const errors = result.error.errors.map(err =>
          `${err.path.join('.')}: ${err.message}`
        )
       
        invalidClaims.push({
          rowData: row,
          row: index + 2,
          errors
        })
      } else {
        validClaims.push(result.data)
      }
    })

    if (invalidClaims.length === 0) {
      storedClaims.push(...validClaims)
    }

    return new Response(
      JSON.stringify({
        successCount: validClaims.length,
        errorCount: invalidClaims.length,
        validData: validClaims,
        invalidData: invalidClaims,
        errors: invalidClaims.map(invalid => ({
          row: invalid.row,
          message: invalid.errors.join(', ')
        }))
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }),

  http.get('/claims', async ({ request }) => {
    const url = new URL(request.url)
    const memberId = url.searchParams.get('memberId')
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')

    let filtered = [...storedClaims]

    if (memberId) {
      filtered = filtered.filter(c => c.memberId === memberId)
    }

    if (startDate) {
      filtered = filtered.filter(c => new Date(c.serviceDate) >= new Date(startDate))
    }

    if (endDate) {
      filtered = filtered.filter(c => new Date(c.serviceDate) <= new Date(endDate))
    }

    filtered.sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime())

    return new Response(
      JSON.stringify(filtered),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }),
]