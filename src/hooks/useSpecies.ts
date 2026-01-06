import { useEffect, useState } from "react"
import { getSpecies, createSpecies } from "@/services/catalogs"

export const useSpecies = () => {
  const [species, setSpecies] = useState<{ value: string; label: string }[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const data = await getSpecies()
    setSpecies(data.map(s => ({ value: s.id, label: s.name })))
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const create = async (name: string) => {
    await createSpecies(name)
    await load()
  }

  return { species, loading, create }
}
