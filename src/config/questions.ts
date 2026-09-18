export interface Question {
  /** Stabilt id som används som nyckel i Firestore – ändra inte i efterhand. */
  id: string
  text: string
}

export const QUESTIONS: Question[] = [
  { id: 'q1', text: 'Hur mår du just nu?' },
  { id: 'q2', text: 'Hur tydliga är teamets mål för dig?' },
  { id: 'q3', text: 'Hur väl tycker du att ni når era mål?' },
  { id: 'q4', text: 'Hur rimlig är din arbetsbelastning?' },
  { id: 'q5', text: 'Hur väl fungerar samarbetet i teamet?' },
  { id: 'q6', text: 'Hur trygg känner du dig att säga vad du tycker?' },
  { id: 'q7', text: 'Hur motiverad känner du dig i ditt arbete?' },
  { id: 'q8', text: 'Hur väl fungerar kommunikationen i teamet?' },
  { id: 'q9', text: 'Hur bra är balansen mellan arbete och fritid?' },
  { id: 'q10', text: 'Hur nöjd är du med din arbetssituation överlag?' },
]

export const DEFAULT_VALUE = 50
