import React from 'react';
import GpuFpsHunterPage from '../../../../gpu-fps/[slug]/[game]/page'; // 🔥 Opravená cesta k hlavní komponentě

/**
 * GURU FPS EN PROXY - V1.1
 * 🚀 CÍL: Přesměrování na hlavní komponentu s příznakem angličtiny bez 404.
 */

export default async function GpuFpsHunterEnPage(props) {
    // Předáme všechny props (params, searchParams) a přidáme isEnProxy
    return <GpuFpsHunterPage {...props} isEnProxy={true} />;
}
