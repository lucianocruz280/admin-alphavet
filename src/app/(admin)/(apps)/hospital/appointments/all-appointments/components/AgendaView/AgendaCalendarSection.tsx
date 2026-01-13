'use client'

import { Card } from 'react-bootstrap'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import useViewPort from '@/hooks/useViewPort'
import SimplebarClient from '@/components/client-wrapper/SimplebarClient'

type Props = {
  events: any[]
  onSelectEvent: (event: any) => void
}

const statusColorMap: Record<string, string> = {
  SCHEDULED: 'primary',
  WAITING: 'warning',
  IN_CONSULTATION: 'info',
  DONE: 'success',
}

const AgendaCalendarSection = ({ events, onSelectEvent }: Props) => {
  const { height } = useViewPort()

  return (
    <Card className='my-4'>
      <SimplebarClient className="card-body">
        <FullCalendar
          plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
          initialView="timeGridDay"
          slotMinTime="07:00:00"
          slotMaxTime="20:00:00"
          slotDuration="00:15:00"
          height={height - 220}
          allDaySlot={false}
          editable={false}
          selectable={false}
          events={events.map(e => ({
            id: e.id,
            title: `${e.petName} – ${e.serviceType}`,
            start: e.start,
            end: e.end,
            classNames: [`bg-${statusColorMap[e.status]}-subtle`, `text-${statusColorMap[e.status]}`],
            extendedProps: e,
          }))}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridDay,timeGridWeek',
          }}
          eventClick={(info) => {
            onSelectEvent(info.event.extendedProps)
          }}
        />
      </SimplebarClient>
    </Card>
  )
}

export default AgendaCalendarSection
