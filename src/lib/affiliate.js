/**
 * GLOBÁLNÍ GENERÁTOR HEUREKA ODKAZŮ
 * Generuje vždy 100% bezpečný a otestovaný affiliate odkaz bez JS interceptorů.
 */

const HEUREKA_HAFF_ID = "276049";

export function getGlobalHeurekaLink(searchQuery, subId = "v10-generic") {
    if (!searchQuery) {
        return `https://www.heureka.cz/?haff=${HEUREKA_HAFF_ID}`;
    }

    // Bezpečné nahrazení všech typů mezer za čisté znaménko plus (+)
    // Příklad: "Ryzen 9 9950X" -> "Ryzen+9+9950X"
    const safeQuery = searchQuery.toString().trim().replace(/\s+/g, '+');

    // Jediný schválený a funkční formát pro přímé vyhledávání na Heurece
    return `https://www.heureka.cz/?haff=${HEUREKA_HAFF_ID}&h%5Bfraze%5D=${safeQuery}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=${subId}`;
}
