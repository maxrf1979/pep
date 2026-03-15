import os
import re

filepath = r"d:\Teste\PEP\src\components\ProfessionalProntuario.tsx"

if os.path.exists(filepath):
    print(f"Fixing {filepath}")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    initial_content = content
    
    # Regex replaces to handle ANY space variant (\xa0, etc)
    content, c1 = re.subn(r"PÍ\s*GINA", "PÁGINA", content)
    content, c2 = re.subn(r"PRONTUÍ\s*RIO", "PRONTUÁRIO", content)
    content, c3 = re.subn(r"CLÍ\s*NICAS", "CLÍNICAS", content)
    content, c4 = re.subn(r"CLÍ\s*NICA", "CLÍNICA", content)
    
    # Also handle lower case variant if any, or general letters
    content, c5 = re.subn(r"EVOLUÇÍO", "EVOLUÇÃO", content)
    content, c6 = re.subn(r"IDENTIFICAÇÍO", "IDENTIFICAÇÃO", content)
    content, c7 = re.subn(r"RESPONSÍ\s*VEIS", "RESPONSÁVEIS", content)
    content, c8 = re.subn(r"Í\s*udio", "Áudio", content)
    
    if content != initial_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Fixed with regex. Changes made.")
    else:
        print("No changes made with regex.")
else:
    print("File not found.")
