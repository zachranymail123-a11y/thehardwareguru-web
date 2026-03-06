"use client";

/**
 * GURU EN PROXY: Praktické Rady (Guides)
 * Tento soubor zajišťuje existenci routy /en/rady.
 * Importuje hlavní komponentu archivu, která si sama detekuje /en v URL
 * a podle toho servíruje anglický obsah a data z databáze.
 */
import GuidesArchivePage from '../../rady/page';

export default function EnglishGuidesPage() {
  return <GuidesArchivePage />;
}
