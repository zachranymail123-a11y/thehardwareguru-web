"use client";

/**
 * GURU FIX: Anglická hlavní stránka
 * Oprava chyby "Module not found": Importujeme pouze HomePage z nadřazené složky.
 */
import HomePage from '../page';

export default function EnglishHomePage() {
  return <HomePage />;
}
