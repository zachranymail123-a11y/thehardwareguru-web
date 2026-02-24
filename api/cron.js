import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import RSSParser from 'rss-parser';

// Inicializace Supabase a OpenAI
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const parser = new RSSParser();

export default async function handler(req, res) {
    try {
        console.log("🚀 Startuju autopilota...");

        // 1. Načtení nejnovějšího videa z YouTube RSS
        const feed = await parser.parseURL('https://www.youtube.com/feeds/videos.xml?channel_id=UC6z869v_Y_z-Tz9_z_Y_z-T'); 
        const latestVideo = feed.items[0];

        if (!latestVideo) throw new Error("Nepodařilo se načíst RSS feed.");

        // 2. Kontrola, jestli už video v databázi náhodou není
        const { data: existing } = await supabase.from('posts').select('id').eq('youtube_url', latestVideo.link).single();
        if (existing) {
            return res.status(200).json({ message: "Vše aktuální, žádné nové video k zpracování." });
        }

        // 3. Generování obsahu přes OpenAI (Geek styl)
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "Jsi The Hardware Guru. Piš v HTML, buď geek, používej emoji. ŽÁDNÉ SLOVO REPORT ani SHRNUTÍ!" }, 
                { role: "user", content: `Vytvoř článek o tomto videu: ${latestVideo.title}` }
            ]
        });

        const content = completion.choices[0].message.content;
        const slug = latestVideo.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ /g, '-').replace(/[^\w-]+/g, '');

        // 4. Uložení do Supabase databáze
        const { error: dbError } = await supabase.from('posts').insert([
            { title: latestVideo.title, content, youtube_url: latestVideo.link, slug }
        ]);
        if (dbError) throw new Error(`Chyba Supabase: ${dbError.message}`);

        // 5. NASTAVENÍ PRO GITHUB PUSH (Tady se láme chleba!)
        const githubToken = process.env.GITHUB_TOKEN;
        const repoOwner = 'zachranymail123-a11y'; // Tvůj nick
        const repoName = 'thehardwareguru-web';   // Tvůj repozitář
        
        const htmlPage = `
        <!DOCTYPE html>
        <html lang="cs">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${latestVideo.title}</title>
            <style>
                body { background: #050505; color: #eee; font-family: sans-serif; padding: 40px; line-height: 1.6; max-width: 800px; margin: 0 auto; }
                h1 { color: #53fc18; border-bottom: 2px solid #53fc18; padding-bottom: 10px; }
                a { color: #53fc18; text-decoration: none; font-weight: bold; }
                .yt-btn { display: inline-block; background: #ff0000; color: white; padding: 10px 20px; border-radius: 5px; margin-top: 20px; }
            </style>
        </head>
        <body>
            <a href="/">← Zpět na web</a>
            <h1>${latestVideo.title}</h1>
            <div class="content">${content}</div>
            <a href="${latestVideo.link}" class="yt-btn" target="_blank">Sledovat na YouTube</a>
        </body>
        </html>`;

        const ghUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/public/clanky/${slug}.html`;
        
        const ghResponse = await fetch(ghUrl, {
            method: 'PUT',
            headers: { 
                'Authorization': `token ${githubToken}`, 
                'Content-Type': 'application/json',
                'User-Agent': 'Vercel-Serverless-Function'
            },
            body: JSON.stringify({
                message: `🤖 Automatický článek: ${slug}`,
                content: Buffer.from(htmlPage).toString('base64')
            })
        });

        if (!ghResponse.ok) {
            const errorData = await ghResponse.json();
            return res.status(ghResponse.status).json({ 
                error: `GitHub API Error: ${errorData.message}`,
                details: "Zkontroluj, zda má tvůj token 'ghp_' práva pro zápis (repo)!" 
            });
        }

        return res.status(200).json({ message: "🔥 ÚSPĚCH! Článek je v DB i na GitHubu." });

    } catch (err) {
        console.error("❌ CRITICAL ERROR:", err.message);
        return res.status(500).json({ error: err.message });
    }
}