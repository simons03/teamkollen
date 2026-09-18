# Teamkollen

Anonym pulsmätning för team – React, Vite, TypeScript, SCSS, Tailwind och Firestore.

## Kom igång

```bash
npm install
cp .env.example .env   # fyll i Firebase-värdena
npm run dev
```

## Struktur

- `src/config/questions.ts` – de 10 frågorna (behåll `id` stabila, de används som nycklar i Firestore)
- `src/config/sections.ts` – sektionerna i dropdownen
- `src/lib/responses.ts` – sparar svar per vecka och sektion
- `src/lib/week.ts` – beräknar ISO-veckonummer
- `src/components/GradientSlider*` – reglaget 0–100, rött → grönt (SCSS-modul)
- `src/styles/tailwind.css` – Tailwind (v4 bearbetar inte `.scss`, därför en egen CSS-fil)
- `firestore.rules` – tillåter bara att anonyma svar skapas, ingen läsning från klienten

## Datamodell

Svaren sparas per ISO-vecka och sektion:

```
weeks/{2026-W38}                                     { year, week }
weeks/{2026-W38}/sections/{sektion-a}                { sectionId, name, year, week }
weeks/{2026-W38}/sections/{sektion-a}/responses/{id} { answers: { q1..q10: 0–100 }, createdAt }
```

## Driftsättning

Sidan hostas på Vercel. Lägg in alla `VITE_FIREBASE_*`-variabler från `.env` under
Project Settings → Environment Variables i Vercel.

Firestore-reglerna publiceras separat:

```bash
firebase deploy --only firestore:rules
```
