import subprocess
import sys
import time
import os

port = sys.argv[1]
output_file = sys.argv[2]

print(f"Starting localtunnel on port {port}...")
process = subprocess.Popen('npx -y localtunnel --port ' + port, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

# Read the first line of output
url = ""
while True:
    line = process.stdout.readline()
    if line:
        print(f"localtunnel output: {line.strip()}")
        if "your url is:" in line:
            url = line.split("your url is:")[1].strip()
            break
    
    if process.poll() is not None:
        print("Process exited prematurely.")
        break
    time.sleep(0.1)

if url:
    with open(output_file, 'w') as f:
        f.write(url)
    print(f"Successfully captured URL: {url}")
else:
    print("Failed to capture URL.")
    # kill process if still running
    if process.poll() is None:
        process.kill()
