import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import RSSParser from 'rss-parser';

// Konfigurace z Vercel Environment Variables
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const parser = new RSSParser();

export default async function handler(req, res) {
    try {
        // 1. YouTube RSS - TheHardwareGuru_Czech
        const feed = await parser.parseURL('https://www.youtube.com/feeds/videos.xml?channel_id=UC6z869v_Y_z-Tz9_z_Y_z-T'); 
        const latestVideo = feed.items[0];

        // 2. Kontrola v Supabase (aby nebyly duplicity)
        const { data: existing } = await supabase.from('posts').select('id').eq('youtube_url', latestVideo.link).single();
        if (existing) return res.status(200).json({ message: "Vše aktuální." });

        // 3. AI Generování Článku (Žádný report!)
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{
                role: "system",
                content: "Jsi The Hardware Guru (45 let, geek). Piš česky, gaming stylem. ŽÁDNÉ SLOVO REPORT! Používej HTML tagy h2, p, ul."
            }, {
                role: "user",
                content: `Napiš článek o videu: ${latestVideo.title}. URL: ${latestVideo.link}`
            }]
        });

        const content = completion.choices[0].message.content;
        const slug = latestVideo.title.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Odstraní diakritiku
            .replace(/ /g, '-').replace(/[^\w-]+/g, '');

        // 4. Uložení do DB pro hlavní feed
        await supabase.from('posts').insert([{ title: latestVideo.title, content, youtube_url: latestVideo.link, slug }]);

        // 5. FYZICKÉ GENEROVÁNÍ STRÁNKY NA GITHUB (Včerejší stav)
        const githubToken = process.env.GITHUB_TOKEN;
        const repoOwner = 'MillisG'; // Doplněno podle screenshotu
        const repoName = 'thehardwareguru-web';
        
        const htmlPage = `<!DOCTYPE html><html lang="cs"><head><meta charset="UTF-8"><title>${latestVideo.title}</title><style>body{background:#050505;color:#eee;font-family:sans-serif;padding:40px;max-width:900px;margin:0 auto;}h1{color:#53fc18;}</style></head><body><a href="/" style="color:#53fc18"><- Zpět</a><h1>${latestVideo.title}</h1>${content}<br><br><a href="${latestVideo.link}" style="background:red;color:white;padding:15px;text-decoration:none;font-weight:bold;border-radius:5px">Sledovat na YouTube</a></body></html>`;

        const ghUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/public/clanky/${slug}.html`;
        
        // Push do GitHubu
        const ghResponse = await fetch(ghUrl, {
            method: 'PUT',
            headers: { 
                'Authorization': `token ${githubToken}`, 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({
                message: `🤖 Automatický článek: ${slug}`,
                content: Buffer.from(htmlPage).toString('base64')
            })
        });

        if (!ghResponse.ok) throw new Error(`GitHub API Error: ${ghResponse.statusText}`);

        return res.status(200).json({ message: "Článek úspěšně vytvořen v DB i na GitHubu!" });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
}