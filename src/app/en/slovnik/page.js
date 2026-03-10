/**
 * GURU MASTER PROXY: Archiv Slovníku (EN)
 * GURU FIX: Aktivace cesty /en/slovnik pro anglickou mutaci.
 * Tento soubor zajišťuje, že Next.js správně zaregistruje anglickou routu,
 * zatímco veškerou logiku a design obstarává hlavní soubor v /slovnik/page.js.
 * * Díky tomu, že hlavní soubor používá 'usePathname', automaticky rozpozná, 
 * že je volán z této (/en) složky a přepne obsah do angličtiny.
 */
export { default } from '../../slovnik/page';
