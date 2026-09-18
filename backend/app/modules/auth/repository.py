from sqlalchemy import delete, select

from app.modules.auth.models import AuthLimit, LoginSession, PasswordReset, User


class AuthRepository:
    @staticmethod
    async def find(db, email):
        normalized = email.strip().lower()
        return await db.scalar(select(User).where(User.email == normalized))

    @staticmethod
    async def user(db, user_id, lock=False):
        query = select(User).where(User.id == user_id)
        if lock:
            query = query.execution_options(populate_existing=True).with_for_update()
        return await db.scalar(query)

    @staticmethod
    async def session(db, token):
        return await db.get(LoginSession, token)

    @staticmethod
    async def limit(db, key):
        return await db.scalar(select(AuthLimit).where(AuthLimit.key == key).with_for_update())

    @staticmethod
    async def reset(db, token):
        return await db.scalar(
            select(PasswordReset).where(PasswordReset.token_hash == token).with_for_update()
        )

    @staticmethod
    async def revoke_sessions(db, user_id):
        await db.execute(delete(LoginSession).where(LoginSession.user_id == user_id))

    @staticmethod
    async def remove_resets(db, user_id):
        await db.execute(delete(PasswordReset).where(PasswordReset.user_id == user_id))

    @staticmethod
    async def logout(db, token):
        await db.execute(delete(LoginSession).where(LoginSession.token_hash == token))
