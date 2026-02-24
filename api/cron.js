import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import RSSParser from 'rss-parser';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const parser = new RSSParser();

export default async function handler(req, res) {
    try {
        // 1. YouTube RSS
        const feed = await parser.parseURL('https://www.youtube.com/feeds/videos.xml?channel_id=UC6z869v_Y_z-Tz9_z_Y_z-T'); 
        const latestVideo = feed.items[0];

        // 2. Kontrola DB
        const { data: existing } = await supabase.from('posts').select('id').eq('youtube_url', latestVideo.link).single();
        if (existing) return res.status(200).json({ message: "Zatím žádné nové video." });

        // 3. AI Obsah
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "system", content: "Jsi The Hardware Guru. Piš v HTML. ŽÁDNÉ SLOVO REPORT!" }, 
                       { role: "user", content: `Napiš článek o: ${latestVideo.title}` }]
        });

        const content = completion.choices[0].message.content;
        const slug = latestVideo.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ /g, '-').replace(/[^\w-]+/g, '');

        // 4. Supabase
        await supabase.from('posts').insert([{ title: latestVideo.title, content, youtube_url: latestVideo.link, slug }]);

        // 5. GITHUB PUSH - Tady to nejvíc hlídáme
        const githubToken = process.env.GITHUB_TOKEN;
        const repoOwner = 'zachranymail123-a11y'; 
        const repoName = 'thehardwareguru-web';
        
        const htmlPage = `<!DOCTYPE html><html lang="cs"><head><meta charset="UTF-8"><style>body{background:#050505;color:#eee;font-family:sans-serif;padding:40px;}</style></head><body><h1>${latestVideo.title}</h1>${content}</body></html>`;
        
        const ghUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/public/clanky/${slug}.html`;
        
        const ghResponse = await fetch(ghUrl, {
            method: 'PUT',
            headers: { 
                'Authorization': `token ${githubToken}`, 
                'Content-Type': 'application/json',
                'User-Agent': 'Vercel-Cron'
            },
            body: JSON.stringify({
                message: `🤖 Automat: ${slug}`,
                content: Buffer.from(htmlPage).toString('base64')
            })
        });

        if (!ghResponse.ok) {
            const errorData = await ghResponse.json();
            // Tady uvidíme, jestli je v URL nebo v Tokenu bota
            return res.status(ghResponse.status).json({ 
                error: `GitHub: ${errorData.message}`,
                zkousena_url: ghUrl,
                zacatek_tokenu: githubToken ? githubToken.substring(0, 7) : "CHYBI"
            });
        }

        return res.status(200).json({ message: "Hotovo! Článek je na webu i v repu." });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}