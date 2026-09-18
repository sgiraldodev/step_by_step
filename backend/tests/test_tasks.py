from uuid import uuid4


def task(client):
    response = client.post("/tasks", json={"title": "Preparar propuesta", "priority": "Alta"})
    assert response.status_code == 201
    assert response.json()["status"] == "Pendiente"
    assert response.json()["cycles_invested"] == 0
    return response.json()["id"]


def test_work_rest_complete_and_retry(client):
    id = task(client)
    assert client.put(f"/tasks/{id}", json={"action": "start"}).json()["status"] == "En Progreso"
    first = {"action": "resolve", "finished": False, "operation_id": str(uuid4())}
    result = client.put(f"/tasks/{id}", json=first).json()
    assert (result["status"], result["cycles_invested"]) == ("En Progreso", 1)
    assert client.put(f"/tasks/{id}", json=first).json()["cycles_invested"] == 1
    second = {"action": "resolve", "finished": True, "operation_id": str(uuid4())}
    result = client.put(f"/tasks/{id}", json=second).json()
    assert (result["status"], result["cycles_invested"]) == ("Terminada", 2)
    assert client.put(f"/tasks/{id}", json=second).json()["cycles_invested"] == 2
    assert client.put(f"/tasks/{id}", json={"action": "start"}).status_code == 409
    assert client.get("/tasks").json()[0]["cycles_invested"] == 2


def test_validation_and_invalid_transitions(client):
    assert client.post("/tasks", json={"title": "  "}).status_code == 422
    assert client.post("/tasks", json={"title": "x", "priority": "Inexistente"}).status_code == 422
    assert client.put("/tasks/999", json={"title": "x"}).status_code == 404
    id = task(client)
    assert (
        client.put(
            f"/tasks/{id}",
            json={"action": "resolve", "finished": True, "operation_id": str(uuid4())},
        ).status_code
        == 409
    )
    assert client.put(f"/tasks/{id}", json={"status": "Terminada"}).status_code == 409
    assert client.put(f"/tasks/{id}", json={"priority": None}).status_code == 422
    assert client.put(f"/tasks/{id}", json={"cycles_invested": -1}).status_code == 422


def test_optimistic_update_and_receipt_conflict(client):
    id = task(client)
    client.put(f"/tasks/{id}", json={"status": "En Progreso"})
    result = client.put(f"/tasks/{id}", json={"cycles_invested": 1, "expected_cycles": 0})
    assert result.status_code == 200
    assert (
        client.put(f"/tasks/{id}", json={"cycles_invested": 1, "expected_cycles": 0}).status_code
        == 409
    )
    operation = str(uuid4())
    client.put(
        f"/tasks/{id}", json={"action": "resolve", "finished": False, "operation_id": operation}
    )
    assert (
        client.put(
            f"/tasks/{id}", json={"action": "resolve", "finished": True, "operation_id": operation}
        ).status_code
        == 409
    )
