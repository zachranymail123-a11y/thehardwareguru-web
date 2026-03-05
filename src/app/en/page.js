"use client";

// GURU FIX: Importujeme již hotovou komponentu z hlavní stránky.
// Tím pádem udržujeme jen jeden hlavní kód a vyhneme se duplicitám.
import HomePage from '../page';

export default function EnglishHomePage() {
  return <HomePage />;
}
