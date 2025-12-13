from fastapi.testclient import TestClient
from app.main import app
from app.config import settings

client = TestClient(app)

def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Welcome to SchoolDoor API"
    assert "version" in data

def test_config_loaded():
    assert settings.admin_email is not None
    assert settings.admin_password != "changethisadminpassword"  # It should be loaded from env
