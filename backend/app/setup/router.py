from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.setup import service
from app.setup.schemas import SetupInstitutionRequest, SetupInstitutionResponse

router = APIRouter(prefix="/api/v1/setup", tags=["setup"])


@router.post(
    "/institution",
    response_model=SetupInstitutionResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_institution(
    body: SetupInstitutionRequest,
    db: AsyncSession = Depends(get_db),
):
    return await service.create_institution_with_admin(db, body)
