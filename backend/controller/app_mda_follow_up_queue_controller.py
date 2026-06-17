"""Controller for app_mda_follow_up_queue endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from model.schemas import FollowUpQueueCreate, FollowUpQueueUpdate, FollowUpQueueResponse
from service.app_mda_follow_up_queue_service import follow_up_queue_service
from util.database import get_db

router = APIRouter(prefix="/follow_up_queue", tags=["app_mda_follow_up_queue"])


@router.get("/get-all", response_model=list[FollowUpQueueResponse])
def get_all(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return follow_up_queue_service.get_all(db, skip=skip, limit=limit)


@router.get("/get-by-guid/{guid}", response_model=FollowUpQueueResponse)
def get_by_guid(guid: UUID, db: Session = Depends(get_db)):
    obj = follow_up_queue_service.get_by_guid(db, guid)
    if not obj:
        raise HTTPException(status_code=404, detail="Record not found")
    return obj


@router.post("/create", response_model=FollowUpQueueResponse, status_code=201)
def create(payload: FollowUpQueueCreate, db: Session = Depends(get_db)):
    return follow_up_queue_service.create(db, payload.model_dump())


@router.put("/update/{guid}", response_model=FollowUpQueueResponse)
def update(guid: UUID, payload: FollowUpQueueUpdate, db: Session = Depends(get_db)):
    obj = follow_up_queue_service.update(db, guid, payload.model_dump(exclude_unset=True))
    if not obj:
        raise HTTPException(status_code=404, detail="Record not found")
    return obj


@router.delete("/delete/{guid}", status_code=204)
def delete(guid: UUID, db: Session = Depends(get_db)):
    if not follow_up_queue_service.delete(db, guid):
        raise HTTPException(status_code=404, detail="Record not found")
