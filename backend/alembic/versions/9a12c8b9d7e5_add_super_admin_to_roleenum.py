"""add super_admin to roleenum

Revision ID: 9a12c8b9d7e5
Revises: 335ec1438308
Create Date: 2026-05-17 14:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '9a12c8b9d7e5'
down_revision: Union[str, None] = '335ec1438308'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    connection = op.get_bind()
    if connection.dialect.name == "postgresql":
        # ALTER TYPE ADD VALUE cannot run in a transaction block
        op.execute("COMMIT")
        op.execute("ALTER TYPE roleenum ADD VALUE IF NOT EXISTS 'super_admin'")
    else:
        pass

def downgrade() -> None:
    pass
