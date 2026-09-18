export interface Section {
  /** Stabilt id som används i Firestore-sökvägen – bara a–z, 0–9 och bindestreck. */
  id: string
  name: string
}

/** Sektioner/team som går att välja i dropdownen. Byt ut mot era riktiga. */
export const SECTIONS: Section[] = [
  { id: 'sektion-a', name: 'Sektion A' },
  { id: 'sektion-b', name: 'Sektion B' },
  { id: 'sektion-c', name: 'Sektion C' },
  { id: 'sektion-d', name: 'Sektion D' },
]

export const findSection = (id: string) => SECTIONS.find((s) => s.id === id)
