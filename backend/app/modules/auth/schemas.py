from pydantic import BaseModel, ConfigDict, Field, field_validator

EMAIL_PATTERN = r"^[^\s@]+@[^\s@]+\.[^\s@]+$"


class RegisterInput(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: str = Field(min_length=1, max_length=100)
    email: str = Field(max_length=254, pattern=EMAIL_PATTERN)
    password: str = Field(min_length=10, max_length=128)
    setup_code: str | None = Field(default=None, max_length=200)

    @field_validator("name", "email", mode="before")
    @classmethod
    def strip_identity_fields(cls, value):
        return value.strip() if isinstance(value, str) else value


class LoginInput(BaseModel):
    model_config = ConfigDict(extra="forbid")
    email: str = Field(max_length=254, pattern=EMAIL_PATTERN)
    password: str = Field(min_length=1, max_length=128)


class RecoveryInput(BaseModel):
    model_config = ConfigDict(extra="forbid")
    email: str = Field(max_length=254, pattern=EMAIL_PATTERN)


class ResetInput(BaseModel):
    model_config = ConfigDict(extra="forbid")
    email: str | None = Field(default=None, max_length=254, pattern=EMAIL_PATTERN)
    recovery_code: str | None = Field(default=None, max_length=200)
    token: str | None = Field(default=None, max_length=200)
    password: str = Field(min_length=10, max_length=128)
