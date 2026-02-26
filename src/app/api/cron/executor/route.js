// 1. NAJDEME ÚKOL (S POŘÁDNÝM LOGOVÁNÍM)
  const { data: allPlanned, error: debugError } = await supabase
    .from('content_plan')
    .select('*')
    .eq('status', 'planned');

  if (debugError || !allPlanned || allPlanned.length === 0) {
    return NextResponse.json({ 
      error: 'Zadny plan k publikaci.', 
      debug_info: {
        count_found: allPlanned?.length || 0,
        db_error: debugError,
        check_table: 'content_plan'
      } 
    });
  }

  const task = allPlanned[0]; // Vezmeme první dostupný
