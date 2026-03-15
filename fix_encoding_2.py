import os

files_to_fix = [
    r"d:\Teste\PEP\src\components\ProfessionalProntuario.tsx",
    r"d:\Teste\PEP\src\pages\PainelChamadaExibicao.tsx"
]

replaces = {
    "PÍ GINA": "PÁGINA",
    "PRONTUÍ RIO": "PRONTUÁRIO",
    "IDENTIFICAÇÍO": "IDENTIFICAÇÃO",
    "EVOLUÇÍO": "EVOLUÇÃO",
    "CLÍ NICAS": "CLÍNICAS",
    "CLÍ NICA": "CLÍNICA",
    "RESPONSÍ VEIS": "RESPONSÁVEIS",
    "Í udio": "Áudio",
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
