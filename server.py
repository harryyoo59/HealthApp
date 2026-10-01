#!/usr/bin/env python3
"""Dev static server with cache disabled for HTML/JS/CSS (phone-first preview)."""
from __future__ import annotations

import argparse
import functools
import mimetypes
import os
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


def main() -> None:
    parser = argparse.ArgumentParser(description="HealthApp no-cache static server")
    parser.add_argument("--bind", default="0.0.0.0")
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
    print(
        f"HealthApp serving {args.directory} on http://{args.bind}:{args.port}/ "
        f"(Cache-Control: {NO_CACHE})",
        flush=True,
    )
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.", flush=True)


if __name__ == "__main__":
    main()
