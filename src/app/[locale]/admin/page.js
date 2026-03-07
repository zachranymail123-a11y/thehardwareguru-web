"use client";

import React, { useState, useEffect } from 'react';
import { 
  Rocket, 
  Settings, 
  Globe, 
  Search, 
  Database, 
  CalendarClock, 
  PenTool, 
  ShoppingCart,
  Activity,
  ServerCrash
} from 'lucide-react';

// --- BEZPEČNÉ NAČÍTÁNÍ NEXT.JS MODULŮ (PROTI PÁDU V NÁHLEDU) ---
let Link = ({ children, href, className, style, ...props }) => (
  <a href={href} className={className} style={style} {...props}>{children}</a>
);
let useParams = () => ({});
let usePathname = () => '';

try {
  const nextLink = require('next/link');
  Link = nextLink.default || nextLink;
} catch (e) {}

try {
  const nextNav = require('next/navigation');
  useParams = nextNav.useParams || useParams;
  usePathname = nextNav.usePathname || usePathname;
} catch (e) {}

export default function AdminHub() {
  const params = useParams();
  const locale = params?.locale || 'cs';
  const isEn = locale === 'en';
  
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => setTime(new Date().toLocaleTimeString(isEn ? 'en-US' : 'cs-CZ'));
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [isEn]);

  // --- GURU ADMIN MODULY ---
  const adminModules = [
    {
      category: isEn ? "CONTENT & PUBLISHING" : "OBSAH & PUBLIKOVÁNÍ",
      color: "#eab308", // Žlutá
      items: [
        {
          title: isEn ? "Content Generator" : "Generátor Obsahu",
          desc: isEn ? "Create new Articles, Tips, Tweaks and Glossary terms." : "Tvorba nových článků, tipů, tweaků a pojmů do slovníku.",
          icon: <PenTool size={32} />,
          href: `/${locale}/admin/editor`,
          status: "ONLINE"
        },
        {
          title: isEn ? "Deals Manager" : "Správce Slev",
          desc: isEn ? "Add new game deals with discount codes and affiliate links." : "Přidávání nových slev na hry se slevovými kódy a affiliate linky.",
          icon: <ShoppingCart size={32} />,
          href: `/${locale}/admin/deals`,
          status: "ONLINE"
        },
        {
          title: isEn ? "Release Planner" : "Plánovač Vydání",
          desc: isEn ? "Manage expected games, tech breakdowns and release calendar." : "Správa očekávaných her, technických rozborů a kalendáře.",
          icon: <CalendarClock size={32} />,
          href: `/${locale}/admin/planner`,
          status: "ONLINE"
        }
      ]
    },
    {
      category: isEn ? "AUTOMATION & SOCIAL" : "AUTOMATIZACE & SOCIÁLNÍ SÍTĚ",
      color: "#f97316", // Oranžová
      items: [
        {
          title: isEn ? "Social Executor (Posts)" : "Social Executor (Články)",
          desc: isEn ? "Fire latest articles and news to Discord, FB and Twitter via Make.com." : "Odstřelování nových článků a novinek na Discord a sítě přes Make.",
          icon: <Rocket size={32} />,
          href: `/${locale}/admin/executor`,
          status: "READY"
        },
        {
          title: isEn ? "Social Executor (Deals)" : "Social Executor (Slevy)",
          desc: isEn ? "Instantly share hot game deals with the community." : "Okamžité sdílení žhavých slev na hry mezi komunitu.",
          icon: <Activity size={32} />,
          href: `/${locale}/admin/executor-deals`,
          status: "READY"
        }
      ]
    },
    {
      category: isEn ? "AI & MAINTENANCE (FIXERS)" : "UMĚLÁ INTELIGENCE & ÚDRŽBA",
      color: "#66fcf1", // Tyrkysová
      items: [
        {
          title: isEn ? "EN Auto-Translator" : "EN Překladač (Fixer)",
          desc: isEn ? "Scan DB for missing english translations and fix them via API." : "Hromadné skenování databáze a automatický překlad chybějících EN textů.",
          icon: <Globe size={32} />,
          href: `/${locale}/admin/translator`,
          status: "SYSTEM ACTIVE"
        },
        {
          title: isEn ? "SEO Optimizer" : "SEO Optimalizátor",
          desc: isEn ? "Generate missing meta descriptions for better Google ranking." : "Generování chybějících meta popisků pro lepší pozice na Googlu.",
          icon: <Search size={32} />,
          href: `/${locale}/admin/seo`,
          status: "SYSTEM ACTIVE"
        },
        {
          title: isEn ? "Database Integrity" : "Integrita Databáze",
          desc: isEn ? "Direct access to Supabase structure and manual SQL interventions." : "Přímý přístup ke struktuře Supabase a manuálním SQL zásahům.",
          icon: <Database size={32} />,
          href: "https://supabase.com",
          external: true,
          status: "EXTERNAL"
        }
      ]
    }
  ];

  return (
    <div style={{ 
      minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', 
      backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px',
      fontFamily: 'sans-serif', color: '#fff'
    }}>
      
      <div className="max-w-[1200px] mx-auto px-5">
        
        {/* --- HLAVIČKA COMMAND CENTRA --- */}
        <header className="mb-16 flex flex-col md:flex-row justify-between items-center gap-8 bg-[#111318]/90 p-10 rounded-[35px] border border-purple-500/30 backdrop-blur-xl shadow-[0_20px_60px_rgba(168,85,247,0.15)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-cyan-400 to-orange-500"></div>
          
          <div className="flex items-center gap-6 z-10">
            <div className="w-20 h-20 bg-black rounded-2xl border-2 border-purple-500 flex items-center justify-center text-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.4)]">
              <Settings size={40} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter m-0 text-white">
                GURU <span className="text-purple-500">COMMAND CENTER</span>
              </h1>
              <p className="text-neutral-400 font-bold tracking-[0.2em] text-xs mt-2 uppercase">
                {isEn ? "Master Administration Dashboard" : "Hlavní řídící panel administrace"}
              </p>
            </div>
          </div>

          <div className="bg-black/50 border border-white/10 px-6 py-4 rounded-2xl flex flex-col items-end z-10">
            <span className="text-[10px] text-neutral-500 font-black uppercase tracking-widest mb-1">SYSTEM CLOCK</span>
            <span className="text-2xl font-black text-cyan-400 tracking-tighter tabular-nums">{time || "00:00:00"}</span>
          </div>
        </header>

        {/* --- MODULY / NÁSTROJE --- */}
        <div className="space-y-16">
          {adminModules.map((section, idx) => (
            <div key={idx}>
              <h2 className="text-sm font-black text-white uppercase tracking-[0.3em] mb-8 flex items-center gap-4">
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: section.color, boxShadow: `0 0 15px ${section.color}` }}></div>
                {section.category}
                <div className="flex-1 h-[1px] bg-white/5 ml-4"></div>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.items.map((item, i) => {
                  const CardContent = (
                    <div className="group relative h-full bg-[#111318]/80 border border-white/5 rounded-[24px] p-8 transition-all duration-500 hover:-translate-y-2 hover:bg-[#151820] overflow-hidden cursor-pointer"
                         style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                         onMouseEnter={(e) => { e.currentTarget.style.borderColor = section.color; e.currentTarget.style.boxShadow = `0 15px 40px ${section.color}20`; }}
                         onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)'; }}
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:opacity-10" style={{ background: section.color }}></div>
                      
                      <div className="flex justify-between items-start mb-6 relative z-10">
                        <div className="p-4 rounded-2xl bg-black border border-white/10 text-white group-hover:scale-110 transition-transform duration-500" style={{ color: section.color }}>
                          {item.icon}
                        </div>
                        <div className="text-[9px] font-black px-3 py-1 rounded-md tracking-widest border" style={{ color: section.color, borderColor: `${section.color}40`, backgroundColor: `${section.color}10` }}>
                          {item.status}
                        </div>
                      </div>

                      <div className="relative z-10">
                        <h3 className="text-xl font-black text-white uppercase tracking-tight mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(to right, #fff, ${section.color})` }}>
                          {item.title}
                        </h3>
                        <p className="text-sm text-neutral-400 leading-relaxed font-medium">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );

                  return item.external ? (
                    <a key={i} href={item.href} target="_blank" rel="noreferrer" className="block outline-none">{CardContent}</a>
                  ) : (
                    <Link key={i} href={item.href} className="block outline-none">{CardContent}</Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* --- SYSTEM WARNING / FOOTER --- */}
        <div className="mt-20 p-6 rounded-2xl bg-red-950/20 border border-red-500/20 flex items-center justify-center gap-4 text-red-500 text-xs font-black uppercase tracking-widest">
          <ServerCrash size={18} />
          {isEn ? "RESTRICTED AREA. GURU LEVEL CLEARANCE REQUIRED." : "VYHRAZENÁ ZÓNA. VYŽADOVÁNO OPRÁVNĚNÍ ÚROVNĚ GURU."}
        </div>

      </div>
    </div>
  );
}
