export interface Customer {
  id: string
  name: string
  phone: string
  email: string
  address?: string      // Austrian business need: delivery/invoice address
  interest: string      
  budget: string        
  status: 'offen' | 'angeboten' | 'verkauft' | 'abgesagt'
  notes: string
  createdAt: string     
  updatedAt: string
}

export interface Transaction {
  id: string
  date: string
  type: 'einnahme' | 'ausgabe'
  amount: number
  category: string
  description: string
  invoiceNumber?: string // Austrian: Rechnungsnummer
  customerId?: string    // Optional link to customer
}

export interface CRMData {
  customers: Customer[]
  transactions: Transaction[]
}
