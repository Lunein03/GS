import uuid
from typing import List

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import EquipmentStatus

from .crm import UUID_PK, default_uuid, enum_column


class Equipment(Base):
    __tablename__ = "equipment"
    __table_args__ = (sa.UniqueConstraint("code", name="uq_equipment_code"),)

    id: Mapped[uuid.UUID] = mapped_column(
        "id",
        UUID_PK,
        primary_key=True,
        default=default_uuid,
        server_default=sa.text("gen_random_uuid()"),
    )
    code: Mapped[str] = mapped_column("code", sa.Text, nullable=False)
    name: Mapped[str] = mapped_column("name", sa.Text, nullable=False)
    category: Mapped[str] = mapped_column("category", sa.Text, nullable=False)
    brand: Mapped[str | None] = mapped_column("brand", sa.Text)
    model: Mapped[str | None] = mapped_column("model", sa.Text)
    serial_number: Mapped[str | None] = mapped_column("serial_number", sa.Text)
    acquisition_date: Mapped[sa.DateTime] = mapped_column(
        "acquisition_date",
        sa.DateTime(timezone=True),
        nullable=False,
    )
    status: Mapped[EquipmentStatus] = mapped_column(
        "status",
        enum_column(EquipmentStatus, "equipment_status"),
        nullable=False,
        server_default=sa.text(f"'{EquipmentStatus.AVAILABLE.value}'"),
    )
    location: Mapped[str | None] = mapped_column("location", sa.Text)
    notes: Mapped[str | None] = mapped_column("notes", sa.Text)
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
    deleted_at: Mapped[sa.DateTime | None] = mapped_column("deleted_at", sa.DateTime(timezone=True))

    events: Mapped[List["Event"]] = relationship(
        secondary="event_equipment",
        back_populates="equipment",
        passive_deletes=True,
    )


class Event(Base):
    __tablename__ = "events"

    id: Mapped[uuid.UUID] = mapped_column(
        "id",
        UUID_PK,
        primary_key=True,
        default=default_uuid,
        server_default=sa.text("gen_random_uuid()"),
    )
    name: Mapped[str] = mapped_column("name", sa.Text, nullable=False)
    date: Mapped[sa.DateTime] = mapped_column("date", sa.DateTime(timezone=True), nullable=False)
    location: Mapped[str] = mapped_column("location", sa.Text, nullable=False)
    notes: Mapped[str | None] = mapped_column("notes", sa.Text)
    created_at: Mapped[sa.DateTime] = mapped_column(
        "created_at",
        sa.DateTime(timezone=True),
        nullable=False,
        server_default=sa.func.now(),
    )
    deleted_at: Mapped[sa.DateTime | None] = mapped_column("deleted_at", sa.DateTime(timezone=True))

    equipment: Mapped[List[Equipment]] = relationship(
        secondary="event_equipment",
        back_populates="events",
    )


class EventEquipment(Base):
    __tablename__ = "event_equipment"
    __table_args__ = (
        sa.PrimaryKeyConstraint("event_id", "equipment_id", name="pk_event_equipment"),
    )

    event_id: Mapped[uuid.UUID] = mapped_column(
        "event_id",
        UUID_PK,
        sa.ForeignKey("events.id", ondelete="CASCADE"),
        nullable=False,
    )
    equipment_id: Mapped[uuid.UUID] = mapped_column(
        "equipment_id",
        UUID_PK,
        sa.ForeignKey("equipment.id", ondelete="CASCADE"),
        nullable=False,
    )
    created_at: Mapped[sa.DateTime] = mapped_column(
        "created_at",
        sa.DateTime(timezone=True),
        nullable=False,
        server_default=sa.func.now(),
    )
