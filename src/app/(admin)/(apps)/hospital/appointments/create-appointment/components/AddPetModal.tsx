'use client'

import api from '@/lib/axios'
import { useEffect, useState } from 'react'
import {
    Modal,
    Button,
    Form,
    Row,
    Col,
    Collapse,
} from 'react-bootstrap'

type Props = {
    show: boolean
    onClose: () => void
    onCreated: (pet: { id: string; name: string }) => void
    customerId: string
}


type Species = { id: string; name: string }
type Breed = { id: string; name: string }


const genderOptions = [
    { value: '', label: 'Selecciona...' },
    { value: 'male', label: 'Macho' },
    { value: 'female', label: 'Hembra' },
]

const AddPetModal = ({ show, onClose, onCreated, customerId }: Props) => {
    const [saving, setSaving] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [species, setSpecies] = useState<Species[]>([])
    const [breeds, setBreeds] = useState<Breed[]>([])
    const [speciesId, setSpeciesId] = useState('')
    const [speciesName, setSpeciesName] = useState('')
    const [breedId, setBreedId] = useState('')
    const [breedName, setBreedName] = useState('')
    const [showNewSpecies, setShowNewSpecies] = useState(false)
    const [newSpeciesName, setNewSpeciesName] = useState('')
    const [showNewBreed, setShowNewBreed] = useState(false)
    const [newBreedName, setNewBreedName] = useState('')

    const [form, setForm] = useState({
        name: '',
        speciesId: '',
        speciesName: '',
        breedId: '',
        breedName: '',
        gender: '',
        birthDate: '',
        weight: '',
        color: '',
        microchip: '',
        notes: '',
    })

    const update = (key: string, value: any) =>
        setForm(prev => ({ ...prev, [key]: value }))

    useEffect(() => {
        if (!show) {
            setForm({
                name: '',
                speciesId: '',
                speciesName: '',
                breedId: '',
                breedName: '',
                gender: '',
                birthDate: '',
                weight: '',
                color: '',
                microchip: '',
                notes: '',
            })
            setErrors({})
        }
    }, [show])

    const validate = () => {
        const e: Record<string, string> = {}
        if (!form.name) e.name = 'Requerido'
        if (!form.speciesName) e.species = 'Requerido'
        if (!form.breedName) e.breed = 'Requerido'
        if (!form.gender) e.gender = 'Requerido'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSave = async () => {
        if (!validate()) return
        setSaving(true)

        try {

            await api.post('/pets', {
                name: form.name,
                species: speciesName,
                breed: breedName,
                gender: form.gender,
                birthDate: form.birthDate || null,
                weight: form.weight ? Number(form.weight) : null,
                color: form.color || null,
                microchip: form.microchip || null,
                notes: form.notes || null,
            })

            const fakePet = {
                id: crypto.randomUUID(),
                name: form.name,
            }

            onCreated(fakePet)
            onClose()
        } catch (e) {
            console.error(e)
        } finally {
            setSaving(false)
        }
    }

    useEffect(() => {
        if (show) {
            loadSpecies()
        }
    }, [show])

    const loadSpecies = async () => {
        try {
            const res = await api.get('/species')
            setSpecies(res.data.data ?? res.data)
        } catch (e) {
            console.error('Error loading species', e)
        }
    }

    const loadBreeds = async (speciesId: string) => {
        try {
            setBreeds([])
            const res = await api.get(`/breeds?speciesId=${speciesId}`)
            setBreeds(res.data.data ?? res.data)
        } catch (e) {
            console.error('Error loading breeds', e)
        }
    }


    return (
        <Modal show={show} onHide={onClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Agregar mascota</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form>
                    <Row className="g-3">

                        <Col md={6}>
                            <Form.Label>Nombre *</Form.Label>
                            <Form.Control
                                isInvalid={!!errors.name}
                                value={form.name}
                                onChange={e => update('name', e.target.value)}
                            />
                        </Col>

                        <Col md={6}>
                            <Form.Label>Sexo *</Form.Label>
                            <Form.Select
                                isInvalid={!!errors.gender}
                                value={form.gender}
                                onChange={e => update('gender', e.target.value)}
                            >
                                {genderOptions.map(o => (
                                    <option key={o.value} value={o.value}>
                                        {o.label}
                                    </option>
                                ))}
                            </Form.Select>
                        </Col>

                        <Form.Group>
                            <Form.Label>Especie *</Form.Label>

                            <Form.Select
                                value={speciesId}
                                isInvalid={!!errors.species}
                                onChange={(e) => {
                                    const value = e.target.value
                                    if (value === '__new__') {
                                        setShowNewSpecies(true)
                                        return
                                    }

                                    const selected = species.find(s => s.id === value)
                                    setSpeciesId(value)
                                    setSpeciesName(selected?.name || '')
                                    setBreedId('')
                                    setBreedName('')
                                    setBreeds([])
                                    loadBreeds(value)
                                }}
                            >
                                <option value="">Selecciona especie</option>
                                {species.map(s => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                                <option value="__new__">+ Agregar nueva especie</option>
                            </Form.Select>

                            <Form.Control.Feedback type="invalid">
                                {errors.species}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Collapse in={showNewSpecies} className='space-x-4'>
                            <div className="mt-2 p-3 border rounded bg-light">
                                <Form.Label>Nueva especie</Form.Label>

                                <div className="d-flex gap-2">
                                    <Form.Control
                                        placeholder="Ej. Perro"
                                        value={newSpeciesName}
                                        onChange={e => setNewSpeciesName(e.target.value)}
                                    />

                                    <Button
                                        size="sm"
                                        onClick={async () => {
                                            if (!newSpeciesName) return

                                            // POST /species
                                            const res = await api.post('/species', { name: newSpeciesName })

                                            const created = res.data
                                            setSpecies(prev => [...prev, created])
                                            setSpeciesId(created.id)
                                            setSpeciesName(created.name)

                                            setNewSpeciesName('')
                                            setShowNewSpecies(false)
                                        }}
                                    >
                                        Guardar
                                    </Button>

                                    <Button
                                        size="sm"
                                        variant="outline-secondary"
                                        onClick={() => {
                                            setShowNewSpecies(false)
                                            setNewSpeciesName('')
                                        }}
                                    >
                                        Cancelar
                                    </Button>
                                </div>
                            </div>
                        </Collapse>

                        <Form.Group>
                            <Form.Label>Raza *</Form.Label>

                            <Form.Select
                                value={breedId}
                                disabled={!speciesId}
                                isInvalid={!!errors.breed}
                                onChange={(e) => {
                                    const value = e.target.value
                                    if (value === '__new__') {
                                        setShowNewBreed(true)
                                        return
                                    }

                                    const selected = breeds.find(b => b.id === value)
                                    setBreedId(value)
                                    setBreedName(selected?.name || '')
                                }}
                            >
                                <option value="">
                                    {speciesId ? 'Selecciona raza' : 'Selecciona especie primero'}
                                </option>

                                {breeds.map(b => (
                                    <option key={b.id} value={b.id}>
                                        {b.name}
                                    </option>
                                ))}

                                {speciesId && (
                                    <option value="__new__">+ Agregar nueva raza</option>
                                )}
                            </Form.Select>

                            <Form.Control.Feedback type="invalid">
                                {errors.breed}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Collapse in={showNewBreed}>
                            <div className="mt-2 p-3 border rounded bg-light">
                                <Form.Label>Nueva raza</Form.Label>

                                <div className="d-flex gap-2">
                                    <Form.Control
                                        placeholder="Ej. Labrador"
                                        value={newBreedName}
                                        onChange={e => setNewBreedName(e.target.value)}
                                    />

                                    <Button
                                        size="sm"
                                        onClick={async () => {
                                            if (!newBreedName || !speciesId) return

                                            const res = await api.post('/breeds', {
                                                name: newBreedName,
                                                speciesId,
                                            })

                                            const created = res.data
                                            setBreeds(prev => [...prev, created])
                                            setBreedId(created.id)
                                            setBreedName(created.name)

                                            setNewBreedName('')
                                            setShowNewBreed(false)
                                        }}
                                    >
                                        Guardar
                                    </Button>

                                    <Button
                                        size="sm"
                                        variant="outline-secondary"
                                        onClick={() => {
                                            setShowNewBreed(false)
                                            setNewBreedName('')
                                        }}
                                    >
                                        Cancelar
                                    </Button>
                                </div>
                            </div>
                        </Collapse>

                        <Col md={6}>
                            <Form.Label>Fecha de nacimiento</Form.Label>
                            <Form.Control
                                type="date"
                                value={form.birthDate}
                                onChange={e => update('birthDate', e.target.value)}
                            />
                        </Col>

                        <Col md={6}>
                            <Form.Label>Peso (kg)</Form.Label>
                            <Form.Control
                                type="number"
                                step="0.1"
                                value={form.weight}
                                onChange={e => update('weight', e.target.value)}
                            />
                        </Col>

                        <Col md={6}>
                            <Form.Label>Color / señas</Form.Label>
                            <Form.Control
                                value={form.color}
                                onChange={e => update('color', e.target.value)}
                            />
                        </Col>

                        <Col md={6}>
                            <Form.Label>Microchip</Form.Label>
                            <Form.Control
                                value={form.microchip}
                                onChange={e => update('microchip', e.target.value)}
                            />
                        </Col>

                        <Col md={12}>
                            <Form.Label>Notas</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={form.notes}
                                onChange={e => update('notes', e.target.value)}
                            />
                        </Col>

                    </Row>
                </Form>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Cancelar
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? 'Guardando…' : 'Guardar mascota'}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default AddPetModal
