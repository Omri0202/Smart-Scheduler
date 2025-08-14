#!/usr/bin/env python3
"""
Simple HTTP server for testing the Smart Scheduler PWA
Run with: python serve.py
"""

import http.server
import socketserver
import webbrowser
import os
from pathlib import Path

PORT = 8000

class PWAHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add PWA-required headers
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Service-Worker-Allowed', '/')
        super().end_headers()

    def guess_type(self, path):
        # Ensure proper MIME types for PWA files
        mimetype, encoding = super().guess_type(path)
        if path.endswith('.webmanifest') or path.endswith('manifest.json'):
            return 'application/manifest+json'
        return mimetype, encoding

def main():
    # Change to the directory containing this script
    os.chdir(Path(__file__).parent)
    
    with socketserver.TCPServer(("", PORT), PWAHandler) as httpd:
        print(f"🚀 Smart Scheduler PWA Server running at:")
        print(f"   http://localhost:{PORT}")
        print(f"   http://127.0.0.1:{PORT}")
        print()
        print("📱 To test on mobile:")
        print("   1. Connect mobile to same WiFi")
        print("   2. Find your computer's IP address")
        print("   3. Open http://YOUR_IP:8000 on mobile")
        print()
        print("🔧 Features to test:")
        print("   • Install prompt on mobile")
        print("   • Offline functionality")
        print("   • Voice input")
        print("   • Gmail invitations")
        print()
        print("Press Ctrl+C to stop the server")
        
        # Auto-open browser
        try:
            webbrowser.open(f'http://localhost:{PORT}')
        except:
            pass
            
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n👋 Server stopped")

if __name__ == "__main__":
    main()
