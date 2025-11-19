"""
Add quantity and unit_value_cents columns to equipment

Revision ID: b7c8d9e0f1a2
Revises: a1b2c3d4e5f6
Create Date: 2025-11-12 17:12:00.000000
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'b7c8d9e0f1a2'
down_revision = 'a1b2c3d4e5f6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add columns; use server_default for non-nullable to backfill then remove default
    with op.batch_alter_table('equipment') as batch_op:
        batch_op.add_column(sa.Column('quantity', sa.Integer(), nullable=False, server_default='1'))
        batch_op.add_column(sa.Column('unit_value_cents', sa.Integer(), nullable=True))

    # Remove server default to align with application-level handling
    op.alter_column('equipment', 'quantity', server_default=None)


def downgrade() -> None:
    with op.batch_alter_table('equipment') as batch_op:
        batch_op.drop_column('unit_value_cents')
        batch_op.drop_column('quantity')
