import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rpstnljrxqoxwpttblgc.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwc3RubGpyeHFveHdwdHRibGdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0Mzc2MzMsImV4cCI6MjA5MDAxMzYzM30.5PFws6xk54IV7mIEUV8QRGJqN1pvyXfjaUT8-E0G90I'

export const supabase = createClient(supabaseUrl, supabaseKey)
