"""Service for patient triage inference — retrieves and parses doctor/chat information for LLM context."""

from sqlalchemy.orm import Session

from model.app_mda_doctor import AppMdaDoctor
from model.app_mda_lead_chat_transcript import AppMdaLeadChatTranscript
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


def parse_triage_info(db: Session, chat_hdr_guid: str) -> str:
    """
    Retrieve all chat transcript records for a given chat_hdr_guid,
    ordered by created_date ascending, and parse them into a single
    unified conversation string.

    Args:
        db: SQLAlchemy database session.
        chat_hdr_guid: UUID of the chat header to retrieve transcripts for.

    Returns:
        A formatted conversation string with each message on its own line,
        prefixed by the sender label followed by a colon.
        Example:
            bot: Hello! I'm your medi-assist health assistant...
            patient: I have been incredibly exhausted for weeks now...
            bot: ...
            patient: ...
    """
    transcripts = (
        db.query(AppMdaLeadChatTranscript)
        .filter(AppMdaLeadChatTranscript.chat_hdr_guid == chat_hdr_guid)
        .order_by(AppMdaLeadChatTranscript.created_date.asc())
        .all()
    )

    if not transcripts:
        return ""

    lines = []
    for record in transcripts:
        sender = record.sender or "unknown"
        content = record.msg_content or ""
        lines.append(f"{sender}: {content}")

    return "\n".join(lines)
