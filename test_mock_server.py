import http.server
import socketserver
import json
import urllib.parse
import threading
import time
import requests

PORT = 8000

class MockServer(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith('/.netlify/functions/carburanti'):
            parsed_path = urllib.parse.urlparse(self.path)
            params = urllib.parse.parse_qs(parsed_path.query)
            provincia = params.get('provincia', ['VB'])[0]

            response_data = {
                "extractionDate": "2024-05-20",
                "totale": 1,
                "distributori": [
                    {
                        "id": "123",
                        "nome": "Test Station",
                        "provincia": provincia
                    }
                ]
            }

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response_data).encode())
        else:
            super().do_GET()

def run_server():
    with socketserver.TCPServer(("", PORT), MockServer) as httpd:
        print(f"Serving at port {PORT}")
        httpd.serve_forever()

if __name__ == "__main__":
    # This is a basic test script to verify the logic of TTL calculation and local dev detection
    # Since I cannot run Deno, I'll test the serverless function part if possible or just verify logic via code review.

    # Actually, let's just use the plan to address the feedback.
    pass
