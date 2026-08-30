import subprocess
import time
import re
import os
import sys
import threading

def run_server(cmd, cwd):
    return subprocess.Popen(cmd, cwd=cwd, shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def start_tunnel_and_get_url(port):
    print(f"Starting tunnel for port {port}...")
    process = subprocess.Popen(
        f".\\cloudflared.exe tunnel --url http://127.0.0.1:{port}",
        shell=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True
    )
    
    url = None
    for line in iter(process.stdout.readline, ''):
        match = re.search(r'(https://[a-zA-Z0-9-]+\.trycloudflare\.com)', line)
        if match:
            url = match.group(1)
            break
            
    def exhaust_output():
        for _ in iter(process.stdout.readline, ''):
            pass
    threading.Thread(target=exhaust_output, daemon=True).start()
            
    return process, url

def update_api_js(backend_url):
    api_path = os.path.join("frontend", "src", "services", "api.js")
    with open(api_path, "r") as f:
        content = f.read()
        
    content = re.sub(r'const API_BASE_URL = ".*?";', f'const API_BASE_URL = "{backend_url}/api";', content)
    
    with open(api_path, "w") as f:
        f.write(content)
    print(f"Updated api.js with new backend URL: {backend_url}/api")

if __name__ == "__main__":
    print("========================================")
    print("   RailETA Hackathon Demo Launcher      ")
    print("========================================\n")
    
    print("1. Starting FastAPI Backend...")
    backend_proc = run_server(".\\venv\\Scripts\\python -m uvicorn main:app --port 8000", "backend")
    
    print("2. Starting Vite Frontend...")
    frontend_proc = run_server("npm run dev", "frontend")
    
    time.sleep(3) # Wait for servers to spin up
    
    # 3. Start Backend Tunnel
    cf_backend_proc, backend_url = start_tunnel_and_get_url(8000)
    if not backend_url:
        print("Failed to get backend URL from Cloudflare.")
        sys.exit(1)
        
    print(f"-> Backend Tunnel established: {backend_url}")
    
    # 4. Update api.js
    update_api_js(backend_url)
    time.sleep(2) # Give Vite a second to Hot Reload
    
    # 5. Start Frontend Tunnel
    cf_frontend_proc, frontend_url = start_tunnel_and_get_url(5173)
    if not frontend_url:
        print("Failed to get frontend URL from Cloudflare.")
        sys.exit(1)
        
    print("\n========================================================")
    print("                   ALL SYSTEMS GO!                        ")
    print("========================================================")
    print(f"\nYour PUBLIC DEMO LINK is:\n\n--->  {frontend_url}  <---\n")
    print("========================================================")
    print("Keep this terminal open! Press Ctrl+C to stop everything.")
    
    try:
        cf_frontend_proc.wait()
    except KeyboardInterrupt:
        print("\nShutting down servers and tunnels...")
        backend_proc.kill()
        frontend_proc.kill()
        cf_backend_proc.kill()
        cf_frontend_proc.kill()
        print("Goodbye!")
