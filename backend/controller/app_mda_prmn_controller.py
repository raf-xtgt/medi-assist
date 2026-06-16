"""Controller for app_mda_prmn endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from model.schemas import PrmnCreate, PrmnUpdate, PrmnResponse
from service.app_mda_prmn_service import prmn_service
from util.database import get_db

router = APIRouter(prefix="/api/app_mda_prmn", tags=["app_mda_prmn"])


@router.get("/", response_model=list[PrmnResponse])
def get_all(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return prmn_service.get_all(db, skip=skip, limit=limit)


@router.get("/{guid}", response_model=PrmnResponse)
def get_by_guid(guid: UUID, db: Session = Depends(get_db)):
    obj = prmn_service.get_by_guid(db, guid)
    if not obj:
        raise HTTPException(status_code=404, detail="Record not found")
    return obj


@router.post("/", response_model=PrmnResponse, status_code=201)
def create(payload: PrmnCreate, db: Session = Depends(get_db)):
    return prmn_service.create(db, payload.model_dump())


@router.put("/{guid}", response_model=PrmnResponse)
def update(guid: UUID, payload: PrmnUpdate, db: Session = Depends(get_db)):
    obj = prmn_service.update(db, guid, payload.model_dump(exclude_unset=True))
    if not obj:
        raise HTTPException(status_code=404, detail="Record not found")
    return obj


@router.delete("/{guid}", status_code=204)
def delete(guid: UUID, db: Session = Depends(get_db)):
    if not prmn_service.delete(db, guid):
        raise HTTPException(status_code=404, detail="Record not found")
