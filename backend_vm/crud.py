from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import models
from typing import Optional, List


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[models.User]:
    q = await db.execute(select(models.User).where(models.User.email == email))
    return q.scalars().first()


async def get_user_by_id(db: AsyncSession, user_id: int) -> Optional[models.User]:
    q = await db.execute(select(models.User).where(models.User.id == user_id))
    return q.scalars().first()


async def get_user_by_username(db: AsyncSession, username: str) -> Optional[models.User]:
    q = await db.execute(select(models.User).where(models.User.username == username))
    return q.scalars().first()


async def create_user(db: AsyncSession, user: models.User) -> models.User:
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def update_user(db: AsyncSession, user: models.User) -> models.User:
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def create_password_entry(db: AsyncSession, entry: models.PasswordEntry) -> models.PasswordEntry:
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return entry


async def get_passwords_for_user(db: AsyncSession, user_id: int) -> List[models.PasswordEntry]:
    q = await db.execute(select(models.PasswordEntry).where(models.PasswordEntry.owner_id == user_id))
    return q.scalars().all()


async def get_password_entry(db: AsyncSession, entry_id: int) -> Optional[models.PasswordEntry]:
    q = await db.execute(select(models.PasswordEntry).where(models.PasswordEntry.id == entry_id))
    return q.scalars().first()


async def update_password_entry(db: AsyncSession, entry: models.PasswordEntry) -> models.PasswordEntry:
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return entry


async def delete_password_entry(db: AsyncSession, entry_id: int) -> bool:
    entry = await get_password_entry(db, entry_id)
    if not entry:
        return False
    await db.delete(entry)
    await db.commit()
    return True


async def create_shared_password(db: AsyncSession, shared: models.SharedPassword) -> models.SharedPassword:
    db.add(shared)
    await db.commit()
    await db.refresh(shared)
    return shared


async def get_incoming_shares(db: AsyncSession, user_id: int) -> List[models.SharedPassword]:
    q = await db.execute(select(models.SharedPassword).where(models.SharedPassword.to_user_id == user_id))
    return q.scalars().all()


async def get_outgoing_shares(db: AsyncSession, user_id: int) -> List[models.SharedPassword]:
    q = await db.execute(select(models.SharedPassword).where(models.SharedPassword.from_user_id == user_id))
    return q.scalars().all()


async def get_shares_for_password(db: AsyncSession, password_id: int) -> List[models.SharedPassword]:
    q = await db.execute(select(models.SharedPassword).where(models.SharedPassword.entry_id == password_id))
    return q.scalars().all()


async def get_share_for_user_and_password(db: AsyncSession, user_id: int, password_id: int) -> Optional[models.SharedPassword]:
    q = await db.execute(
        select(models.SharedPassword).where(
            models.SharedPassword.to_user_id == user_id,
            models.SharedPassword.entry_id == password_id
        )
    )
    return q.scalars().first()


async def get_share_by_id(db: AsyncSession, share_id: int) -> Optional[models.SharedPassword]:
    q = await db.execute(select(models.SharedPassword).where(models.SharedPassword.id == share_id))
    return q.scalars().first()


async def delete_share(db: AsyncSession, share_id: int) -> None:
    share = await get_share_by_id(db, share_id)
    if share:
        await db.delete(share)
        await db.commit()


async def update_share_status(db: AsyncSession, share_id: int, status: str) -> Optional[models.SharedPassword]:
    share = await db.get(models.SharedPassword, share_id)
    if not share:
        return None
    share.status = status
    db.add(share)
    await db.commit()
    await db.refresh(share)
    return share
