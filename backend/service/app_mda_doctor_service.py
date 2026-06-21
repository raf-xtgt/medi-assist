"""Service for app_mda_doctor table."""

from sqlalchemy import or_, func, text
from sqlalchemy.orm import Session

from model.app_mda_doctor import AppMdaDoctor
from service.base_service import BaseService


class AppMdaDoctorService(BaseService):
    def __init__(self):
        super().__init__(AppMdaDoctor)

    def fuzzy_search(self, db: Session, search_string: str, limit: int = 20) -> list[AppMdaDoctor]:
        """
        True fuzzy search using PostgreSQL pg_trgm extension.

        Strategy:
        1. Split the search string into tokens.
        2. Any token matching any column via ILIKE qualifies the row (OR across tokens).
        3. Results are ordered by trigram similarity score (best match first).

        Requires: CREATE EXTENSION IF NOT EXISTS pg_trgm;
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

        # Trigram similarity score for ordering (higher = better match)
        similarity_expr = func.greatest(
            func.similarity(func.coalesce(AppMdaDoctor.name, ''), search_string),
            func.similarity(func.coalesce(AppMdaDoctor.specialty, ''), search_string),
        )

        return (
            db.query(AppMdaDoctor)
            .filter(or_(*token_filters))
            .order_by(similarity_expr.desc())
            .limit(limit)
            .all()
        )


doctor_service = AppMdaDoctorService()
