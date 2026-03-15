import os

files_to_fix = [
    r"d:\Teste\PEP\src\components\ProfessionalProntuario.tsx",
    r"d:\Teste\PEP\src\pages\PainelChamadaExibicao.tsx"
]

replaces = {
    "PÍ GINA": "PÁGINA",
    "PÍGINA": "PÁGINA",
    "PRONTUÍ RIO": "PRONTUÁRIO",
    "PRONTUÍRIO": "PRONTUÁRIO",
    "IDENTIFICAÇÍO": "IDENTIFICAÇÃO",
    "EVOLUÇÍO": "EVOLUÇÃO",
    "CLÍ NICAS": "CLÍNICAS",
    "CLÍNICAS": "CLÍNICAS", 
    "CLÍ NICA": "CLÍNICA",
    "CLÍNICA": "CLÍNICA",
    "RESPONSÍ VEIS": "RESPONSÁVEIS",
    "RESPONSÍVEIS": "RESPONSÁVEIS",
    "Í udio": "Áudio",
    "Íudio": "Áudio",
    "Íltimas": "Últimas",
}

for filepath in files_to_fix:
    if not os.path.exists(filepath):
        continue
    print(f"Fixing {filepath}")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    changed = False
    for k, v in replaces.items():
        if k in content:
            content = content.replace(k, v)
            changed = True
            
    if changed:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Fixed.")
    else:
        print("No changes needed.")
