from __future__ import annotations

import json
import mimetypes
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse
from uuid import uuid4


BASE_DIR = Path(__file__).resolve().parent
MESSAGES_PATH = BASE_DIR / "assets" / "data" / "messages.json"


def read_messages() -> list[dict[str, str]]:
    if not MESSAGES_PATH.exists():
        return []

    try:
        return json.loads(MESSAGES_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return []


def write_messages(messages: list[dict[str, str]]) -> None:
    MESSAGES_PATH.parent.mkdir(parents=True, exist_ok=True)
    MESSAGES_PATH.write_text(json.dumps(messages, ensure_ascii=False, indent=2), encoding="utf-8")


class PortfolioHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(BASE_DIR), **kwargs)

    def _send_json(self, payload: object, status: int = HTTPStatus.OK) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _read_payload(self) -> dict[str, str]:
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length).decode("utf-8") if length else "{}"
        return json.loads(raw)

    def do_GET(self) -> None:
        parsed = urlparse(self.path)

        if parsed.path == "/api/messages":
            self._send_json(read_messages())
            return

        if parsed.path == "/":
            self.path = "/index.html"

        super().do_GET()

    def do_POST(self) -> None:
        parsed = urlparse(self.path)

        if parsed.path != "/api/messages":
            self.send_error(HTTPStatus.NOT_FOUND, "Endpoint not found")
            return

        payload = self._read_payload()
        full_name = payload.get("fullName", "").strip()
        email = payload.get("email", "").strip()
        message = payload.get("message", "").strip()

        if not full_name or not email or not message:
            self._send_json({"error": "All fields are required."}, HTTPStatus.BAD_REQUEST)
            return

        messages = read_messages()
        entry = {
            "id": uuid4().hex,
            "fullName": full_name,
            "email": email,
            "message": message,
        }
        messages.insert(0, entry)
        write_messages(messages)
        self._send_json(entry, HTTPStatus.CREATED)

    def do_DELETE(self) -> None:
        parsed = urlparse(self.path)
        prefix = "/api/messages/"

        if not parsed.path.startswith(prefix):
            self.send_error(HTTPStatus.NOT_FOUND, "Endpoint not found")
            return

        message_id = parsed.path.removeprefix(prefix).strip()
        messages = read_messages()
        filtered = [message for message in messages if message.get("id") != message_id]

        if len(filtered) == len(messages):
            self._send_json({"error": "Message not found."}, HTTPStatus.NOT_FOUND)
            return

        write_messages(filtered)
        self._send_json({"deleted": message_id})

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


def main() -> None:
    port = 8765
    server = ThreadingHTTPServer(("127.0.0.1", port), PortfolioHandler)
    print(f"Serving portfolio at http://127.0.0.1:{port}")
    server.serve_forever()


if __name__ == "__main__":
    main()
