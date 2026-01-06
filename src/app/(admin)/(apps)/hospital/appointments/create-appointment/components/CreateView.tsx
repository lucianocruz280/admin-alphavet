'use client'

import { useState } from 'react'
import {
    Card,
    Button,
    Form,
    Row,
    Col,
} from 'react-bootstrap'
import AppointmentCalendarSection from './AppointmentCalendarSection'
import AddPetModal from './AddPetModal'

type AppointmentDraft = {
    customerId?: string
    customerName?: string
    customerPhone?: string

    petId?: string

    branchId?: string
    serviceType?: string

    date?: string
    time?: string
    vetId?: string

    notes?: string
}

const serviceEvents = [
    { id: 'CONSULTA', title: 'Consulta General', variant: 'primary', duration: '00:30' },
    { id: 'VACUNACION', title: 'Vacunación', variant: 'success', duration: '00:15' },
    { id: 'DESPARASITACION', title: 'Desparasitación', variant: 'warning', duration: '00:20' },
    { id: 'ESTETICA', title: 'Estética', variant: 'info', duration: '01:00' },
]


const AdminCreateAppointmentView = () => {
    const [draft, setDraft] = useState<AppointmentDraft>({})
    const [showPetModal, setShowPetModal] = useState(false)

    const update = (patch: Partial<AppointmentDraft>) =>
        setDraft(prev => ({ ...prev, ...patch }))

    const canSubmit =
        !!draft.customerId &&
        !!draft.petId &&
        !!draft.branchId &&
        !!draft.serviceType &&
        !!draft.date &&
        !!draft.time

    const submit = (status: 'SCHEDULED' | 'WAITING' | 'IN_CONSULTATION') => {
        const payload = { ...draft, status }
        console.log('CREATE APPOINTMENT', payload)
    }

    return (
        <div className="container-fluid py-4">
            <AddPetModal
                show={showPetModal}
                customerId={draft.customerId!}
                onClose={() => setShowPetModal(false)}
                onCreated={(pet) => {
                    update({ petId: pet.id })
                }}
            />
            {/* ================= CLIENTE ================= */}
            <Card className="mb-3">
                <Card.Body>
                    <Card.Title>Cliente</Card.Title>

                    <Row className="g-2 align-items-end">
                        <Col md={4}>
                            <Form.Label>Teléfono / Email</Form.Label>
                            <Form.Control placeholder="Buscar cliente…" />
                        </Col>

                        <Col md="auto">
                            <Button>Buscar</Button>
                        </Col>
                    </Row>

                    {/* Cliente encontrado */}
                    <Row className="mt-3">
                        <Col md={4}>
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control
                                value={draft.customerName ?? ''}
                                onChange={e =>
                                    update({ customerName: e.target.value })
                                }
                            />
                        </Col>

                        <Col md={4}>
                            <Form.Label>Teléfono</Form.Label>
                            <Form.Control
                                value={draft.customerPhone ?? ''}
                                onChange={e =>
                                    update({ customerPhone: e.target.value })
                                }
                            />
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* ================= MASCOTA ================= */}
            <Card className="mb-3">
                <Card.Body>
                    <Card.Title>Mascota</Card.Title>

                    <Row className="g-2">
                        <Col md={6}>
                            <Form.Select
                                value={draft.petId ?? ''}
                                onChange={e => update({ petId: e.target.value })}
                            >
                                <option value="">Selecciona mascota</option>
                                <option value="1">Max – Labrador</option>
                                <option value="2">Luna – Husky</option>
                            </Form.Select>
                        </Col>

                        <Col md="auto">
                            <Button variant="outline-secondary" onClick={() => setShowPetModal(true)}>
                                + Nueva mascota
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* ================= SERVICIO / SUCURSAL ================= */}
            <Row className="g-3 mb-3">
                <Col md={6}>
                    <Card>
                        <Card.Body>
                            <Card.Title>Servicio</Card.Title>
                            <Form.Select
                                value={draft.serviceType ?? ''}
                                onChange={e =>
                                    update({ serviceType: e.target.value })
                                }
                            >
                                <option value="">Selecciona servicio</option>
                                <option value="CONSULTA">Consulta</option>
                                <option value="VACUNACION">Vacunación</option>
                                <option value="ESTETICA">Estética</option>
                                <option value="EMERGENCIA">Emergencia</option>
                            </Form.Select>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6}>
                    <Card>
                        <Card.Body>
                            <Card.Title>Sucursal</Card.Title>
                            <Form.Select
                                value={draft.branchId ?? ''}
                                onChange={e =>
                                    update({ branchId: e.target.value })
                                }
                            >
                                <option value="">Selecciona sucursal</option>
                                <option value="central">Clínica Central</option>
                                <option value="north">Sucursal Norte</option>
                            </Form.Select>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* ================= FECHA / HORA ================= */}
            <Row className="g-3 mb-3">
                <AppointmentCalendarSection
                    onSelectSlot={({ date, time, serviceType }) => {
                        update({
                            date,
                            time,
                            serviceType,
                        })
                    }}
                />
            </Row>

            {/* ================= VETERINARIO ================= */}
            <Card className="mb-3">
                <Card.Body>
                    <Card.Title>Veterinario</Card.Title>
                    <Form.Select
                        value={draft.vetId ?? ''}
                        onChange={e => update({ vetId: e.target.value })}
                    >
                        <option value="">Cualquiera</option>
                        <option value="1">Dr. Roberto Sánchez</option>
                        <option value="2">Dra. Ana López</option>
                    </Form.Select>
                </Card.Body>
            </Card>

            {/* ================= NOTAS ================= */}
            <Card className="mb-3">
                <Card.Body>
                    <Card.Title>Notas</Card.Title>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={draft.notes ?? ''}
                        onChange={e => update({ notes: e.target.value })}
                    />
                </Card.Body>
            </Card>

            {/* ================= ACCIONES ================= */}
            <Card>
                <Card.Body className="d-flex justify-content-end gap-2">
                    <Button
                        variant="secondary"
                        disabled={!canSubmit}
                        onClick={() => submit('SCHEDULED')}
                    >
                        Guardar
                    </Button>

                    <Button
                        variant="warning"
                        disabled={!canSubmit}
                        onClick={() => submit('WAITING')}
                    >
                        A espera
                    </Button>

                    <Button
                        variant="primary"
                        disabled={!canSubmit}
                        onClick={() => submit('IN_CONSULTATION')}
                    >
                        Iniciar consulta
                    </Button>
                </Card.Body>
            </Card>

        </div>
    )
}

export default AdminCreateAppointmentView
