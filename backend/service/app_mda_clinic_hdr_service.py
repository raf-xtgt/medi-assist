"""Service for app_mda_clinic_hdr table."""

from sqlalchemy.orm import Session

from model.app_mda_clinic_hdr import AppMdaClinicHdr
from service.base_service import BaseService


class AppMdaClinicHdrService(BaseService):
    def __init__(self):
        super().__init__(AppMdaClinicHdr)

    def get_by_slug(self, db: Session, slug: str) -> AppMdaClinicHdr | None:
        return db.query(AppMdaClinicHdr).filter(AppMdaClinicHdr.slug == slug).first()


clinic_hdr_service = AppMdaClinicHdrService()
