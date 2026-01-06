'use client'

import { useBreeds } from '@/hooks/useBreeds'
import { useSpecies } from '@/hooks/useSpecies'
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

const genderOptions = [
    { value: '', label: 'Selecciona...' },
    { value: 'male', label: 'Macho' },
    { value: 'female', label: 'Hembra' },
]

const AddPetModal = ({ show, onClose, onCreated, customerId }: Props) => {
    const [saving, setSaving] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [speciesId, setSpeciesId] = useState('')
    const [speciesName, setSpeciesName] = useState('')
    const [breedId, setBreedId] = useState('')
    const [breedName, setBreedName] = useState('')
    const [showNewSpecies, setShowNewSpecies] = useState(false)
    const [newSpeciesName, setNewSpeciesName] = useState('')
    const [showNewBreed, setShowNewBreed] = useState(false)
    const [newBreedName, setNewBreedName] = useState('')
    const { species, loading: speciesLoading, create: createSpecies } = useSpecies()
    const { breeds, loading: breedsLoading, create: createBreed } = useBreeds(speciesId)
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

                                    const selected = species.find((s) => s.value === value)
                                    setSpeciesId(value)
                                    setSpeciesName(selected?.label || '')
                                    update('speciesId', value)
                                    update('speciesName', selected?.label || '')
                                    setBreedId('')
                                    setBreedName('')
                                    update('breedId', '')
                                    update('breedName', '')
                                }}
                            >
                                <option value="">Selecciona especie</option>
                                {species.map(s => (
                                    <option key={s.value} value={s.value}>
                                        {s.label}
                                    </option>
                                ))}
                                <option value="__new__">+ Agregar nueva especie</option>
                            </Form.Select>

                            <Form.Control.Feedback type="invalid">
                                {errors.species}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Collapse in={showNewSpecies}>
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

                                            await createSpecies(newSpeciesName)
                                            const created = species.find(
                                                s => s.label.toLowerCase() === newSpeciesName.toLowerCase()
                                            )

                                            if (created) {
                                                setSpeciesId(created.value)
                                                setSpeciesName(created.label)

                                                update('speciesId', created.value)
                                                update('speciesName', created.label)
                                            }

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

                                    const selected = breeds.find(b => b.value === value)

                                    setBreedId(value)
                                    setBreedName(selected?.label || '')

                                    update('breedId', value)
                                    update('breedName', selected?.label || '')
                                }}
                            >
                                <option value="">
                                    {speciesId ? 'Selecciona raza' : 'Selecciona especie primero'}
                                </option>

                                {breeds.map(b => (
                                    <option key={b.value} value={b.value}>
                                        {b.label}
                                    </option>
                                ))}

                                {speciesId && <option value="__new__">+ Agregar nueva raza</option>}
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

                                            await createBreed(newBreedName)

                                            const created = breeds.find(
                                                b => b.label.toLowerCase() === newBreedName.toLowerCase()
                                            )

                                            if (created) {
                                                setBreedId(created.value)
                                                setBreedName(created.label)

                                                update('breedId', created.value)
                                                update('breedName', created.label)
                                            }

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
