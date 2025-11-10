import uuid

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models.crm import UUID_PK, default_uuid


class OvertimeRequest(Base):
    __tablename__ = "overtime_requests"

    id: Mapped[uuid.UUID] = mapped_column(
        "id",
        UUID_PK,
        primary_key=True,
        default=default_uuid,
        server_default=sa.text("gen_random_uuid()"),
    )
    employee_name: Mapped[str] = mapped_column("employee_name", sa.Text, nullable=False)
    overtime_date: Mapped[sa.DateTime] = mapped_column("overtime_date", sa.DateTime(timezone=True), nullable=False)
    start_time: Mapped[str] = mapped_column("start_time", sa.Text, nullable=False)
    end_time: Mapped[str] = mapped_column("end_time", sa.Text, nullable=False)
    justification: Mapped[str] = mapped_column("justification", sa.Text, nullable=False)
    status: Mapped[str] = mapped_column(
        "status",
        sa.Text,
        nullable=False,
        server_default=sa.text("'pending'"),
    )
    approved_by: Mapped[str | None] = mapped_column("approved_by", sa.Text)
    approved_at: Mapped[sa.DateTime | None] = mapped_column("approved_at", sa.DateTime(timezone=True))
    rejection_reason: Mapped[str | None] = mapped_column("rejection_reason", sa.Text)
    created_at: Mapped[sa.DateTime] = mapped_column(
        "created_at",
        sa.DateTime(timezone=True),
        nullable=False,
        server_default=sa.func.now(),
    )
    updated_at: Mapped[sa.DateTime] = mapped_column(
        "updated_at",
        sa.DateTime(timezone=True),
        nullable=False,
        server_default=sa.func.now(),
        onupdate=sa.func.now(),
    )


class ExpenseReport(Base):
    __tablename__ = "expense_reports"

    id: Mapped[uuid.UUID] = mapped_column(
        "id",
        UUID_PK,
        primary_key=True,
        default=default_uuid,
        server_default=sa.text("gen_random_uuid()"),
    )
    employee_name: Mapped[str] = mapped_column("employee_name", sa.Text, nullable=False)
    expense_date: Mapped[sa.DateTime] = mapped_column("expense_date", sa.DateTime(timezone=True), nullable=False)
    category: Mapped[str] = mapped_column("category", sa.Text, nullable=False)
    category_other: Mapped[str | None] = mapped_column("category_other", sa.Text)
    event_name: Mapped[str] = mapped_column("event_name", sa.Text, nullable=False)
    transport_type: Mapped[str | None] = mapped_column("transport_type", sa.Text)
    transport_other: Mapped[str | None] = mapped_column("transport_other", sa.Text)
    amount: Mapped[sa.Numeric] = mapped_column(
        "amount",
        sa.Numeric(10, 2),
        nullable=False,
    )
    status: Mapped[str] = mapped_column(
        "status",
        sa.Text,
        nullable=False,
        server_default=sa.text("'pending'"),
    )
    approved_by: Mapped[str | None] = mapped_column("approved_by", sa.Text)
    approved_at: Mapped[sa.DateTime | None] = mapped_column("approved_at", sa.DateTime(timezone=True))
    rejection_reason: Mapped[str | None] = mapped_column("rejection_reason", sa.Text)
    created_at: Mapped[sa.DateTime] = mapped_column(
        "created_at",
        sa.DateTime(timezone=True),
        nullable=False,
        server_default=sa.func.now(),
    )
    updated_at: Mapped[sa.DateTime] = mapped_column(
        "updated_at",
        sa.DateTime(timezone=True),
        nullable=False,
        server_default=sa.func.now(),
        onupdate=sa.func.now(),
    )
