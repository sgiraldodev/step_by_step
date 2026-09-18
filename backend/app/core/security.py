"""Contraseñas y tokens opacos sin persistir credenciales en texto plano."""

import hashlib
import hmac
import secrets
from datetime import timezone

from argon2 import PasswordHasher, Type
from argon2.exceptions import InvalidHashError, VerificationError

password_hasher = PasswordHasher(type=Type.ID)


def token_hash(value):
    return hashlib.sha256(value.encode()).hexdigest()


def hash_password(password):
    return password_hasher.hash(password)


def verify_password(password, encoded):
    try:
        if encoded.startswith("$argon2id$"):
            return password_hasher.verify(encoded, password)
        algorithm, salt, expected = encoded.split("$")
        if algorithm != "scrypt":
            return False
        actual = hashlib.scrypt(
            password.encode(), salt=bytes.fromhex(salt), n=16384, r=8, p=5, maxmem=64 * 1024 * 1024
        ).hex()
        return hmac.compare_digest(expected, actual)
    except (ValueError, AttributeError, InvalidHashError, VerificationError):
        return False


def utc(value):
    return value.replace(tzinfo=timezone.utc) if value.tzinfo is None else value


DUMMY_PASSWORD = hash_password(secrets.token_urlsafe(32))
