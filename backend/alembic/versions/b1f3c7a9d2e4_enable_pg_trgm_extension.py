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


def downgrade() -> None:
    op.execute("DROP EXTENSION IF EXISTS pg_trgm;")
