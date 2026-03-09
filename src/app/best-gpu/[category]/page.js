import { createClient } from '@supabase/supabase-js';

export const revalidate = 86400;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const normalizeName = (name = '') =>
  name.replace(/NVIDIA |AMD |GeForce |Radeon /gi, '');

export async function generateMetadata({ params }) {

  const category = params.category;

  return {
    title: `Best GPU for ${category.replace('-', ' ')} | The Hardware Guru`,
    description: `Top graphics cards for ${category.replace('-', ' ')} gaming performance.`,
    alternates: {
      canonical: `https://thehardwareguru.cz/best-gpu/${category}`
    }
  };

}

export default async function BestGpuPage({ params }) {

  const category = params.category;

  const { data: gpus } = await supabase
    .from('gpus')
    .select('*')
    .order('performance_index', { ascending: false })
    .limit(20);

  if (!gpus) return null;

  return (

    <div style={{
      minHeight:'100vh',
      background:'#0a0b0d',
      paddingTop:'120px',
      paddingBottom:'100px',
      color:'#fff'
    }}>

      <main style={{
        maxWidth:'1000px',
        margin:'0 auto',
        padding:'0 20px'
      }}>

        <header style={{textAlign:'center',marginBottom:'60px'}}>

          <h1 style={{
            fontSize:'clamp(2rem,5vw,3rem)',
            fontWeight:'900',
            textTransform:'uppercase'
          }}>

            Best GPU for {category.replace('-', ' ')}

          </h1>

          <p style={{color:'#9ca3af',marginTop:'20px'}}>

            Ranked graphics cards based on gaming performance and value.

          </p>

        </header>

        <section>

          <div style={{
            display:'grid',
            gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',
            gap:'20px'
          }}>

            {gpus.map((gpu,i)=>{

              const name = normalizeName(gpu.name);

              return (

                <a
                  key={gpu.slug}
                  href={`/gpu/${gpu.slug}`}
                  className="similar-link-card"
                >

                  <div style={{
                    fontSize:'12px',
                    color:'#9ca3af'
                  }}>

                    #{i+1}

                  </div>

                  <h3 style={{
                    fontSize:'18px',
                    fontWeight:'900'
                  }}>
                    {name}
                  </h3>

                  <div style={{
                    color:'#66fcf1',
                    fontSize:'13px'
                  }}>

                    Performance index: {gpu.performance_index}

                  </div>

                </a>

              )

            })}

          </div>

        </section>

      </main>

    </div>

  )

}
