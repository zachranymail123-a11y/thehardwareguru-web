import React from 'react';
import { notFound } from 'next/navigation';
import GpuFpsHunterPage from '../../../gpu-fps/[slug]/[game]/page'; // Importujeme logiku z hlavní složky

export default async function GpuFpsHunterEnPage(props) {
    // Přidáme příznak isEnProxy, aby hlavní komponenta věděla, že má mluvit anglicky
    return <GpuFpsHunterPage {...props} isEnProxy={true} />;
}
