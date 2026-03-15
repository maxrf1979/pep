import subprocess

res = subprocess.run(["npx", "vite", "build"], capture_output=True, text=True, shell=True)
with open("build_err.txt", "w", encoding="utf-8") as f:
    f.write("--- STDOUT ---\n" + res.stdout + "\n--- STDERR ---\n" + res.stderr)

print("--- PRINTING CLEAN STDERR ---")
for line in res.stderr.splitlines():
    print(line.replace('\r', '\\r'))
