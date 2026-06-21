"""enable pg_trgm extension

Revision ID: b1f3c7a9d2e4
Revises: 55a5a412068c
Create Date: 2026-06-21 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = 'b1f3c7a9d2e4'
down_revision: Union[str, None] = '55a5a412068c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm;")
    # GIN trigram indexes for fast ILIKE and similarity searches
    op.execute(
        "CREATE INDEX IF NOT EXISTS idx_doctor_name_trgm ON app_mda_doctor USING GIN (name gin_trgm_ops);"
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS idx_doctor_specialty_trgm ON app_mda_doctor USING GIN (specialty gin_trgm_ops);"
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS idx_doctor_email_trgm ON app_mda_doctor USING GIN (email gin_trgm_ops);"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS idx_doctor_email_trgm;")
    op.execute("DROP INDEX IF EXISTS idx_doctor_specialty_trgm;")
    op.execute("DROP INDEX IF EXISTS idx_doctor_name_trgm;")
    op.execute("DROP EXTENSION IF EXISTS pg_trgm;")
