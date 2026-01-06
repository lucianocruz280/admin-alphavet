'use client'

import { useEffect, useState } from 'react'
import {
    Card,
    Button,
    Form,
    Row,
    Col,
} from 'react-bootstrap'
import AppointmentCalendarSection from './AppointmentCalendarSection'
import AddPetModal from './AddPetModal'
import useAxios from '@/hooks/useAxios'
import api from '@/lib/axios'

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
    { id: 'REVISION', title: 'Revisión', variant: 'info', duration: '00:10' },
]


const AdminCreateAppointmentView = () => {
    const [draft, setDraft] = useState<AppointmentDraft>({})
    const [showPetModal, setShowPetModal] = useState(false)
    const { data, loading } = useAxios<User[]>({ method: 'get', url: 'admin/users' })
    console.log("data", data)
    const [search, setSearch] = useState('')
    const [filteredUsers, setFilteredUsers] = useState<any[]>([])
    const [selectedUser, setSelectedUser] = useState<any | null>(null)

    const [pets, setPets] = useState<any[]>([])
    const [loadingPets, setLoadingPets] = useState(false)

    const [selectedPet, setSelectedPet] = useState<any | null>(null)

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

    const loadPets = async (userId: string) => {
        setLoadingPets(true)
        setPets([])
        setSelectedPet(null)

        try {
            const res = await api.get(`/admin/pets/user/${userId}`)
            const data = res.data
            setPets(data)
        } catch (e) {
            console.error(e)
        } finally {
            setLoadingPets(false)
        }
    }


    useEffect(() => {
        if (!data) return

        const q = search.toLowerCase()

        const result = data.filter((u: any) =>
            u.name?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q)
        )

        setFilteredUsers(result)
    }, [search, data])


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

                    <Row className="g-2">
                        <Col md={6}>
                            <Form.Label>Buscar por nombre o email</Form.Label>
                            <Form.Control
                                placeholder="Escribe para buscar…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </Col>
                    </Row>

                    {search && (
                        <div className="border rounded mt-2">
                            {filteredUsers.length === 0 && (
                                <div className="p-2 text-muted">
                                    No se encontraron usuarios
                                </div>
                            )}

                            {filteredUsers.map((u) => (
                                <div
                                    key={u.id}
                                    className="p-2 border-bottom cursor-pointer hover-bg-light"
                                    onClick={() => {
                                        setSelectedUser(u)
                                        setSearch('')
                                        setFilteredUsers([])

                                        update({
                                            customerId: u.id,
                                            customerName: u.name,
                                            customerPhone: u.email,
                                        })

                                        loadPets(u.id)
                                    }}
                                >
                                    <strong>{u.name}</strong>
                                    <div className="text-muted small">{u.email}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {selectedUser && (
                        <Row className="mt-3">
                            <Col md={4}>
                                <Form.Label>Nombre</Form.Label>
                                <Form.Control value={selectedUser.name} disabled />
                            </Col>

                            <Col md={4}>
                                <Form.Label>Email</Form.Label>
                                <Form.Control value={selectedUser.email} disabled />
                            </Col>
                        </Row>
                    )}
                </Card.Body>
            </Card>


            {/* ================= MASCOTA ================= */}
            <Card className="mb-3">
                <Card.Body>
                    <Card.Title>Mascota</Card.Title>

                    {loadingPets && <div className="text-muted">Cargando mascotas…</div>}

                    {!loadingPets && pets.length === 0 && (
                        <div className="text-muted mb-2">
                            Este cliente no cuenta con mascotas aún
                        </div>
                    )}

                    {!loadingPets && pets.length > 0 && (
                        <Form.Select
                            value={draft.petId ?? ''}
                            onChange={(e) => {
                                const pet = pets.find(p => p.id === e.target.value)
                                setSelectedPet(pet)
                                update({ petId: pet.id })
                            }}
                        >
                            <option value="">Selecciona mascota</option>
                            {pets.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.name} – {p.breed}
                                </option>
                            ))}
                        </Form.Select>
                    )}

                    <div className="mt-2">
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => setShowPetModal(true)}
                            disabled={!draft.customerId}
                        >
                            + Nueva mascota
                        </Button>
                    </div>
                </Card.Body>
            </Card>

            {selectedPet && (
                <Card className="mb-3">
                    <Card.Body>
                        <Card.Title>Información de la mascota</Card.Title>

                        <Row className="g-3">
                            <Col md={4}>
                                <Form.Label>Nombre</Form.Label>
                                <Form.Control
                                    value={selectedPet.name}
                                    onChange={e =>
                                        setSelectedPet({ ...selectedPet, name: e.target.value })
                                    }
                                />
                            </Col>

                            <Col md={4}>
                                <Form.Label>Especie</Form.Label>
                                <Form.Control value={selectedPet.species} disabled />
                            </Col>

                            <Col md={4}>
                                <Form.Label>Raza</Form.Label>
                                <Form.Control value={selectedPet.breed} disabled />
                            </Col>

                            <Col md={4}>
                                <Form.Label>Sexo</Form.Label>
                                <Form.Control value={selectedPet.gender} disabled />
                            </Col>

                            <Col md={4}>
                                <Form.Label>Peso (kg)</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={selectedPet.weight ?? ''}
                                    onChange={e =>
                                        setSelectedPet({ ...selectedPet, weight: e.target.value })
                                    }
                                />
                            </Col>

                            <Col md={12}>
                                <Form.Label>Notas</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    value={selectedPet.notes ?? ''}
                                    onChange={e =>
                                        setSelectedPet({ ...selectedPet, notes: e.target.value })
                                    }
                                />
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            )}


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
