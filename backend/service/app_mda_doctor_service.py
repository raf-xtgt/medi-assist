"""Service for app_mda_doctor table."""

from sqlalchemy import or_
from sqlalchemy.orm import Session

from model.app_mda_doctor import AppMdaDoctor
from service.base_service import BaseService

# Common words that appear in natural language queries but are NOT
# doctor names or medical specialties. These get filtered out before
# the ILIKE search to prevent false positive matches.
_STOP_WORDS = frozenset([
    # Single-char and short words (caught by length filter too, but explicit)
    "i", "a", "an", "am", "is", "it", "in", "on", "to", "of", "or", "my",
    "me", "we", "he", "do", "no", "so", "up", "at", "be", "by", "if",
    # Common verbs/actions in patient queries
    "need", "want", "have", "get", "see", "find", "book", "make",
    "looking", "search", "seeking", "require", "can", "could", "would",
    "should", "please", "help", "like", "think",
    # Appointment-related words (not doctor attributes)
    "appointment", "visit", "consultation", "session", "schedule",
    "booking", "available", "availability", "slot", "time", "today",
    "tomorrow", "next", "week", "asap", "urgent", "now",
    "doctor", "dr.", "dr",
    # Medical/triage terms (symptoms, conditions, not specialties)
    "emergency", "pain", "ache", "fever", "cold", "cough", "headache",
    "bleeding", "broken", "injury", "sick", "ill", "hurt",
    "amputation", "surgery", "operation", "procedure", "treatment",
    "medicine", "medication", "prescription", "diagnosis",
    "chest", "breath", "breathing", "shortness", "dizziness", "dizzy",
    "nausea", "vomiting", "swelling", "rash", "infection", "allergic",
    "symptoms", "feeling", "feels", "condition", "problem", "issue",
    # Filler words
    "the", "for", "with", "from", "about", "this", "that", "what",
    "who", "how", "when", "where", "some", "any", "just", "very",
    "really", "also", "been", "being", "has", "had", "was", "were",
    "and", "but", "not", "are", "our", "his", "her", "its", "all",
    "near", "nearby", "close", "around", "here",
])

# Minimum token length to be considered as a potential match
_MIN_TOKEN_LENGTH = 3


class AppMdaDoctorService(BaseService):
    def __init__(self):
        super().__init__(AppMdaDoctor)

    def fuzzy_search(self, db: Session, search_string: str, limit: int = 20) -> list[AppMdaDoctor]:
        """
        Fuzzy search using PostgreSQL pg_trgm GIN indexes.

        Strategy:
        1. Split the search string into tokens.
        2. Filter out stop words and short tokens (< 3 chars) to prevent false positives.
        3. Any remaining meaningful token matching name/specialty/email via ILIKE qualifies the row.
        4. GIN trigram indexes on name, specialty, email accelerate the ILIKE operations.

        Returns empty list if no meaningful tokens remain after filtering
        (e.g., "i need emergency amputation" → all tokens are stop words → no results).

        Requires:
          - CREATE EXTENSION IF NOT EXISTS pg_trgm;
          - GIN indexes with gin_trgm_ops on name, specialty, email columns.
        """
        search_string = search_string.strip()
        if not search_string:
            return []

        # Extract meaningful tokens: filter out stop words and short tokens
        tokens = [
            t for t in search_string.lower().split()
            if len(t) >= _MIN_TOKEN_LENGTH and t not in _STOP_WORDS
        ]

        # Also check for "dr" or "dr." prefix — extract the name after it
        raw_tokens = search_string.lower().split()
        for i, t in enumerate(raw_tokens):
            if t in ("dr", "dr.", "doctor") and i + 1 < len(raw_tokens):
                # The token after "dr" is likely a doctor name — always include it
                next_token = raw_tokens[i + 1]
                if next_token not in tokens and len(next_token) >= 2:
                    tokens.append(next_token)

        if not tokens:
            # No meaningful search terms remain → return empty (not a doctor search)
            return []

        # Build a filter: ANY token matching ANY searchable column qualifies the row
        token_filters = []
        for token in tokens:
            pattern = f"%{token}%"
            token_filters.append(AppMdaDoctor.name.ilike(pattern))
            token_filters.append(AppMdaDoctor.specialty.ilike(pattern))

        return (
            db.query(AppMdaDoctor)
            .filter(or_(*token_filters))
            .limit(limit)
            .all()
        )


doctor_service = AppMdaDoctorService()
