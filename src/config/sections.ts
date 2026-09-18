export interface Section {
  /** Stabilt id som används i Firestore-sökvägen – bara a–z, 0–9 och bindestreck. */
  id: string
  name: string
  /** Visas i dropdownen men går inte att välja. */
  disabled?: boolean
}

/** Sektioner/team som går att välja i dropdownen. Byt ut mot era riktiga. */
export const SECTIONS: Section[] = [
  { id: 'webb-och-verktyg', name: 'Webb och verktyg' },
  { id: 'designsystem', name: 'Designsystem' },
  { id: 'externwebb', name: 'Externwebb' },
  { id: 'sektion-d', name: 'Sektion D', disabled: true },
]

export const findSection = (id: string) => SECTIONS.find((s) => s.id === id && !s.disabled)
