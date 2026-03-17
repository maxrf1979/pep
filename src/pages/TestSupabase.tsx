import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TestSupabase() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    console.log("🧪 Testando conexão com Supabase...");
    console.log("📍 URL:", import.meta.env.VITE_SUPABASE_URL);
    console.log("🔑 Anon Key:", import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + "...");

    try {
      const { data, error, count } = await supabase
        .from('system_users')
        .select('*', { count: 'exact' });

      console.log("📊 Resultado completo:", { data, error, count });

      setResult({ data, error, count });
    } catch (err) {
      console.error("❌ Erro na conexão:", err);
      setResult({ error: err });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h1>🧪 Teste de Conexão Supabase</h1>

      <div style={{ marginTop: "2rem" }}>
        <h2>Variáveis de Ambiente:</h2>
        <pre style={{ background: "#f4f4f4", padding: "1rem", borderRadius: "4px" }}>
          URL: {import.meta.env.VITE_SUPABASE_URL || "❌ NÃO DEFINIDA"}
          {"\n"}
          Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? "✅ Definida" : "❌ NÃO DEFINIDA"}
        </pre>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <h2>Resultado da Query:</h2>
        {loading ? (
          <p>Carregando...</p>
        ) : (
          <pre style={{ background: "#f4f4f4", padding: "1rem", borderRadius: "4px", maxHeight: "400px", overflow: "auto" }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>

      <div style={{ marginTop: "2rem" }}>
        <button onClick={testConnection} style={{ padding: "0.5rem 1rem", cursor: "pointer" }}>
          🔄 Testar Novamente
        </button>
      </div>
    </div>
  );
}
