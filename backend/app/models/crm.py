import uuid
from decimal import Decimal
from enum import Enum
from typing import List, Optional

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import (
    ActivityPriority,
    ActivityStatus,
    EmpresaTipo,
    OpportunityStatus,
    ProposalNoteMode,
    ProposalSignatureStatus,
    ProposalSignatureType,
    ProposalStatus,
)


def default_uuid() -> uuid.UUID:
    return uuid.uuid4()


UUID_PK = UUID(as_uuid=True)


def enum_column(enum_cls: type[Enum], name: str) -> sa.Enum:
    return sa.Enum(
        enum_cls,
        name=name,
        native_enum=True,
        values_callable=lambda enum: [item.value for item in enum],
    )


class Opportunity(Base):
    __tablename__ = "opportunities"

    id: Mapped[uuid.UUID] = mapped_column(
        "id",
        UUID_PK,
        primary_key=True,
        default=default_uuid,
        server_default=sa.text("gen_random_uuid()"),
    )
    title: Mapped[str] = mapped_column("title", sa.Text, nullable=False)
    description: Mapped[Optional[str]] = mapped_column("description", sa.Text)
    value: Mapped[Decimal] = mapped_column(
        "value",
        sa.Numeric(12, 2),
        nullable=False,
        server_default=sa.text("0"),
    )
    status: Mapped[OpportunityStatus] = mapped_column(
        "status",
        enum_column(OpportunityStatus, "opportunity_status"),
        nullable=False,
        server_default=sa.text(f"'{OpportunityStatus.OPEN.value}'"),
    )
    probability: Mapped[Optional[int]] = mapped_column(
        "probability",
        sa.Integer,
        server_default=sa.text("50"),
    )
    next_step: Mapped[Optional[str]] = mapped_column("next_step", sa.Text)
    client_name: Mapped[Optional[str]] = mapped_column("client_name", sa.Text)
    client_email: Mapped[Optional[str]] = mapped_column("client_email", sa.Text)
    responsible_user: Mapped[Optional[str]] = mapped_column("responsible_user", sa.Text)
    tags: Mapped[Optional[List[str]]] = mapped_column(
        "tags",
        ARRAY(sa.Text),
        server_default=sa.text("ARRAY[]::text[]"),
    )
    created_at: Mapped[Optional[sa.DateTime]] = mapped_column(
        "created_at",
        sa.DateTime(timezone=True),
        nullable=False,
        server_default=sa.func.now(),
    )
    updated_at: Mapped[Optional[sa.DateTime]] = mapped_column(
        "updated_at",
        sa.DateTime(timezone=True),
        nullable=False,
        server_default=sa.func.now(),
        onupdate=sa.func.now(),
    )

    activities: Mapped[List["OpportunityActivity"]] = relationship(
        back_populates="opportunity",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    proposals: Mapped[List["Proposal"]] = relationship(
        back_populates="opportunity",
        passive_deletes=True,
    )
    tasks: Mapped[List["Activity"]] = relationship(
        back_populates="opportunity",
        passive_deletes=True,
    )


class OpportunityActivity(Base):
    __tablename__ = "opportunity_activities"

    id: Mapped[uuid.UUID] = mapped_column(
        "id",
        UUID_PK,
        primary_key=True,
        default=default_uuid,
        server_default=sa.text("gen_random_uuid()"),
    )
    opportunity_id: Mapped[uuid.UUID] = mapped_column(
        "opportunity_id",
        UUID_PK,
        sa.ForeignKey("opportunities.id", ondelete="CASCADE"),
        nullable=False,
    )
    action: Mapped[str] = mapped_column("action", sa.Text, nullable=False)
    from_status: Mapped[Optional[OpportunityStatus]] = mapped_column(
        "from_status",
        enum_column(OpportunityStatus, "opportunity_status"),
    )
    to_status: Mapped[Optional[OpportunityStatus]] = mapped_column(
        "to_status",
        enum_column(OpportunityStatus, "opportunity_status"),
    )
    notes: Mapped[Optional[str]] = mapped_column("notes", sa.Text)
    user_id: Mapped[Optional[str]] = mapped_column("user_id", sa.Text)
    created_at: Mapped[Optional[sa.DateTime]] = mapped_column(
        "created_at",
        sa.DateTime(timezone=True),
        nullable=False,
        server_default=sa.func.now(),
    )

    opportunity: Mapped[Opportunity] = relationship(back_populates="activities")


class Proposal(Base):
    __tablename__ = "proposals"
    __table_args__ = (sa.UniqueConstraint("code", name="uq_proposals_code"),)

    id: Mapped[uuid.UUID] = mapped_column(
        "id",
        UUID_PK,
        primary_key=True,
        default=default_uuid,
        server_default=sa.text("gen_random_uuid()"),
    )
    code: Mapped[str] = mapped_column("code", sa.Text, nullable=False)
    title: Mapped[str] = mapped_column("title", sa.Text, nullable=False)
    opportunity_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        "opportunity_id",
        UUID_PK,
        sa.ForeignKey("opportunities.id", ondelete="SET NULL"),
    )
    status: Mapped[ProposalStatus] = mapped_column(
        "status",
        enum_column(ProposalStatus, "proposal_status"),
        nullable=False,
        server_default=sa.text(f"'{ProposalStatus.DRAFT.value}'"),
    )
    client_name: Mapped[str] = mapped_column("client_name", sa.Text, nullable=False)
    client_email: Mapped[Optional[str]] = mapped_column("client_email", sa.Text)
    client_phone: Mapped[Optional[str]] = mapped_column("client_phone", sa.Text)
    company_name: Mapped[Optional[str]] = mapped_column("company_name", sa.Text)
    payment_mode: Mapped[Optional[str]] = mapped_column("payment_mode", sa.Text)
    valid_until: Mapped[Optional[sa.DateTime]] = mapped_column("valid_until", sa.DateTime(timezone=True))
    total_value: Mapped[Decimal] = mapped_column(
        "total_value",
        sa.Numeric(12, 2),
        nullable=False,
        server_default=sa.text("0"),
    )
    discount: Mapped[Optional[Decimal]] = mapped_column(
        "discount",
        sa.Numeric(12, 2),
        server_default=sa.text("0"),
    )
    notes: Mapped[Optional[str]] = mapped_column("notes", sa.Text)
    tags: Mapped[Optional[List[str]]] = mapped_column(
        "tags",
        ARRAY(sa.Text),
        server_default=sa.text("ARRAY[]::text[]"),
    )
    responsible_user: Mapped[Optional[str]] = mapped_column("responsible_user", sa.Text)
    created_at: Mapped[Optional[sa.DateTime]] = mapped_column(
        "created_at",
        sa.DateTime(timezone=True),
        nullable=False,
        server_default=sa.func.now(),
    )
    updated_at: Mapped[Optional[sa.DateTime]] = mapped_column(
        "updated_at",
        sa.DateTime(timezone=True),
        nullable=False,
        server_default=sa.func.now(),
        onupdate=sa.func.now(),
    )

    opportunity: Mapped[Optional[Opportunity]] = relationship(back_populates="proposals")
    items: Mapped[List["ProposalItem"]] = relationship(
        back_populates="proposal",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    activities: Mapped[List["Activity"]] = relationship(back_populates="proposal", passive_deletes=True)


class ProposalItem(Base):
    __tablename__ = "proposal_items"

    id: Mapped[uuid.UUID] = mapped_column(
        "id",
        UUID_PK,
        primary_key=True,
        default=default_uuid,
        server_default=sa.text("gen_random_uuid()"),
    )
    proposal_id: Mapped[uuid.UUID] = mapped_column(
        "proposal_id",
        UUID_PK,
        sa.ForeignKey("proposals.id", ondelete="CASCADE"),
        nullable=False,
    )
    type: Mapped[str] = mapped_column("type", sa.Text, nullable=False)
    name: Mapped[str] = mapped_column("name", sa.Text, nullable=False)
    description: Mapped[Optional[str]] = mapped_column("description", sa.Text)
    quantity: Mapped[Decimal] = mapped_column(
        "quantity",
        sa.Numeric(10, 2),
        nullable=False,
        server_default=sa.text("1"),
    )
    unit_price: Mapped[Decimal] = mapped_column(
        "unit_price",
        sa.Numeric(12, 2),
        nullable=False,
    )
    discount: Mapped[Optional[Decimal]] = mapped_column(
        "discount",
        sa.Numeric(12, 2),
        server_default=sa.text("0"),
    )
    total: Mapped[Decimal] = mapped_column(
        "total",
        sa.Numeric(12, 2),
        nullable=False,
    )
    sort_order: Mapped[int] = mapped_column(
        "order",
        sa.Integer,
        nullable=False,
        server_default=sa.text("0"),
    )
    created_at: Mapped[Optional[sa.DateTime]] = mapped_column(
        "created_at",
        sa.DateTime(timezone=True),
        nullable=False,
        server_default=sa.func.now(),
    )

    proposal: Mapped[Proposal] = relationship(back_populates="items")


class Activity(Base):
    __tablename__ = "activities"

    id: Mapped[uuid.UUID] = mapped_column(
        "id",
        UUID_PK,
        primary_key=True,
        default=default_uuid,
        server_default=sa.text("gen_random_uuid()"),
    )
    title: Mapped[str] = mapped_column("title", sa.Text, nullable=False)
    description: Mapped[Optional[str]] = mapped_column("description", sa.Text)
    status: Mapped[ActivityStatus] = mapped_column(
        "status",
        enum_column(ActivityStatus, "activity_status"),
        nullable=False,
        server_default=sa.text(f"'{ActivityStatus.PENDING.value}'"),
    )
    priority: Mapped[ActivityPriority] = mapped_column(
        "priority",
        enum_column(ActivityPriority, "activity_priority"),
        nullable=False,
        server_default=sa.text(f"'{ActivityPriority.MEDIUM.value}'"),
    )
    proposal_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        "proposal_id",
        UUID_PK,
        sa.ForeignKey("proposals.id", ondelete="CASCADE"),
    )
    opportunity_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        "opportunity_id",
        UUID_PK,
        sa.ForeignKey("opportunities.id", ondelete="CASCADE"),
    )
    assigned_to: Mapped[Optional[str]] = mapped_column("assigned_to", sa.Text)
    due_date: Mapped[Optional[sa.DateTime]] = mapped_column("due_date", sa.DateTime(timezone=True))
    completed_at: Mapped[Optional[sa.DateTime]] = mapped_column("completed_at", sa.DateTime(timezone=True))
    created_at: Mapped[Optional[sa.DateTime]] = mapped_column(
        "created_at",
        sa.DateTime(timezone=True),
        nullable=False,
        server_default=sa.func.now(),
    )
    updated_at: Mapped[Optional[sa.DateTime]] = mapped_column(
        "updated_at",
        sa.DateTime(timezone=True),
        nullable=False,
        server_default=sa.func.now(),
        onupdate=sa.func.now(),
    )

    proposal: Mapped[Optional[Proposal]] = relationship(back_populates="activities")
    opportunity: Mapped[Optional[Opportunity]] = relationship(back_populates="tasks")


