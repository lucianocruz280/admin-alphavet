import { useEffect, useState } from "react"
import { getBreeds, createBreed } from "@/services/catalogs"

export const useBreeds = (speciesId?: string) => {
  const [breeds, setBreeds] = useState<{ value: string; label: string }[]>([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    if (!speciesId) return
    setLoading(true)
    const data = await getBreeds(speciesId)
    setBreeds(data.map(b => ({ value: b.id, label: b.name })))
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [speciesId])

  const create = async (name: string) => {
    if (!speciesId) return
    await createBreed(name, speciesId)
    await load()
  }

  return { breeds, loading, create }
}
