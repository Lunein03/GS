from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models import (
    PaymentMode,
    Proposal,
    ProposalItem,
    ProposalNote,
    ProposalSignature,
    ProposalHistory,
)
from app.models.enums import ProposalHistoryEventType
from app.schemas.proposals import (
    PaymentModeCreate,
    PaymentModeRead,
    PaymentModeUpdate,
    ProposalCreate,
    ProposalItemCreate,
    ProposalItemRead,
    ProposalItemUpdate,
    ProposalNoteCreate,
    ProposalNoteRead,
    ProposalNoteUpdate,
    ProposalRead,
    ProposalSignatureCreate,
    ProposalSignatureRead,
    ProposalSignatureUpdate,
    ProposalStatusPayload,
    ProposalUpdate,
)

router = APIRouter(prefix="/proposals", tags=["proposals"])


def fetch_proposal_or_404(db: Session, proposal_id: UUID) -> Proposal:
    proposal = (
        db.query(Proposal)
        .filter(Proposal.id == proposal_id)
        .options()
        .first()
    )
    if not proposal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proposal not found")
    return proposal


def log_history(
    db: Session,
    proposal_id: UUID,
    event_type: ProposalHistoryEventType,
    title: str,
    user_id: str | None = None,
    description: str | None = None,
    meta_data: dict | None = None,
) -> None:
    history = ProposalHistory(
        proposal_id=proposal_id,
        event_type=event_type,
        title=title,
        description=description,
        meta_data=meta_data,
        user_id=user_id or "System",
    )
    db.add(history)


# Notes - Must come before /{proposal_id} routes


def fetch_note_or_404(db: Session, note_id: UUID) -> ProposalNote:
    note = db.get(ProposalNote, note_id)
    if not note or note.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proposal note not found")
    return note


@router.get("/notes", response_model=list[ProposalNoteRead])
def list_notes(db: Session = Depends(get_db)) -> list[ProposalNote]:
    return (
        db.query(ProposalNote)
        .filter(ProposalNote.deleted_at.is_(None))
        .order_by(ProposalNote.created_at.desc())
        .all()
    )