class Client(Base):
    __tablename__ = "clients"
    __table_args__ = (
        sa.UniqueConstraint("cpf_cnpj", name="uq_clients_cpf_cnpj"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        "id",
        UUID_PK,
        primary_key=True,
        default=default_uuid,
        server_default=sa.text("gen_random_uuid()"),
    )
    tipo: Mapped[EmpresaTipo] = mapped_column(
        "tipo",
        enum_column(EmpresaTipo, "empresa_tipo"),
        nullable=False,
    )
    cpf_cnpj: Mapped[str] = mapped_column("cpf_cnpj", sa.Text, nullable=False)
    nome: Mapped[Optional[str]] = mapped_column("nome", sa.Text)
    cargo: Mapped[Optional[str]] = mapped_column("cargo", sa.Text)
    cep: Mapped[str] = mapped_column("cep", sa.Text, nullable=False)
    endereco: Mapped[str] = mapped_column("endereco", sa.Text, nullable=False)
    numero: Mapped[str] = mapped_column("numero", sa.Text, nullable=False)
    complemento: Mapped[Optional[str]] = mapped_column("complemento", sa.Text)
    bairro: Mapped[str] = mapped_column("bairro", sa.Text, nullable=False)
    cidade: Mapped[str] = mapped_column("cidade", sa.Text, nullable=False)
    estado: Mapped[str] = mapped_column("estado", sa.Text, nullable=False)
    contato_nome: Mapped[str] = mapped_column("contato_nome", sa.Text, nullable=False)
    contato_email: Mapped[str] = mapped_column("contato_email", sa.Text, nullable=False)
    contato_telefone: Mapped[str] = mapped_column("contato_telefone", sa.Text, nullable=False)
    ativo: Mapped[int] = mapped_column(
        "ativo",
        sa.Integer,
        nullable=False,
        server_default=sa.text("1"),
    )
    created_at: Mapped[Optional[sa.DateTime]] = mapped_column(
        "created_at",
        sa.DateTime(timezone=True),
        nullable=False,
        server_default=sa.func.now(),
    )
    updated_at: Mapped[Optional[sa.DateTime]] = mapped_column(
        "updated_at",
        sa.DateTime(timezone=True),
        nullable=False,
        server_default=sa.func.now(),
        onupdate=sa.func.now(),
    )
    deleted_at: Mapped[Optional[sa.DateTime]] = mapped_column("deleted_at", sa.DateTime(timezone=True))

    contacts: Mapped[List["ClientSecondaryContact"]] = relationship(
        back_populates="client",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class ClientSecondaryContact(Base):
    __tablename__ = "client_secondary_contacts"

    id: Mapped[uuid.UUID] = mapped_column(
        "id",
        UUID_PK,
        primary_key=True,
        default=default_uuid,
        server_default=sa.text("gen_random_uuid()"),
    )
    client_id: Mapped[uuid.UUID] = mapped_column(
        "client_id",
        UUID_PK,
        sa.ForeignKey("clients.id", ondelete="CASCADE"),
        nullable=False,
    )
    nome: Mapped[str] = mapped_column("nome", sa.Text, nullable=False)
    email: Mapped[Optional[str]] = mapped_column("email", sa.Text)
    telefone: Mapped[Optional[str]] = mapped_column("telefone", sa.Text)
    cargo: Mapped[Optional[str]] = mapped_column("cargo", sa.Text)
    created_at: Mapped[Optional[sa.DateTime]] = mapped_column(
        "created_at",
        sa.DateTime(timezone=True),
        nullable=False,
        server_default=sa.func.now(),
    )
    updated_at: Mapped[Optional[sa.DateTime]] = mapped_column(
        "updated_at",
        sa.DateTime(timezone=True),
        nullable=False,
        server_default=sa.func.now(),
        onupdate=sa.func.now(),
    )

    client: Mapped[Client] = relationship(back_populates="contacts")


class Empresa(Base):
    __tablename__ = "empresas"
    __table_args__ = (sa.UniqueConstraint("cpf_cnpj", name="uq_empresas_cpf_cnpj"),)

    id: Mapped[uuid.UUID] = mapped_column(
        "id",
        UUID_PK,
        primary_key=True,
        default=default_uuid,
        server_default=sa.text("gen_random_uuid()"),
    )
    tipo: Mapped[EmpresaTipo] = mapped_column(
        "tipo",
        enum_column(EmpresaTipo, "empresa_tipo"),
        nullable=False,
    )
    cpf_cnpj: Mapped[str] = mapped_column("cpf_cnpj", sa.Text, nullable=False)
    nome: Mapped[Optional[str]] = mapped_column("nome", sa.Text)
    razao_social: Mapped[Optional[str]] = mapped_column("razao_social", sa.Text)
    nome_fantasia: Mapped[Optional[str]] = mapped_column("nome_fantasia", sa.Text)
    logo: Mapped[Optional[str]] = mapped_column("logo", sa.Text)
    contato_nome: Mapped[str] = mapped_column("contato_nome", sa.Text, nullable=False)
    contato_email: Mapped[str] = mapped_column("contato_email", sa.Text, nullable=False)
    contato_telefone: Mapped[str] = mapped_column("contato_telefone", sa.Text, nullable=False)
    cep: Mapped[str] = mapped_column("cep", sa.Text, nullable=False)
    endereco: Mapped[str] = mapped_column("endereco", sa.Text, nullable=False)
    numero: Mapped[str] = mapped_column("numero", sa.Text, nullable=False)
    complemento: Mapped[Optional[str]] = mapped_column("complemento", sa.Text)
    bairro: Mapped[str] = mapped_column("bairro", sa.Text, nullable=False)
    cidade: Mapped[str] = mapped_column("cidade", sa.Text, nullable=False)
    estado: Mapped[str] = mapped_column("estado", sa.Text, nullable=False)
    ativo: Mapped[int] = mapped_column(
        "ativo",
        sa.Integer,
        nullable=False,
        server_default=sa.text("1"),
    )
    created_at: Mapped[Optional[sa.DateTime]] = mapped_column(
        "created_at",
        sa.DateTime(timezone=True),
        nullable=False,
        server_default=sa.func.now(),
    )
    updated_at: Mapped[Optional[sa.DateTime]] = mapped_column(
        "updated_at",
        sa.DateTime(timezone=True),
        nullable=False,
        server_default=sa.func.now(),
        onupdate=sa.func.now(),
    )
    deleted_at: Mapped[Optional[sa.DateTime]] = mapped_column("deleted_at", sa.DateTime(timezone=True))


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[uuid.UUID] = mapped_column(
        "id",
        UUID_PK,
        primary_key=True,
        default=default_uuid,
        server_default=sa.text("gen_random_uuid()"),
    )
    name: Mapped[str] = mapped_column("name", sa.Text, nullable=False)
    color: Mapped[str] = mapped_column("color", sa.Text, nullable=False)
    optional_field: Mapped[Optional[str]] = mapped_column("optional_field", sa.Text)
    created_at: Mapped[Optional[sa.DateTime]] = mapped_column(
        "created_at",
        sa.DateTime(timezone=True),
        nullable=False,
        server_default=sa.func.now(),
    )
    updated_at: Mapped[Optional[sa.DateTime]] = mapped_column(
        "updated_at",
        sa.DateTime(timezone=True),
        nullable=False,
        server_default=sa.func.now(),
        onupdate=sa.func.now(),
    )
    deleted_at: Mapped[Optional[sa.DateTime]] = mapped_column("deleted_at", sa.DateTime(timezone=True))

    items: Mapped[List["Item"]] = relationship(back_populates="category")


class ProposalNote(Base):
    __tablename__ = "proposal_notes"

    id: Mapped[uuid.UUID] = mapped_column(
        "id",
        UUID_PK,
        primary_key=True,
        default=default_uuid,
        server_default=sa.text("gen_random_uuid()"),
    )
    name: Mapped[str] = mapped_column("name", sa.Text, nullable=False)
    description: Mapped[Optional[str]] = mapped_column("description", sa.Text)
    inclusion_mode: Mapped[ProposalNoteMode] = mapped_column(
        "inclusion_mode",
        enum_column(ProposalNoteMode, "proposal_note_mode"),
        nullable=False,
        server_default=sa.text(f"'{ProposalNoteMode.MANUAL.value}'"),
    )
    created_at: Mapped[Optional[sa.DateTime]] = mapped_column(
        "created_at",
        sa.DateTime(timezone=True),
        nullable=False,
        server_default=sa.func.now(),
    )
    updated_at: Mapped[Optional[sa.DateTime]] = mapped_column(
        "updated_at",
        sa.DateTime(timezone=True),
        nullable=False,
        server_default=sa.func.now(),
        onupdate=sa.func.now(),
    )
    deleted_at: Mapped[Optional[sa.DateTime]] = mapped_column("deleted_at", sa.DateTime(timezone=True))


class PaymentMode(Base):
    __tablename__ = "payment_modes"

    id: Mapped[uuid.UUID] = mapped_column(
        "id",
        UUID_PK,
        primary_key=True,
        default=default_uuid,
        server_default=sa.text("gen_random_uuid()"),
    )
    name: Mapped[str] = mapped_column("name", sa.Text, nullable=False)
    installments: Mapped[int] = mapped_column(
        "installments",
        sa.Integer,
        nullable=False,
        server_default=sa.text("1"),
    )
    interest_rate: Mapped[Decimal] = mapped_column(
        "interest_rate",
        sa.Numeric(8, 4),
        nullable=False,
        server_default=sa.text("0"),
    )
    adjustment_rate: Mapped[Decimal] = mapped_column(
        "adjustment_rate",
        sa.Numeric(8, 4),
        nullable=False,
        server_default=sa.text("0"),
    )
    description: Mapped[Optional[str]] = mapped_column("description", sa.Text)
    created_at: Mapped[Optional[sa.DateTime]] = mapped_column(
        "created_at",
        sa.DateTime(timezone=True),
        nullable=False,
        server_default=sa.func.now(),
    )
    updated_at: Mapped[Optional[sa.DateTime]] = mapped_column(
        "updated_at",
        sa.DateTime(timezone=True),
        nullable=False,
        server_default=sa.func.now(),
        onupdate=sa.func.now(),
    )
    deleted_at: Mapped[Optional[sa.DateTime]] = mapped_column("deleted_at", sa.DateTime(timezone=True))


class ProposalSignature(Base):
    __tablename__ = "proposal_signatures"

    id: Mapped[uuid.UUID] = mapped_column(
        "id",
        UUID_PK,
        primary_key=True,
        default=default_uuid,
        server_default=sa.text("gen_random_uuid()"),
    )
    name: Mapped[str] = mapped_column("name", sa.Text, nullable=False)
    cpf: Mapped[str] = mapped_column("cpf", sa.Text, nullable=False)
    email: Mapped[str] = mapped_column("email", sa.Text, nullable=False)
    phone: Mapped[Optional[str]] = mapped_column("phone", sa.Text)
    signature_type: Mapped[ProposalSignatureType] = mapped_column(
        "signature_type",
        enum_column(ProposalSignatureType, "proposal_signature_type"),
        nullable=False,
    )
    status: Mapped[ProposalSignatureStatus] = mapped_column(
        "status",
        enum_column(ProposalSignatureStatus, "proposal_signature_status"),
        nullable=False,
        server_default=sa.text(f"'{ProposalSignatureStatus.PENDING.value}'"),
    )
    govbr_identifier: Mapped[Optional[str]] = mapped_column("govbr_identifier", sa.Text)
    govbr_last_validated_at: Mapped[Optional[sa.DateTime]] = mapped_column(
        "govbr_last_validated_at",
        sa.DateTime(timezone=True),
    )
    signature_image: Mapped[Optional[str]] = mapped_column("signature_image", sa.Text)
    signature_image_mime: Mapped[Optional[str]] = mapped_column("signature_image_mime", sa.Text)
    signature_image_width: Mapped[Optional[int]] = mapped_column("signature_image_width", sa.Integer)
    signature_image_height: Mapped[Optional[int]] = mapped_column("signature_image_height", sa.Integer)
    created_at: Mapped[Optional[sa.DateTime]] = mapped_column(
        "created_at",
        sa.DateTime(timezone=True),
        nullable=False,
        server_default=sa.func.now(),
    )
    updated_at: Mapped[Optional[sa.DateTime]] = mapped_column(
        "updated_at",
        sa.DateTime(timezone=True),
        nullable=False,
        server_default=sa.func.now(),
        onupdate=sa.func.now(),
    )
    deleted_at: Mapped[Optional[sa.DateTime]] = mapped_column("deleted_at", sa.DateTime(timezone=True))


class Item(Base):
    __tablename__ = "items"

    id: Mapped[uuid.UUID] = mapped_column(
        "id",
        UUID_PK,
        primary_key=True,
        default=default_uuid,
        server_default=sa.text("gen_random_uuid()"),
    )
    type: Mapped[str] = mapped_column("type", sa.Text, nullable=False)
    name: Mapped[str] = mapped_column("name", sa.Text, nullable=False)
    description: Mapped[Optional[str]] = mapped_column("description", sa.Text)
    default_price: Mapped[Decimal] = mapped_column(
        "default_price",
        sa.Numeric(12, 2),
        nullable=False,
    )
    unit: Mapped[str] = mapped_column("unit", sa.Text, nullable=False)
    sku: Mapped[Optional[str]] = mapped_column("sku", sa.Text)
    pn: Mapped[Optional[str]] = mapped_column("pn", sa.Text)
    features: Mapped[Optional[str]] = mapped_column("features", sa.Text)
    images: Mapped[Optional[List[str]]] = mapped_column(
        "images",
        ARRAY(sa.Text),
        server_default=sa.text("ARRAY[]::text[]"),
    )
    category_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        "category_id",
        UUID_PK,
        sa.ForeignKey("categories.id", ondelete="SET NULL"),
    )
    active: Mapped[int] = mapped_column(
        "active",
        sa.Integer,
        nullable=False,
        server_default=sa.text("1"),
    )
    created_at: Mapped[Optional[sa.DateTime]] = mapped_column(
        "created_at",
        sa.DateTime(timezone=True),
        nullable=False,
        server_default=sa.func.now(),
    )
    updated_at: Mapped[Optional[sa.DateTime]] = mapped_column(
        "updated_at",
        sa.DateTime(timezone=True),
        nullable=False,
        server_default=sa.func.now(),
        onupdate=sa.func.now(),
    )
    deleted_at: Mapped[Optional[sa.DateTime]] = mapped_column("deleted_at", sa.DateTime(timezone=True))

    category: Mapped[Optional[Category]] = relationship(back_populates="items")
