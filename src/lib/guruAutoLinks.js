import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

let gpuCache = null;

export async function getGpuLinks() {

  if (gpuCache) return gpuCache;

  const { data } = await supabase
    .from("gpus")
    .select("name,slug")
    .limit(500);

  gpuCache = data || [];

  return gpuCache;

}

export async function autoLinkGpu(text) {

  if (!text) return text;

  const gpus = await getGpuLinks();

  let output = text;

  gpus.forEach((gpu) => {

    const name = gpu.name;
    const slug = gpu.slug;

    const regex = new RegExp(`\\b${name}\\b`, "gi");

    output = output.replace(
      regex,
      `<a href="/gpu/${slug}" class="guru-link">${name}</a>`
    );

  });

  return output;

}