@router.post("/notes", response_model=ProposalNoteRead, status_code=status.HTTP_201_CREATED)
def create_note(payload: ProposalNoteCreate, db: Session = Depends(get_db)) -> ProposalNote:
    note = ProposalNote(
        name=payload.name,
        description=payload.description,
        inclusion_mode=payload.inclusion_mode,
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.put("/notes/{note_id}", response_model=ProposalNoteRead)
def update_note(note_id: UUID, payload: ProposalNoteUpdate, db: Session = Depends(get_db)) -> ProposalNote:
    note = fetch_note_or_404(db, note_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(note, field, value)
    note.updated_at = datetime.now(timezone.utc)
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.delete(
    "/notes/{note_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
def delete_note(note_id: UUID, db: Session = Depends(get_db)) -> Response:
    note = fetch_note_or_404(db, note_id)
    note.deleted_at = datetime.now(timezone.utc)
    db.add(note)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# Payment Modes - Must come before /{proposal_id} routes


def fetch_payment_mode_or_404(db: Session, payment_mode_id: UUID) -> PaymentMode:
    payment_mode = db.get(PaymentMode, payment_mode_id)
    if not payment_mode or payment_mode.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment mode not found")
    return payment_mode


@router.get("/payment-modes", response_model=list[PaymentModeRead])
def list_payment_modes(db: Session = Depends(get_db)) -> list[PaymentMode]:
    return (
        db.query(PaymentMode)
        .filter(PaymentMode.deleted_at.is_(None))
        .order_by(PaymentMode.created_at.desc())
        .all()
    )


@router.post("/payment-modes", response_model=PaymentModeRead, status_code=status.HTTP_201_CREATED)
def create_payment_mode(payload: PaymentModeCreate, db: Session = Depends(get_db)) -> PaymentMode:
    payment_mode = PaymentMode(
        name=payload.name,
        installments=payload.installments,
        interest_rate=payload.interest_rate,
        adjustment_rate=payload.adjustment_rate,
        description=payload.description,
    )
    db.add(payment_mode)
    db.commit()
    db.refresh(payment_mode)
    return payment_mode


@router.put("/payment-modes/{payment_mode_id}", response_model=PaymentModeRead)
def update_payment_mode(
    payment_mode_id: UUID,
    payload: PaymentModeUpdate,
    db: Session = Depends(get_db),
) -> PaymentMode:
    payment_mode = fetch_payment_mode_or_404(db, payment_mode_id)

    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(payment_mode, field, value)

    payment_mode.updated_at = datetime.now(timezone.utc)
    db.add(payment_mode)
    db.commit()
    db.refresh(payment_mode)
    return payment_mode


@router.delete(
    "/payment-modes/{payment_mode_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
def delete_payment_mode(payment_mode_id: UUID, db: Session = Depends(get_db)) -> Response:
    payment_mode = fetch_payment_mode_or_404(db, payment_mode_id)
    payment_mode.deleted_at = datetime.now(timezone.utc)
    db.add(payment_mode)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# Signatures - Must come before /{proposal_id} routes


def fetch_signature_or_404(db: Session, signature_id: UUID) -> ProposalSignature:
    signature = db.get(ProposalSignature, signature_id)
    if not signature or signature.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proposal signature not found")
    return signature


@router.get("/signatures", response_model=list[ProposalSignatureRead])
def list_signatures(
    proposal_id: UUID | None = Query(default=None),
    db: Session = Depends(get_db),
) -> list[ProposalSignature]:
    query = (
        db.query(ProposalSignature)
        .filter(
            ProposalSignature.deleted_at.is_(None),
            ProposalSignature.proposal_id.is_not(None),
        )
    )
    if proposal_id:
        query = query.filter(ProposalSignature.proposal_id == proposal_id)

    return query.order_by(ProposalSignature.created_at.desc()).all()


@router.post("/signatures", response_model=ProposalSignatureRead, status_code=status.HTTP_201_CREATED)
def create_signature(payload: ProposalSignatureCreate, db: Session = Depends(get_db)) -> ProposalSignature:
    proposal = db.get(Proposal, payload.proposal_id)
    if not proposal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proposal not found")

    signature = ProposalSignature(
        name=payload.name,
        cpf=payload.cpf,
        email=payload.email,
        phone=payload.phone,
        signature_type=payload.signature_type,
        status=payload.status,
        govbr_identifier=payload.govbr_identifier,
        proposal_id=payload.proposal_id,
    )
    db.add(signature)
    db.commit()
    db.refresh(signature)
    return signature


@router.put("/signatures/{signature_id}", response_model=ProposalSignatureRead)
def update_signature(
    signature_id: UUID,
    payload: ProposalSignatureUpdate,
    db: Session = Depends(get_db),
) -> ProposalSignature:
    signature = fetch_signature_or_404(db, signature_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(signature, field, value)
    signature.updated_at = datetime.now(timezone.utc)
    db.add(signature)
    db.commit()
    db.refresh(signature)
    return signature


@router.delete(
    "/signatures/{signature_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
def delete_signature(signature_id: UUID, db: Session = Depends(get_db)) -> Response:
    signature = fetch_signature_or_404(db, signature_id)
    signature.deleted_at = datetime.now(timezone.utc)
    db.add(signature)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# Proposals - General routes


@router.get("/", response_model=list[ProposalRead])
def list_proposals(db: Session = Depends(get_db)) -> list[Proposal]:
    return (
        db.query(Proposal)
        .order_by(Proposal.created_at.desc())
        .all()
    )


@router.post("/", response_model=ProposalRead, status_code=status.HTTP_201_CREATED)
def create_proposal(payload: ProposalCreate, db: Session = Depends(get_db)) -> Proposal:
    existing = (
        db.query(Proposal)
        .filter(Proposal.code == payload.code)
        .first()
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Proposal code already in use.")

    proposal = Proposal(
        code=payload.code,
        title=payload.title,
        opportunity_id=payload.opportunity_id,
        status=payload.status,
        client_name=payload.client_name,
        client_email=payload.client_email,
        client_phone=payload.client_phone,
        company_name=payload.company_name,
        payment_mode=payload.payment_mode,
        valid_until=payload.valid_until,
        total_value=payload.total_value,
        discount=payload.discount,
        notes=payload.notes,
        tags=payload.tags or [],
        responsible_user=payload.responsible_user,
    )
    db.add(proposal)
    db.flush()

    if payload.items:
        for item in payload.items:
            db.add(
                ProposalItem(
                    proposal_id=proposal.id,
                    type=item.type,
                    name=item.name,
                    description=item.description,
                    quantity=item.quantity,
                    unit_price=item.unit_price,
                    discount=item.discount,
                    total=item.total,
                    sort_order=item.sort_order or 0,
                )
            )

    log_history(
        db,
        proposal.id,
        ProposalHistoryEventType.CREATE,
        "Proposta Criada",
        description=f"Proposta inicial criada com status {payload.status.value}",
        user_id=payload.responsible_user,
    )

    db.commit()
    db.refresh(proposal)
    return proposal


@router.get("/{proposal_id}", response_model=ProposalRead)
def get_proposal(proposal_id: UUID, db: Session = Depends(get_db)) -> Proposal:
    proposal = fetch_proposal_or_404(db, proposal_id)
    return proposal


@router.patch("/{proposal_id}", response_model=ProposalRead)
def update_proposal(
    proposal_id: UUID,
    payload: ProposalUpdate,
    db: Session = Depends(get_db),
) -> Proposal:
    proposal = fetch_proposal_or_404(db, proposal_id)

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(proposal, field, value)

    proposal.updated_at = datetime.now(timezone.utc)
    db.add(proposal)
    log_history(
        db,
        proposal.id,
        ProposalHistoryEventType.UPDATE,
        "Proposta Atualizada",
        description="Dados gerais da proposta foram atualizados.",
    )

    db.commit()
    db.refresh(proposal)
    return proposal


@router.post("/{proposal_id}/status", response_model=ProposalRead)
def change_status(proposal_id: UUID, payload: ProposalStatusPayload, db: Session = Depends(get_db)) -> Proposal:
    proposal = fetch_proposal_or_404(db, proposal_id)
    proposal.status = payload.status
    proposal.updated_at = datetime.now(timezone.utc)
    db.add(proposal)
    log_history(
        db,
        proposal.id,
        ProposalHistoryEventType.STATUS_CHANGE,
        f"Status alterado: {payload.status.value}",
        description=f"Status da proposta alterado para {payload.status.value}",
        meta_data={"from": proposal.status, "to": payload.status}
    )

    db.commit()
    db.refresh(proposal)
    return proposal


@router.delete(
    "/{proposal_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
def delete_proposal(proposal_id: UUID, db: Session = Depends(get_db)) -> Response:
    proposal = fetch_proposal_or_404(db, proposal_id)
    db.delete(proposal)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{proposal_id}/items", response_model=ProposalItemRead, status_code=status.HTTP_201_CREATED)
def add_item(proposal_id: UUID, payload: ProposalItemCreate, db: Session = Depends(get_db)) -> ProposalItem:
    proposal = fetch_proposal_or_404(db, proposal_id)
    item = ProposalItem(
        proposal_id=proposal.id,
        type=payload.type,
        name=payload.name,
        description=payload.description,
        quantity=payload.quantity,
        unit_price=payload.unit_price,
        discount=payload.discount,
        total=payload.total,
        sort_order=payload.sort_order or 0,
    )
    db.add(item)
    log_history(
        db,
        proposal.id,
        ProposalHistoryEventType.UPDATE,
        "Item Adicionado",
        description=f"Item '{payload.name}' adicionado à proposta.",
    )

    db.commit()
    db.refresh(item)
    return item


def fetch_item_or_404(db: Session, proposal_id: UUID, item_id: UUID) -> ProposalItem:
    item = (
        db.query(ProposalItem)
        .filter(ProposalItem.id == item_id, ProposalItem.proposal_id == proposal_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proposal item not found")
    return item


@router.patch("/{proposal_id}/items/{item_id}", response_model=ProposalItemRead)
def update_item(
    proposal_id: UUID,
    item_id: UUID,
    payload: ProposalItemUpdate,
    db: Session = Depends(get_db),
) -> ProposalItem:
    fetch_proposal_or_404(db, proposal_id)
    item = fetch_item_or_404(db, proposal_id, item_id)

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)

    db.add(item)
    log_history(
        db,
        proposal_id,
        ProposalHistoryEventType.UPDATE,
        "Item Atualizado",
        description=f"Item '{item.name}' foi atualizado.",
    )

    db.commit()
    db.refresh(item)
    return item


@router.delete(
    "/{proposal_id}/items/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
def delete_item(proposal_id: UUID, item_id: UUID, db: Session = Depends(get_db)) -> Response:
    fetch_proposal_or_404(db, proposal_id)
    item = fetch_item_or_404(db, proposal_id, item_id)
    item_name = item.name  # Save name before deletion
    db.delete(item)
    
    log_history(
        db,
        proposal_id,
        ProposalHistoryEventType.UPDATE,
        "Item Removido",
        description=f"Item '{item_name}' removido da proposta.",
    )

    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
