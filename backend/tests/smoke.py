"""Verifica concurrencia HTTP con cuentas ficticias, sin eliminar datos."""

import os
from concurrent.futures import ThreadPoolExecutor
from uuid import uuid4

import httpx

base = os.environ["SMOKE_API_URL"]
assert os.environ.get("SMOKE_ISOLATED") == "true", (
    "Solo ejecutar en una base de validación aislada."
)
request_headers = {"X-Step-Client": "web", "Origin": os.environ["SMOKE_ORIGIN"]}


def put(id, body):
    response = httpx.patch(f"{base}/tasks/{id}", json=body, headers=request_headers, timeout=20)
    response.raise_for_status()
    return response.json()


with httpx.Client(base_url=base, timeout=20, headers=request_headers) as client:
    identifier = "smoke_" + uuid4().hex[:16]
    registered = client.post(
        "/auth/register",
        json={
            "name": "Persona de validación",
            "verification_token": os.environ["SMOKE_VERIFICATION_TOKEN"],
            "email": os.environ["SMOKE_REGISTRATION_EMAIL"],
            "password": uuid4().hex,
        },
    )
    registered.raise_for_status()
    user_id = registered.json()["user"]["id"]
    request_headers["Cookie"] = "; ".join(f"{key}={value}" for key, value in client.cookies.items())
    assert client.get("/auth/me").json()["id"] == user_id
    response = client.post(
        "/tasks", json={"title": "Prueba temporal de integración", "priority": "Urgente"}
    )
    response.raise_for_status()
    id = response.json()["id"]
    assert put(id, {"action": "start"})["status"] == "En Progreso"
    body = {"action": "resolve", "finished": False, "operation_id": str(uuid4())}
    with ThreadPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(lambda _: put(id, body), range(4)))
    assert all(result["cycles_invested"] == 1 for result in results)
    final = put(id, {"action": "resolve", "finished": True, "operation_id": str(uuid4())})
    assert final["status"] == "Terminada" and final["cycles_invested"] == 2
    assert any(task["id"] == id for task in client.get("/tasks").json())
    print("Integración aprobada: PostgreSQL, estados y reintentos concurrentes.")
    routine_response = client.post(
        "/routines", json={"title": "Rutina temporal de verificación", "priority": "Baja"}
    )
    routine_response.raise_for_status()
    routine_id = routine_response.json()["id"]

    def daily_task(_):
        response = httpx.get(f"{base}/routines", timeout=20, headers=request_headers)
        response.raise_for_status()
        return next(
            task for task in response.json()["today_tasks"] if task["routine_id"] == routine_id
        )

    with ThreadPoolExecutor(max_workers=4) as pool:
        daily_results = list(pool.map(daily_task, range(4)))
    daily_id = daily_results[0]["id"]
    assert all(task["id"] == daily_id for task in daily_results)
    checked = put(daily_id, {"action": "check"})
    assert checked["status"] == "Terminada" and checked["cycles_invested"] == 0
    client.patch(f"/routines/{routine_id}", json={"active": False}).raise_for_status()
    assert not any(
        task["routine_id"] == routine_id for task in client.get("/routines").json()["today_tasks"]
    )
    client.patch(f"/routines/{routine_id}", json={"active": True}).raise_for_status()
    restored = daily_task(None)
    assert restored["id"] == daily_id and restored["status"] == "Terminada"
    history = client.get(f"/routines/{routine_id}/history").json()
    assert len(history) == 1 and history[0]["id"] == daily_id
    print("Rutinas aprobadas: generación diaria concurrente, casilla, historial y reactivación.")
