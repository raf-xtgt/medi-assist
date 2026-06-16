"""Generic CRUD service used by all table-specific services."""

import uuid
from typing import Any, Type

from sqlalchemy.orm import Session

from model.base import Base


class BaseService:
    """Provides reusable CRUD operations for any SQLAlchemy model."""

    def __init__(self, model: Type[Base]):
        self.model = model

    def get_all(self, db: Session, skip: int = 0, limit: int = 100) -> list:
        return db.query(self.model).offset(skip).limit(limit).all()

    def get_by_guid(self, db: Session, guid: uuid.UUID) -> Any | None:
        return db.query(self.model).filter(self.model.guid == guid).first()

    def create(self, db: Session, data: dict) -> Any:
        data["guid"] = uuid.uuid4()
        obj = self.model(**data)
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    def update(self, db: Session, guid: uuid.UUID, data: dict) -> Any | None:
        obj = self.get_by_guid(db, guid)
        if not obj:
            return None
        for key, value in data.items():
            if value is not None:
                setattr(obj, key, value)
        db.commit()
        db.refresh(obj)
        return obj

    def delete(self, db: Session, guid: uuid.UUID) -> bool:
        obj = self.get_by_guid(db, guid)
        if not obj:
            return False
        db.delete(obj)
        db.commit()
        return True
