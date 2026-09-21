from typing import Literal
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
    app_version: str = "1.0.0"
    log_level: str = "INFO"
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_starttls: bool = True
    smtp_from: str = ""
    smtp_user: str = ""
    smtp_password: str = ""
    email_provider: Literal["resend", "smtp"] = "resend"
    email_from: str = ""
    resend_api_key: str = ""

    @field_validator("app_timezone")
    @classmethod
    def valid_timezone(cls, value: str) -> str:
        ZoneInfo(value)
        return value


settings = Settings()
