"""
Local replacement for supabase-py `client.storage`.

Files are stored under `data/storage/<bucket>/<path>` and served by FastAPI's
StaticFiles mount at `/static/storage/...`. Mirror of the surface:

    storage.from_(bucket).upload(path, file_bytes, file_options={"content-type": ...})
    storage.from_(bucket).get_public_url(path)
    storage.from_(bucket).remove([paths])
"""
from __future__ import annotations

import os
import shutil
from pathlib import Path
from typing import Any

from .local_engine import PROJECT_ROOT

STORAGE_ROOT = PROJECT_ROOT / "data" / "storage"


def _backend_base_url() -> str:
    return os.environ.get("BACKEND_BASE_URL", "http://127.0.0.1:8091").rstrip("/")


def _safe_path(bucket: str, path: str) -> Path:
    """Resolve `<storage_root>/<bucket>/<path>`; reject parent-traversal."""
    bucket_root = STORAGE_ROOT / bucket
    target = (bucket_root / path).resolve()
    bucket_root_resolved = bucket_root.resolve()
    if not str(target).startswith(str(bucket_root_resolved)):
        raise ValueError(f"Path traversal rejected: {path!r}")
    return target


class _Bucket:
    def __init__(self, bucket: str):
        self.bucket = bucket

    def upload(
        self,
        path: str,
        file: bytes | str | Path,
        file_options: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        target = _safe_path(self.bucket, path)
        target.parent.mkdir(parents=True, exist_ok=True)
        if isinstance(file, (bytes, bytearray)):
            target.write_bytes(bytes(file))
        elif isinstance(file, (str, Path)):
            shutil.copyfile(file, target)
        else:
            raise TypeError(f"upload(): unsupported file type {type(file).__name__}")
        return {"path": path, "fullPath": f"{self.bucket}/{path}"}

    def get_public_url(self, path: str) -> str:
        # Supabase returns a string in some versions, a dict in others.
        # Existing callers use it as a string, so we return a string directly.
        return f"{_backend_base_url()}/static/storage/{self.bucket}/{path}"

    def remove(self, paths: list[str]) -> dict[str, Any]:
        removed: list[str] = []
        for p in paths:
            target = _safe_path(self.bucket, p)
            if target.exists():
                target.unlink()
                removed.append(p)
        return {"removed": removed}


class LocalStorage:
    """Drop-in replacement for `supabase.Client.storage`."""

    def from_(self, bucket: str) -> _Bucket:
        STORAGE_ROOT.mkdir(parents=True, exist_ok=True)
        (STORAGE_ROOT / bucket).mkdir(parents=True, exist_ok=True)
        return _Bucket(bucket)
