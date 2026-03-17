import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yxilsouyhvyxpaidxecr.supabase.co';
// Using the anon key found in .env.local
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4aWxzb3V5aHl2eHBhaWR4ZWNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NTM4NTIsImV4cCI6MjA4OTMyOTg1Mn0.5C8XZ1-9VbMCrkW6i7ckjZU8Yy-MI_8wli8u9-yK0fk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("--- Testing Supabase Connection ---");
  
  // 1. Try select from clinics
  const { data: selectData, error: selectError } = await supabase.from('clinics').select('id').limit(1);
  console.log("Select Clinics - Data:", selectData);
  if (selectError) {
    console.error("Select Clinics - Error:", selectError.message, selectError.details);
  }

  // 2. Try insert into clinics
  const { data: insertData, error: insertError } = await supabase
    .from('clinics')
    .insert([{ name: 'Clínica Geral Teste', cnpj: '00000000000001' }]) // random CNPJ
    .select();
  console.log("Insert Clinic - Data:", insertData);
  if (insertError) {
    console.error("Insert Clinic - Error:", insertError.message, insertError.details);
  }

  // 3. Try select from patients to see if that works
  const { data: patData, error: patError } = await supabase.from('patients').select('id').limit(1);
  console.log("Select Patients - Data:", patData);
  if (patError) {
    console.error("Select Patients - Error:", patError.message, patError.details);
  }
}

test();
