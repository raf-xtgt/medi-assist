"""Service for app_mda_doctor table."""

from sqlalchemy import or_
from sqlalchemy.orm import Session

from model.app_mda_doctor import AppMdaDoctor
from service.base_service import BaseService


class AppMdaDoctorService(BaseService):
    def __init__(self):
        super().__init__(AppMdaDoctor)

    def fuzzy_search(self, db: Session, search_string: str, limit: int = 20) -> list[AppMdaDoctor]:
        """
        Fuzzy search using PostgreSQL pg_trgm GIN indexes.

        Strategy:
        1. Split the search string into tokens.
        2. Any token matching any column via ILIKE qualifies the row (OR across tokens).
        3. GIN trigram indexes on name, specialty, email accelerate the ILIKE operations.
        4. No ORDER BY similarity() — that forces full table scans and causes timeouts.

        Requires:
          - CREATE EXTENSION IF NOT EXISTS pg_trgm;
          - GIN indexes with gin_trgm_ops on name, specialty, email columns.
        """
        search_string = search_string.strip()
        if not search_string:
            return []

        tokens = search_string.split()

        # Build a filter: ANY token matching ANY searchable column qualifies the row
        token_filters = []
        for token in tokens:
            pattern = f"%{token}%"
            token_filters.append(AppMdaDoctor.name.ilike(pattern))
            token_filters.append(AppMdaDoctor.specialty.ilike(pattern))
            token_filters.append(AppMdaDoctor.email.ilike(pattern))

        return (
            db.query(AppMdaDoctor)
            .filter(or_(*token_filters))
            .limit(limit)
            .all()
        )


doctor_service = AppMdaDoctorService()
