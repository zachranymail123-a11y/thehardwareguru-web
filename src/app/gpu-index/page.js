"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function GpuIndexPage() {

const pathname = usePathname();
const isEn = pathname.startsWith("/en");

const gpus = [
"rtx-4090","rtx-4080","rtx-4070","rtx-4060",
"rx-7900-xtx","rx-7900-xt","rx-7800-xt","rx-7700-xt","rx-7600"
];

return (
<div style={globalStyles}>

<header style={header}>
<h1 style={title}>
{isEn ? <>GPU <span style={{color:"#a855f7"}}>INDEX</span></> : <>INDEX <span style={{color:"#a855f7"}}>GPU</span></>}
</h1>
</header>

<main style={main}>
<div style={grid}>

{gpus.map(gpu=>(
<Link key={gpu} href={`/gpu/${gpu}`} style={{textDecoration:"none"}}>
<div className="game-card" style={card}>
<h3 style={cardTitle}>{gpu.toUpperCase()}</h3>
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
