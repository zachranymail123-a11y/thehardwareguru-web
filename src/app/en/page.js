"use client";

/**
 * GURU PROXY ENGINE
 * Tento soubor slouží jako vstupní bod pro anglickou verzi archivu článků.
 * Načítá hlavní komponentu ze src/app/clanky/page.js, která se sama 
 * postará o překlad na základě URL.
 */
import ClankyArchivePage from '../../clanky/page';

export default function EnglishClankyPage() {
  return <ClankyArchivePage />;
}
