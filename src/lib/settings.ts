import { supabaseAdmin } from '@/lib/supabase/admin'

export interface SiteSettings {
  site_name: string
  site_tagline: string
  logo_url: string
  primary_color: string
  primary_color_dark: string
  accent_color: string
  accent_color_dark: string
  footer_text: string
  adsense_client_id: string
  ads_txt_content: string
  gtm_id: string
  ga_measurement_id: string
  search_console_verification: string
  custom_head_scripts: string
  enabled_locales: string[]
  default_locale: string
  seo_title: string
  seo_description: string
  [key: string]: unknown
}

const DEFAULTS: SiteSettings = {
  site_name: 'GifHub',
  site_tagline: 'Professional GIFs for Business',
  logo_url: '',
  primary_color: '#6d28d9',
  primary_color_dark: '#a78bfa',
  accent_color: '#f4f4f5',
  accent_color_dark: '#27272a',
  footer_text: '© 2026 GifHub.App. All rights reserved.',
  adsense_client_id: '',
  ads_txt_content: '',
  gtm_id: '',
  ga_measurement_id: '',
  search_console_verification: '',
  custom_head_scripts: '',
  enabled_locales: ['en'],
  default_locale: 'en',
  seo_title: 'GifHub — Professional GIFs for Business Communication',
  seo_description: 'Discover and share professional GIFs for Slack, Teams, and workplace communication.',
}

export async function getSettings(): Promise<SiteSettings> {
  try {
    const { data } = await supabaseAdmin
      .from('site_settings')
      .select('key, value')

    if (!data?.length) return { ...DEFAULTS }

    const settings = { ...DEFAULTS }
    for (const row of data) {
      settings[row.key] = row.value
    }
    return settings
  } catch {
    return { ...DEFAULTS }
  }
}

export async function updateSettings(updates: Record<string, unknown>) {
  const entries = Object.entries(updates)
  for (const [key, value] of entries) {
    await supabaseAdmin
      .from('site_settings')
      .upsert({ key, value: JSON.parse(JSON.stringify(value)), updated_at: new Date().toISOString() })
  }
}
