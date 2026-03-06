"use client";

/**
 * GURU EN PROXY: Tweaky
 * Tento soubor zajišťuje, že adresa /en/tweaky fyzicky existuje a je přístupná.
 * Importuje hlavní komponentu archivu, která si sama detekuje /en v URL.
 */
import TweaksArchivePage from '../../tweaky/page';

export default function EnglishTweaksPage() {
  return <TweaksArchivePage />;
}
