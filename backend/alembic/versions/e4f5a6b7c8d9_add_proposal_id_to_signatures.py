"""add proposal_id to proposal_signatures if missing

Revision ID: e4f5a6b7c8d9
Revises: d1e2f3g4h5i6
Create Date: 2026-02-26 14:30:00.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "e4f5a6b7c8d9"
down_revision = "d1e2f3g4h5i6"
branch_labels = None
depends_on = None

TABLE_NAME = "proposal_signatures"
COLUMN_NAME = "proposal_id"
FK_NAME = "fk_proposal_signatures_proposal_id_proposals"
INDEX_NAME = "ix_proposal_signatures_proposal_id"


def _has_column(bind, table_name: str, column_name: str) -> bool:
    inspector = sa.inspect(bind)
    return any(column["name"] == column_name for column in inspector.get_columns(table_name))


def _has_fk(bind, table_name: str, fk_name: str) -> bool:
    inspector = sa.inspect(bind)
    return any(fk.get("name") == fk_name for fk in inspector.get_foreign_keys(table_name))


def _has_index(bind, table_name: str, index_name: str) -> bool:
    inspector = sa.inspect(bind)
    return any(index.get("name") == index_name for index in inspector.get_indexes(table_name))


def upgrade() -> None:
    bind = op.get_bind()

    if not _has_column(bind, TABLE_NAME, COLUMN_NAME):
        op.add_column(TABLE_NAME, sa.Column(COLUMN_NAME, sa.UUID(), nullable=True))

    if not _has_fk(bind, TABLE_NAME, FK_NAME):
        op.create_foreign_key(
            FK_NAME,
            TABLE_NAME,
            "proposals",
            [COLUMN_NAME],
            ["id"],
            ondelete="CASCADE",
        )

    if not _has_index(bind, TABLE_NAME, INDEX_NAME):
        op.create_index(INDEX_NAME, TABLE_NAME, [COLUMN_NAME], unique=False)


def downgrade() -> None:
    bind = op.get_bind()

    if _has_index(bind, TABLE_NAME, INDEX_NAME):
        op.drop_index(INDEX_NAME, table_name=TABLE_NAME)

    if _has_fk(bind, TABLE_NAME, FK_NAME):
        op.drop_constraint(FK_NAME, TABLE_NAME, type_="foreignkey")

    if _has_column(bind, TABLE_NAME, COLUMN_NAME):
        op.drop_column(TABLE_NAME, COLUMN_NAME)
