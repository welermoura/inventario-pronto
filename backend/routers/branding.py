from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from backend import crud, schemas, models
from backend.database import get_db
from backend.auth import get_current_user

router = APIRouter(prefix="/branding", tags=["branding"])

@router.get("/", response_model=schemas.BrandingResponse)
async def read_branding(db: AsyncSession = Depends(get_db)):
    return await crud.get_branding(db)

@router.patch("/", response_model=schemas.BrandingResponse)
async def update_branding(
    branding: schemas.BrandingUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Apenas administradores podem alterar a identidade visual")
    return await crud.update_branding(db, branding)
