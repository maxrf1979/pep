import os

files_to_fix = [
    r"d:\Teste\PEP\src\pages\Prontuario.tsx",
    r"d:\Teste\PEP\src\pages\PainelChamadaExibicao.tsx",
    r"d:\Teste\PEP\src\components\ReportHeader.tsx",
    r"d:\Teste\PEP\src\components\ProfessionalProntuario.tsx",
    r"d:\Teste\PEP\src\components\PrintableProntuario.tsx",
    r"d:\Teste\PEP\src\components\PrintableDocument.tsx"
]

replacements = {
    "Ãµ": "õ",
    "Ã´": "ô",
    "Ã§": "ç",
    "Ã£": "ã",
    "Ã¡": "á",
    "Ã©": "é",
    "Ãº": "ú",
    "Ã³": "ó",
    "Ãš": "Ú",
    "Ã‡": "Ç",
    "Ã•": "Õ",
    "Ã‰": "É",
    "Ãƒ": "Ã",
    "Ã ": "Á",  # Espaço para Á (Áudio, Página)
    "Ã": "Í",  # For Í or generic IF NOT spaces
}

# Special cleanup for specific broken words if needed
# E.g. "CLÃ NICAS" usually means "CLÍNICAS". Let's do string replaces carefully.

special_replaces = {
    "PRONTUÃ RIO": "PRONTUÁRIO",
    "MÃ‰DICO": "MÉDICO",
    "IDENTIFICAÃ‡ÃƒO": "IDENTIFICAÇÃO",
    "PÃ GINA": "PÁGINA",
    "EVOLUÃ‡Ã•ES": "EVOLUÇÕES",
    "CLÃ NICAS": "CLÍNICAS",
    "EVOLUÃ‡ÃƒO": "EVOLUÇÃO",
    "PRESCRIÃ‡Ã•ES": "PRESCRIÇÕES",
    "RESPONSÃ VEIS": "RESPONSÁVEIS",
    "RODAPÃ‰": "RODAPÉ",
    "Ãšltimas": "Últimas",
    "Ã udio": "Áudio",
}

for filepath in files_to_fix:
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        continue
        
    print(f"Fixing {filepath}...")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    changed = False
    
    # Apply special repairs first
    for k, v in special_replaces.items():
        if k in content:
            content = content.replace(k, v)
            changed = True
            
    # Apply general repairs
    for k, v in replacements.items():
        if k in content:
            # Avoid replacing single Ã if it's meant to be something else, 
            # but usually it's broken in these files.
            content = content.replace(k, v)
            changed = True
            
    if changed:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Fixed.")
    else:
        print("No broken characters found or already fixed.")
