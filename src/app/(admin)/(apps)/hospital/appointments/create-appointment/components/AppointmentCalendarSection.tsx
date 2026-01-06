'use client'

import { useEffect, useRef } from 'react'
import { Card, Button } from 'react-bootstrap'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin, { Draggable } from '@fullcalendar/interaction'
import SimplebarClient from '@/components/client-wrapper/SimplebarClient'
import useViewPort from '@/hooks/useViewPort'
import { TbCircleFilled } from 'react-icons/tb'

type Props = {
  onSelectSlot: (data: {
    date: string
    time: string
    serviceType: string
  }) => void
}

const serviceEvents = [
  { id: 'CONSULTA', title: 'Consulta General', variant: 'primary', duration: '00:30' },
  { id: 'VACUNACION', title: 'Vacunación', variant: 'success', duration: '00:15' },
  { id: 'DESPARASITACION', title: 'Desparasitación', variant: 'warning', duration: '00:20' },
  { id: 'ESTETICA', title: 'Estética', variant: 'info', duration: '01:00' },
]

const AppointmentCalendarSection = ({ onSelectSlot }: Props) => {
  const externalRef = useRef<HTMLDivElement | null>(null)
  const draggableRef = useRef<Draggable | null>(null)
  const { height } = useViewPort()

  useEffect(() => {
    if (externalRef.current) {
      draggableRef.current = new Draggable(externalRef.current, {
        itemSelector: '.external-event',
        eventData: eventEl => ({
          title: eventEl.getAttribute('data-title')!,
          extendedProps: {
            serviceType: eventEl.getAttribute('data-id'),
            duration: eventEl.getAttribute('data-duration'),
          },
          classNames: [eventEl.getAttribute('data-class')!],
        }),
      })
    }

    return () => draggableRef.current?.destroy()
  }, [])

  return (
    <div className="outlook-box gap-1">

      {/* PANEL IZQUIERDO */}
      <Card className="d-none d-lg-flex rounded-end-0">
        <Card.Body>
          <h6 className="mb-3">Servicios</h6>

          <div ref={externalRef}>
            {serviceEvents.map(s => (
              <div
                key={s.id}
                className={`external-event fc-event bg-${s.variant}-subtle text-${s.variant} fw-semibold d-flex align-items-center mb-2`}
                data-id={s.id}
                data-title={s.title}
                data-duration={s.duration}
                data-class={`bg-${s.variant}-subtle text-${s.variant}`}
              >
                <TbCircleFilled className="me-2" />
                {s.title}
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* CALENDARIO */}
      <Card className="flex-grow-1 rounded-start-0 border-start-0">
        <SimplebarClient className="card-body">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            editable
            droppable
            slotMinTime="07:00:00"
            slotMaxTime="20:00:00"
            slotDuration="00:15:00"
            height={height - 260}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'timeGridDay,timeGridWeek,dayGridMonth',
            }}
            drop={info => {
              const serviceType = info.draggedEl.getAttribute('data-id')!
              const start = info.date

              onSelectSlot({
                serviceType,
                date: start.toISOString().split('T')[0],
                time: start.toTimeString().slice(0, 5),
              })
            }}
          />
        </SimplebarClient>
      </Card>
    </div>
  )
}

export default AppointmentCalendarSection
