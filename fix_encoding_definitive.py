import os

filepath = r"d:\Teste\PEP\src\components\ProfessionalProntuario.tsx"

if os.path.exists(filepath):
    print(f"Fixing {filepath}")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove hidden control char \x81
    content = content.replace("\x81", "")
    
    # Fix words that are or might become correct after removing the char
    content = content.replace("PÍGINA", "PÁGINA")
    content = content.replace("PRONTUÍRIO", "PRONTUÁRIO")
    content = content.replace("CLÍ NICA", "CLÍNICA")
    content = content.replace("CLÍ NICAS", "CLÍNICAS")
    content = content.replace("RESPONSÍ VEIS", "RESPONSÁVEIS")
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Definitive Fix applied.")
else:
    print("File not found.")
