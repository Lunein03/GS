"""add event start_end dates and status

Revision ID: a1b2c3d4e5f6
Revises: 25d3ced2f0c7
Create Date: 2025-11-10 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = '25d3ced2f0c7'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create event_status enum
    op.execute("CREATE TYPE event_status AS ENUM ('pending', 'completed')")
    
    # Add new columns
    op.add_column('events', sa.Column('start_date', sa.DateTime(timezone=True), nullable=True))
    op.add_column('events', sa.Column('end_date', sa.DateTime(timezone=True), nullable=True))
    op.add_column('events', sa.Column('status', sa.Enum('pending', 'completed', name='event_status'), 
                                      server_default='pending', nullable=False))
    
    # Migrate existing data: copy 'date' to both 'start_date' and 'end_date'
    op.execute("UPDATE events SET start_date = date, end_date = date WHERE start_date IS NULL")
    
    # Make start_date and end_date NOT NULL after migration
    op.alter_column('events', 'start_date', nullable=False)
    op.alter_column('events', 'end_date', nullable=False)
    
    # Drop old date column
    op.drop_column('events', 'date')


def downgrade() -> None:
    # Add back the old date column
    op.add_column('events', sa.Column('date', sa.DateTime(timezone=True), nullable=True))
    
    # Migrate data back: use start_date as the date
    op.execute("UPDATE events SET date = start_date WHERE date IS NULL")
    
    # Make date NOT NULL
    op.alter_column('events', 'date', nullable=False)
    
    # Drop new columns
    op.drop_column('events', 'status')
    op.drop_column('events', 'end_date')
    op.drop_column('events', 'start_date')
    
    # Drop enum type
    op.execute("DROP TYPE event_status")
