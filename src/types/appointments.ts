type AppointmentDraft = {
  customerId?: string
  petId?: string
  branchId?: string
  serviceType?: string
  date?: string
  time?: string
  vetId?: string
  notes?: string
  status?: "SCHEDULED" | "WAITING"
}
