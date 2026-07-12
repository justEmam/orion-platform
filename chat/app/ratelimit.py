"""
Small, self-contained PER-IP rate limiter — no external rate-limit library.

Why custom: slowapi's middleware+default_limits path buckets all visitors into
one shared limit behind a proxy, which is worse than useless (real users block
each other). This limiter keys strictly on the REAL client IP and is trivial to
reason about and test.

Algorithm: sliding window. For each IP we keep the timestamps of its recent
requests; a request is allowed iff fewer than `limit` fall within the last
`window` seconds. Old timestamps are pruned as we go, and idle IPs are dropped,
so memory stays bounded.

Note: in-memory, per-process. With one chat container (our setup) that's exactly
right. If you ever run multiple chat replicas, move this to Redis (same logic).
"""
from __future__ import annotations

import threading
import time
from collections import defaultdict, deque

from starlette.requests import Request


def client_ip(request: Request) -> str:
    """The real visitor IP. Caddy sets X-Forwarded-For; the first entry is the
    original client. Falls back to the direct connection IP."""
    xff = request.headers.get("x-forwarded-for")
    if xff:
        first = xff.split(",")[0].strip()
        if first:
            return first
    return request.client.host if request.client else "unknown"


class RateLimiter:
    def __init__(self, limit: int, window_seconds: int) -> None:
        self.limit = limit
        self.window = window_seconds
        self._hits: dict[str, deque[float]] = defaultdict(deque)
        self._lock = threading.Lock()
        self._last_sweep = 0.0

    def allow(self, key: str, now: float | None = None) -> bool:
        """Record a request for `key`; return True if allowed, False if over
        the limit. Thread-safe."""
        now = time.monotonic() if now is None else now
        cutoff = now - self.window
        with self._lock:
            dq = self._hits[key]
            # prune this key's expired timestamps
            while dq and dq[0] <= cutoff:
                dq.popleft()
            if len(dq) >= self.limit:
                return False
            dq.append(now)
            self._maybe_sweep(now, cutoff)
            return True

    def _maybe_sweep(self, now: float, cutoff: float) -> None:
        """Occasionally drop fully-idle IPs so memory doesn't grow unbounded."""
        if now - self._last_sweep < self.window:
            return
        self._last_sweep = now
        for k in [k for k, dq in self._hits.items() if not dq or dq[-1] <= cutoff]:
            del self._hits[k]


def parse_rate(spec: str) -> tuple[int, int]:
    """Parse '20/minute' | '5/second' | '100/hour' -> (limit, window_seconds)."""
    units = {"second": 1, "minute": 60, "hour": 3600, "day": 86400}
    try:
        count, unit = spec.split("/")
        unit = unit.strip().rstrip("s")  # allow 'minutes'
        return int(count), units[unit]
    except Exception:
        return 20, 60  # safe default: 20/minute
