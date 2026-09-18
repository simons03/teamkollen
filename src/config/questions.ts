export interface ScaleLabels {
  /** Text vid 0 (röd ände). */
  low: string
  /** Text vid 100 (grön ände). */
  high: string
}

export interface Question {
  /** Stabilt id som används som nyckel i Firestore – ändra inte i efterhand. */
  id: string
  text: string
  /** Egna etiketter för skalan. Utan dem används AGREE_LABELS. */
  labels?: ScaleLabels
}

/** Standard för påståenden: 0 = stämmer inte alls, 100 = stämmer helt. */
export const AGREE_LABELS: ScaleLabels = { low: 'Stämmer inte alls', high: 'Stämmer helt' }

const LEVEL_LABELS: ScaleLabels = { low: 'Mycket låg', high: 'Mycket hög' }

export const QUESTIONS: Question[] = [
  { id: 'q1', text: 'Jag har förutsättningar och kompetens för att lösa mina uppdrag och mål' },
  { id: 'q2', text: 'Jag har en arbetssituation i balans utifrån arbetsbelastning och återhämtning' },
  { id: 'q3', text: 'Min arbetsbelastning är hanterbar' },
  { id: 'q4', text: 'Vi arbetar med rätt frågor' },
  { id: 'q5', text: 'Jag vet åt vilket håll vårt arbete är på väg' },
  { id: 'q6', text: 'Jag tycker det är roligt att gå till jobbet' },
  {
    id: 'q7',
    text: 'Så här stressad känner jag mig just nu',
    // Omvänd fråga: grönt ska betyda bra, alltså lite stress.
    labels: { low: 'Mycket stressad', high: 'Inte alls stressad' },
  },
  { id: 'q8', text: 'Så här stor är min arbetsglädje just nu', labels: LEVEL_LABELS },
  { id: 'q9', text: 'Så här uppskattad känner jag mig på jobbet just nu', labels: LEVEL_LABELS },
  { id: 'q10', text: 'Så här trygg känner jag mig på jobbet just nu', labels: LEVEL_LABELS },
]

export const DEFAULT_VALUE = 50
