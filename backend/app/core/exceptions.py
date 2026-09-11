from dataclasses import dataclass
from typing import Any

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel


class ProblemDetail(BaseModel):
    type: str = "about:blank"
    title: str
    status: int
    detail: str
    code: str
    instance: str | None = None
    meta: dict[str, Any] | None = None


@dataclass(slots=True)
class AppError(Exception):
    status_code: int
    code: str
    detail: str
    title: str = "Application error"
    meta: dict[str, Any] | None = None


class NotFoundError(AppError):
    def __init__(self, detail: str, code: str = "not_found") -> None:
        super().__init__(404, code, detail, "Resource not found")


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def handle_app_error(request: Request, exc: AppError) -> JSONResponse:
        payload = ProblemDetail(
            title=exc.title,
            status=exc.status_code,
            detail=exc.detail,
            code=exc.code,
            instance=request.url.path,
            meta=exc.meta,
        )
        return JSONResponse(status_code=exc.status_code, content=payload.model_dump())
