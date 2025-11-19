"""add quantity and unit_value_cents to equipment

Revision ID: b1c2d3e4f5g6
Revises: a1b2c3d4e5f6
Create Date: 2025-01-12 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b1c2d3e4f5g6'
down_revision: Union[str, None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add quantity column with default value 1
    op.add_column('equipment', sa.Column('quantity', sa.Integer(), nullable=False, server_default='1'))
    
    # Add unit_value_cents column (nullable)
    op.add_column('equipment', sa.Column('unit_value_cents', sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column('equipment', 'unit_value_cents')
    op.drop_column('equipment', 'quantity')
