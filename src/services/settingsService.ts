import { WebsiteSettings } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { INITIAL_SETTINGS } from '../data/seedData';

const LOCAL_STORAGE_KEY = 'aesthetic_look_settings';

function checkOwnerAuthorized(): void {
  const sessionActive = localStorage.getItem('aesthetic_look_owner_session') === 'true';
  const email = (localStorage.getItem('aesthetic_look_owner_email') || '').toLowerCase();
  if (!sessionActive || email !== 'ashokboya4173@gmail.com') {
    throw new Error('Unauthorized: Only verified owner (ashokboya4173@gmail.com) can update settings.');
  }
}

export const settingsService = {
  async getSettings(): Promise<WebsiteSettings> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('website_settings')
          .select('value')
          .eq('key', 'general')
          .maybeSingle();

        if (!error && data?.value) {
          return {
            ...INITIAL_SETTINGS,
            ...data.value,
          };
        }
      } catch (err) {
        console.warn('Supabase getSettings error:', err);
      }
    }

    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}

    return INITIAL_SETTINGS;
  },

  async updateSettings(settings: WebsiteSettings): Promise<WebsiteSettings> {
    checkOwnerAuthorized();
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('website_settings')
          .upsert({
            key: 'general',
            value: settings,
            updated_at: new Date().toISOString(),
          });
      } catch (err) {
        console.warn('Supabase updateSettings error:', err);
      }
    }

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
    } catch (err) {
      console.error('Failed to save settings:', err);
    }

    return settings;
  },
};
