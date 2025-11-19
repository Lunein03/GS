"""
Add quantity column to event_equipment

Revision ID: c0d1e2f3g4h5
Revises: b7c8d9e0f1a2
Create Date: 2025-11-19 12:00:00.000000
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "c0d1e2f3g4h5"
down_revision = "b7c8d9e0f1a2"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("event_equipment") as batch_op:
        batch_op.add_column(sa.Column("quantity", sa.Integer(), nullable=False, server_default="1"))

    op.alter_column("event_equipment", "quantity", server_default=None)


def downgrade() -> None:
    with op.batch_alter_table("event_equipment") as batch_op:
        batch_op.drop_column("quantity")
