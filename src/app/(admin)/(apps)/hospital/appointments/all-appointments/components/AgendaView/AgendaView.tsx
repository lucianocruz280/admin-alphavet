'use client'

import { useState } from 'react'
import AgendaCalendarSection from './AgendaCalendarSection'
import useAxios from '@/hooks/useAxios'

export type AgendaEvent = {
  id: string
  petName: string
  serviceType: string
  start: string
  end: string
  status: 'SCHEDULED' | 'WAITING' | 'IN_CONSULTATION' | 'DONE'
  vetName?: string
}


const AgendaView = () => {
  const { data, loading } = useAxios<AgendaEvent[]>({
    method: 'get',
    url: '/admin/appointments',
  })

  if (loading) {
    return <div className="text-muted">Cargando agenda…</div>
  }

  return (
    <AgendaCalendarSection
      events={data ?? []}
      onSelectEvent={(event) => {
        console.log('AGENDA EVENT', event)
     
      }}
    />
  )
}

export default AgendaView
