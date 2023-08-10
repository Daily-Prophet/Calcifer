from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_ask():
    response = client.post("/ask", json={"question": "Does attendance report support GCCH co-organizer?"})
    assert response.status_code == 200
    assert "No, attendance report does not support GCCH co-organizer. Thanks for asking!" in response.text