-- Inserir os pacientes mostrados no screenshot do Lovable
-- IMPORTANTE: Verifique se a tabela se chama 'patients' ou 'pacientes' no seu banco de dados.
-- O screenshot do Lovable indica que a tabela no painel esquerdo se chama 'patients'.

INSERT INTO patients (
  id, 
  name, 
  cpf, 
  age, 
  sex, 
  status, 
  last_visit
) VALUES 
(
  gen_random_uuid(), 
  'Max rangel', 
  '033.465.174-38', 
  46, 
  'M', 
  'internado', 
  '2026-03-16'
),
(
  gen_random_uuid(), 
  'SAmara Nobrega de Almeida', 
  '050.550.814-14', 
  43, 
  'F', -- Nota: O screenshot mostrou 'M' para ambos, ajuste de acordo se necessário 
  'ambulatorial', 
  '2026-03-16'
);
