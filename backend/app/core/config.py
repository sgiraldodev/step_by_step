from zoneinfo import ZoneInfo

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    database_url: str
    app_timezone: str = "America/Bogota"
    app_origin: str = "http://localhost:3102"
    cors_origins: str = "http://localhost:3102"
    initial_setup_token: str = ""
    cookie_secure: bool = False
    session_cookie_name: str = "step_session"
    app_env: str = "development"
    log_level: str = "INFO"
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_starttls: bool = True
    smtp_from: str = ""
    smtp_user: str = ""
    smtp_password: str = ""

    @field_validator("app_timezone")
    @classmethod
    def valid_timezone(cls, value: str) -> str:
        ZoneInfo(value)
        return value


settings = Settings()
