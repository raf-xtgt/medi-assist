"""Controller for app_mda_user endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from model.schemas import UserCreate, UserUpdate, UserResponse
from service.app_mda_user_service import user_service
from util.database import get_db

router = APIRouter(prefix="/api/app_mda_user", tags=["app_mda_user"])


@router.get("/", response_model=list[UserResponse])
def get_all(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return user_service.get_all(db, skip=skip, limit=limit)


@router.get("/{guid}", response_model=UserResponse)
def get_by_guid(guid: UUID, db: Session = Depends(get_db)):
    obj = user_service.get_by_guid(db, guid)
    if not obj:
        raise HTTPException(status_code=404, detail="Record not found")
    return obj


@router.post("/", response_model=UserResponse, status_code=201)
def create(payload: UserCreate, db: Session = Depends(get_db)):
    return user_service.create(db, payload.model_dump())


@router.put("/{guid}", response_model=UserResponse)
def update(guid: UUID, payload: UserUpdate, db: Session = Depends(get_db)):
    obj = user_service.update(db, guid, payload.model_dump(exclude_unset=True))
    if not obj:
        raise HTTPException(status_code=404, detail="Record not found")
    return obj


@router.delete("/{guid}", status_code=204)
def delete(guid: UUID, db: Session = Depends(get_db)):
    if not user_service.delete(db, guid):
        raise HTTPException(status_code=404, detail="Record not found")
