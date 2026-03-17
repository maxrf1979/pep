import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos do banco de dados
export interface Database {
  public: {
    Tables: {
      system_users: {
        Row: {
          id: string;
          username: string;
          name: string | null;
          email: string | null;
          role: 'medico' | 'enfermeiro' | 'admin' | 'recepcao';
          crm: string | null;
          coren: string | null;
          status: 'ativo' | 'inativo';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          name?: string | null;
          email?: string | null;
          role: 'medico' | 'enfermeiro' | 'admin' | 'recepcao';
          crm?: string | null;
          coren?: string | null;
          status?: 'ativo' | 'inativo';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          name?: string | null;
          email?: string | null;
          role?: 'medico' | 'enfermeiro' | 'admin' | 'recepcao';
          crm?: string | null;
          coren?: string | null;
          status?: 'ativo' | 'inativo';
          updated_at?: string;
        };
      };
    };
  };
}
