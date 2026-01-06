const API = "https://alphavet-api-142774451984.us-central1.run.app"

export type CatalogItem = {
  id: string
  name: string
}

export const getSpecies = async (): Promise<CatalogItem[]> => {
  const res = await fetch(`${API}/catalogs/species`)
  const json = await res.json()
  return json.data
}

export const getBreeds = async (speciesId: string): Promise<CatalogItem[]> => {
  const res = await fetch(`${API}/catalogs/breeds?speciesId=${speciesId}`)
  const json = await res.json()
  return json.data
}

export const createSpecies = async (name: string) => {
  await fetch(`${API}/catalogs/species`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  })
}

export const createBreed = async (name: string, speciesId: string) => {
  await fetch(`${API}/catalogs/breeds`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, speciesId }),
  })
}
