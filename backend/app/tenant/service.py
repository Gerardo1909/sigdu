from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.tenant.models import Institution


async def get_institution_by_slug(db: AsyncSession, slug: str) -> Institution | None:
    return await db.scalar(select(Institution).where(Institution.slug == slug))


async def create_institution(
    db: AsyncSession,
    name: str,
    slug: str,
    email_domains: str,
    contact_email: str | None = None,
    contact_phone: str | None = None,
    logo_url: str | None = None,
) -> Institution:
    institution = Institution(
        id=str(uuid4()),
        name=name,
        slug=slug,
        email_domains=email_domains,
        contact_email=contact_email,
        contact_phone=contact_phone,
        logo_url=logo_url,
    )
    db.add(institution)
    await db.commit()
    await db.refresh(institution)
    return institution
