import os

filepath = r"d:\Teste\PEP\src\components\ProfessionalProntuario.tsx"

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "PÍ" in line or "PÍ GINA" in line or "PRONTUÍ RIO" in line:
        print(f"Line {i+1}:")
        for char in line:
            print(f"'{char}' ({ord(char)})", end=" | ")
        print("\n" + "-"*40)
        # break after 2 lines
        if i > 400:
            break
