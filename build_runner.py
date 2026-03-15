import subprocess

res = subprocess.run(["npx", "vite", "build"], capture_output=True, text=True, shell=True)
with open("build_err.txt", "w", encoding="utf-8") as f:
    f.write("--- STDOUT ---\n" + res.stdout + "\n--- STDERR ---\n" + res.stderr)

print("--- FILTERED CLEAN STDERR ---")
with open("build_err.txt", "r", encoding="utf-8") as f:
    for line in f:
        if "src/" in line or ".tsx" in line or "ArrayExpression" in line or "SpreadElement" in line:
            print(line.replace('\r', '\\r').strip())
