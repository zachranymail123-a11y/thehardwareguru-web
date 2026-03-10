"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function GameIndexPage(){

const pathname=usePathname();
const isEn=pathname.startsWith("/en");

const games=[
"cyberpunk-2077","warzone","starfield","fortnite",
"cs2","gta-5","witcher-3","red-dead-redemption-2",
"baldurs-gate-3","hogwarts-legacy","forza-horizon-5"
];

return(
<div style={globalStyles}>

<header style={header}>
<h1 style={title}>
{isEn ? <>GAME <span style={{color:"#a855f7"}}>INDEX</span></> : <>INDEX <span style={{color:"#a855f7"}}>HER</span></>}
</h1>
</header>

<main style={main}>
<div style={grid}>

{games.map(game=>(
<Link key={game} href={`/game-benchmarks/${game}`} style={{textDecoration:"none"}}>
<div className="game-card" style={card}>
<h3 style={cardTitle}>{game.replaceAll("-"," ").toUpperCase()}</h3>
</div>
</Link>
))}

</div>
</main>

<style>{cardCss}</style>

</div>
);
}

const header={maxWidth:"800px",margin:"20px auto 40px",textAlign:"center",padding:"0 20px"};
const title={fontSize:"clamp(32px,5vw,56px)",fontWeight:"900",textTransform:"uppercase",letterSpacing:"2px"};
const main={maxWidth:"1200px",margin:"0 auto 80px",padding:"0 20px"};
const grid={display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",gap:"30px"};

const card={borderRadius:"12px",padding:"40px",textAlign:"center",background:"rgba(17,19,24,0.85)",border:"1px solid rgba(168,85,247,0.2)"};
const cardTitle={color:"#fff",fontSize:"1.4rem",fontWeight:"bold"};

const globalStyles={
minHeight:"100vh",
backgroundColor:"#0a0b0d",
color:"#fff",
backgroundImage:'url("/bg-guru.png")',
backgroundSize:"cover",
backgroundAttachment:"fixed"
};

const cardCss=`
.game-card{transition:all .3s cubic-bezier(.4,0,.2,1)}
.game-card:hover{
transform:translateY(-8px);
box-shadow:0 0 30px rgba(168,85,247,.3);
border-color:#a855f7;
}
`;
