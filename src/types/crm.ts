export interface Customer {
  id: string
  name: string
  phone: string
  email: string
  interest: string      // e.g. "E-Scooter 45km/h", "E-Fahrrad"
  budget: string        // e.g. "€1.200"
  status: 'offen' | 'angeboten' | 'verkauft' | 'abgesagt'
  notes: string
  createdAt: string     // ISO date string
  updatedAt: string
}
