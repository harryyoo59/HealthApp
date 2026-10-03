#!/usr/bin/env python3
"""Dev static server with cache disabled for HTML/JS/CSS (phone-first preview)."""
from __future__ import annotations

import argparse
import functools
import mimetypes
import os
import socket
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


NO_CACHE = "no-cache, no-store, must-revalidate"


class NoCacheHandler(SimpleHTTPRequestHandler):
    extensions_map = {
        **getattr(SimpleHTTPRequestHandler, "extensions_map", {}),
        ".js": "application/javascript",
        ".mjs": "application/javascript",
        ".css": "text/css",
        ".json": "application/json",
        ".svg": "image/svg+xml",
        ".webp": "image/webp",
    }

    def end_headers(self) -> None:
        # Phone-first: never let browsers keep stale HTML/JS/CSS (or other assets).
        self.send_header("Cache-Control", NO_CACHE)
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, fmt: str, *args) -> None:
        import sys

        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))


def lan_ipv4() -> str | None:
    """Best-effort address a phone on the same Wi-Fi can open. No packet is sent."""
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
            sock.connect(("192.0.2.1", 9))
            ip = sock.getsockname()[0]
    except OSError:
        return None
    if not ip or ip.startswith("127."):
        return None
    return ip


def announce(bind: str, port: int) -> None:
    local_url = f"http://127.0.0.1:{port}/"
    if bind in ("127.0.0.1", "localhost", "::1"):
        print(
            "이 컴퓨터만 열립니다. 같은 Wi-Fi 폰에서는 안 열립니다.\n"
            f"브라우저 주소: {local_url}\n"
            "폰에서도 보려면 서버를 끄고 npm run dev:lan 을 실행하세요.",
            flush=True,
        )
        return
    if bind in ("0.0.0.0", "::"):
        phone_ip = lan_ipv4()
    else:
        phone_ip = bind
    if phone_ip:
        phone_line = f"폰 주소: http://{phone_ip}:{port}/"
    else:
        phone_line = (
            f"폰 주소: 이 컴퓨터의 Wi-Fi IP를 찾지 못했습니다. "
            f"같은 Wi-Fi에서 http://(컴퓨터 IP):{port}/ 를 여세요."
        )
    print(
        "같은 Wi-Fi 폰도 열 수 있습니다.\n"
        f"이 컴퓨터: {local_url}\n"
        f"{phone_line}",
        flush=True,
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="HealthApp no-cache static server")
    parser.add_argument(
        "--bind",
        default="127.0.0.1",
        help="기본값 127.0.0.1 (이 컴퓨터만). 같은 Wi-Fi 폰도 열려면 0.0.0.0 (npm run dev:lan).",
    )
    parser.add_argument("--port", type=int, default=43127)
    parser.add_argument(
        "--directory",
        default=os.path.join(os.path.dirname(os.path.abspath(__file__)), "public"),
    )
    args = parser.parse_args()

    # Ensure common types even if system mime is sparse.
    mimetypes.add_type("application/javascript", ".js")
    mimetypes.add_type("text/css", ".css")

    handler = functools.partial(NoCacheHandler, directory=args.directory)
    httpd = ThreadingHTTPServer((args.bind, args.port), handler)
    announce(args.bind, args.port)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.", flush=True)


if __name__ == "__main__":
    main()
