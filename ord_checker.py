import os

filepath = r"d:\Teste\PEP\src\components\ProfessionalProntuario.tsx"

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

line = lines[386] # zero-based for line 387
print(f"Line 387 RAW: {repr(line)}")
for char in line:
    print(f"'{char}' ({ord(char)})", end=" | ")
print()
