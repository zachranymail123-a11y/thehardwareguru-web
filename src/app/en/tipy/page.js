"use client";

/**
 * GURU EN PROXY: Tipy
 * Tento soubor zajišťuje, že adresa /en/tipy funguje.
 * Načítá hlavní komponentu, která díky usePathname() automaticky přepne texty do angličtiny.
 */
import TipyArchivePage from '../../tipy/page';

export default function EnglishTipsPage() {
  return <TipyArchivePage />;
}
