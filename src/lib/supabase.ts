import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Critical: Missing Supabase environment variables! Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Função de Teste de Conexão (Boas Práticas para validação em dev)
export const testConnection = async () => {
  console.log('🔌 Testando conexão com Supabase...');
  const { data, error } = await supabase.from('patients').select('id, name').limit(1);
  if (error) {
    console.error('❌ Erro na conexão com Supabase:', error.message);
  } else {
    console.log('✅ Conexão com Supabase estabelecida com sucesso! Dado retornado:', data);
  }
};

// Auto-executar o teste em ambiente de desenvolvimento (opcional, útil para o console do Lovable)
if (import.meta.env.DEV) {
  testConnection();
}
