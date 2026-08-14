import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://yedglwusfjqblzxbcznj.supabase.co";
const supabaseKey = "sb_publishable_JAEwYoc3fo-J7rQRbd5RTw_0Odu9MN-"; // NO pongas service key

export const supabase = createClient(supabaseUrl, supabaseKey); 
