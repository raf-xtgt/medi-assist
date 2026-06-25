"""Service for app_mda_clinic_hdr table."""

from typing import List, Optional
from uuid import UUID

from sqlalchemy.orm import Session
from sqlalchemy import desc

from model.app_mda_clinic_hdr import AppMdaClinicHdr
from service.base_service import BaseService


class AppMdaClinicHdrService(BaseService):
    def __init__(self):
        super().__init__(AppMdaClinicHdr)

    def get_by_slug(self, db: Session, slug: str) -> AppMdaClinicHdr | None:
        return db.query(AppMdaClinicHdr).filter(AppMdaClinicHdr.slug == slug).first()

    def get_by_criteria(
        self, db: Session, user_guid: UUID, limit: int = 100
    ) -> List[AppMdaClinicHdr]:
        return (
            db.query(AppMdaClinicHdr)
            .filter(AppMdaClinicHdr.created_by_guid == user_guid)
            .order_by(desc(AppMdaClinicHdr.created_date))
            .limit(limit)
            .all()
        )


clinic_hdr_service = AppMdaClinicHdrService()
