import os

filepath = r"d:\Teste\PEP\src\components\ProfessionalProntuario.tsx"

for enc in ['utf-8', 'latin1', 'iso-8859-1', 'cp1252']:
    try:
        with open(filepath, 'r', encoding=enc) as f:
            content = f.read()
            index = content.find("PÍ")
            if index != -1:
                print(f"FOUND IN {enc}!")
                sub = content[index-5:index+15]
                print(f"Sub: {sub}")
                for char in sub:
                     print(f"'{char}' ({ord(char)})", end=" | ")
                print()
                break
            # Try to match just "P" + chr(something)
    except Exception as e:
         print(f"Error {enc}: {e}")
