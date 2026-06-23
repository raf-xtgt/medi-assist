"""Service for patient triage inference — retrieves and parses doctor information for LLM context."""

from sqlalchemy.orm import Session

from model.app_mda_doctor import AppMdaDoctor
from util.database import get_db


def parse_doctor_info(db: Session, limit: int = 50) -> str:
    """
    Retrieve up to `limit` doctor records and parse their name, specialty, and about
    columns into a human-readable string block for use as LLM context.

    Args:
        db: SQLAlchemy database session.
        limit: Maximum number of doctor records to retrieve (default 50).

    Returns:
        A formatted string with each doctor's info separated by blank lines.
        Example:
            Doctor Name: Aiden Clarke
            Specialty: Family Medicine, Primary Care
            About: Dr. Aiden Clarke is a board-certified ...

            Doctor Name: Priya Nair
            Specialty: General Practice
            About: ...
    """
    doctors = db.query(AppMdaDoctor).limit(limit).all()

    if not doctors:
        return "No doctors found in the system."

    blocks = []
    for doc in doctors:
        name = doc.name or "Unknown"
        specialty = doc.specialty or "Not specified"
        about = doc.about or "No biography available."

        blocks.append(
            f"Doctor Name: {name}\n"
            f"Specialty: {specialty}\n"
            f"About: {about}"
        )

    return "\n\n".join(blocks)
