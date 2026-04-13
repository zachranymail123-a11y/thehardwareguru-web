import React from 'react';
import PsuClient from '../../psu-kalkulacka/PsuClient';

export const revalidate = 3600;

export const metadata = {
    title: 'PSU Calculator | What Power Supply Do I Need? | The Hardware Guru',
    description: 'Calculate exactly what Power Supply Unit (PSU) you need for your PC build based on CPU and GPU TDP.',
    alternates: {
        canonical: 'https://thehardwareguru.cz/en/psu-calculator',
        languages: { 
            'cs': 'https://thehardwareguru.cz/psu-kalkulacka', 
            'en': 'https://thehardwareguru.cz/en/psu-calculator' 
        }
    }
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

async function fetchHwData() {
    if (!supabaseUrl) return { cpus: [], gpus: [] };
    const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
    
    try {
        const [cpuRes, gpuRes] = await Promise.all([
            fetch(`${supabaseUrl}/rest/v1/cpus?select=id,name,tdp_w&order=name.asc`, { headers, next: { revalidate: 3600 } }),
            fetch(`${supabaseUrl}/rest/v1/gpus?select=id,name,tdp_w&order=name.asc`, { headers, next: { revalidate: 3600 } })
        ]);
        
        const cpus = cpuRes.ok ? await cpuRes.json() : [];
        const gpus = gpuRes.ok ? await gpuRes.json() : [];
        return { cpus, gpus };
    } catch (e) {
        return { cpus: [], gpus: [] };
    }
}

export default async function PsuCalculatorEnPage() {
    const { cpus, gpus } = await fetchHwData();
    // Předáváme data do stejné klientské komponenty, ale s isEn=true
    return <PsuClient cpus={cpus} gpus={gpus} isEn={true} />;
}
