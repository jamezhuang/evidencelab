import json
import sqlite3
from pathlib import Path
from typing import Literal
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from uuid import uuid4

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="EvidenceLab API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["GET", "POST", "PUT"],
    allow_headers=["Content-Type"],
)

DATA_DIR = Path(__file__).parent / "data"
DATA_DIR.mkdir(exist_ok=True)
DB_PATH = DATA_DIR / "evidencelab.db"


def connect():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


with connect() as db:
    db.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            payload TEXT NOT NULL
        )
        """)


class CreateTask(BaseModel):
    question: str = Field(min_length=5, max_length=500)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/tasks", status_code=201)
def create_task(request: CreateTask):
    task = {
        "id": str(uuid4()),
        "question": request.question,
        "mode": "demo",
        "steps": [
            {"id": 1, "title": "明确问题和比较维度", "status": "done"},
            {"id": 2, "title": "检索公开资料", "status": "pending"},
            {"id": 3, "title": "提取并核验证据", "status": "pending"},
            {"id": 4, "title": "生成研究报告", "status": "pending"},
        ],
        "finding": "任务已创建。下一阶段将接入真实检索与 Agent 流程。",
        "sources": [],
    }

    with connect() as db:
        db.execute(
            "INSERT INTO tasks (id, payload) VALUES (?, ?)",
            (task["id"], json.dumps(task, ensure_ascii=False)),
        )

    return task


@app.get("/tasks/{task_id}")
def get_task(task_id: str):
    with connect() as db:
        row = db.execute(
            "SELECT payload FROM tasks WHERE id = ?", (task_id,)
        ).fetchone()

    if row is None:
        raise HTTPException(status_code=404, detail="任务不存在")

    return json.loads(row["payload"])


class PlanStep(BaseModel):
    id: int = Field(ge=1)
    title: str = Field(min_length=1, max_length=100)
    status: Literal["done", "active", "pending"]


class UpdatePlan(BaseModel):
    steps: list[PlanStep] = Field(min_length=1, max_length=8)


@app.put("/tasks/{task_id}/plan")
def update_plan(task_id: str, request: UpdatePlan):
    if len({step.id for step in request.steps}) != len(request.steps):
        raise HTTPException(status_code=422, detail="步骤 ID 不得重复")
    steps = [step.model_dump() for step in request.steps]
    for step in steps:
        step["title"] = step["title"].strip()
        if not step["title"]:
            raise HTTPException(status_code=422, detail="步骤标题不能为空")

    with connect() as db:
        row = db.execute(
            "SELECT payload FROM tasks WHERE id = ?", (task_id,)
        ).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="任务不存在")
        task = json.loads(row["payload"])
        task["steps"] = steps
        db.execute(
            "UPDATE tasks SET payload = ? WHERE id = ?",
            (json.dumps(task, ensure_ascii=False), task_id),
        )
    return task


REPOSITORIES = (
    "langchain-ai/langgraph",
    "langgenius/dify",
    "crewAIInc/crewAI",
)


def fetch_repository(name: str):
    request = Request(
        f"https://api.github.com/repos/{name}",
        headers={
            "Accept": "application/vnd.github+json",
            "User-Agent": "EvidenceLab/0.1",
        },
    )
    try:
        with urlopen(request, timeout=15) as response:
            data = json.load(response)
    except HTTPError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"GitHub 返回 HTTP {exc.code}：{name}",
        ) from exc
    except (URLError, TimeoutError) as exc:
        raise HTTPException(
            status_code=502,
            detail=f"连接 GitHub 失败：{name}",
        ) from exc
    return {
        "title": data["full_name"],
        "url": data["html_url"],
        "type": "GitHub 仓库",
        "description": data.get("description") or "",
        "stars": data["stargazers_count"],
        "pushed_at": data["pushed_at"],
        "archived": data["archived"],
    }


@app.post("/tasks/{task_id}/sources/github")
def add_github_sources(task_id: str):
    with connect() as db:
        row = db.execute(
            "SELECT payload FROM tasks WHERE id = ?", (task_id,)
        ).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="任务不存在")

    sources = [fetch_repository(name) for name in REPOSITORIES]
    with connect() as db:
        row = db.execute(
            "SELECT payload FROM tasks WHERE id = ?", (task_id,)
        ).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="任务不存在")
        task = json.loads(row["payload"])
        task["sources"] = sources
        db.execute(
            "UPDATE tasks SET payload = ? WHERE id = ?",
            (json.dumps(task, ensure_ascii=False), task_id),
        )
    return task
