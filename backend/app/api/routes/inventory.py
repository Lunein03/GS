from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Body, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_db
from app.models import Equipment, Event, EventEquipment
from app.models.enums import EquipmentStatus, EventStatus
from app.schemas.inventory import (
    EquipmentCreate,
    EquipmentRead,
    EquipmentReconcileResponse,
    EquipmentUpdate,
    EventCreate,
    EventEquipmentAllocation,
    EventRead,
    EventUpdate,
)

router = APIRouter(prefix="/inventory", tags=["inventory"])


def equipment_has_active_events(
    db: Session,
    equipment_id: UUID,
    excluding_event_id: Optional[UUID] = None,
) -> bool:
    query = (
        db.query(EventEquipment.event_id)
        .join(Event, EventEquipment.event_id == Event.id)
        .filter(
            EventEquipment.equipment_id == equipment_id,
            Event.status != EventStatus.COMPLETED,
            Event.deleted_at.is_(None),
        )
    )
    if excluding_event_id:
        query = query.filter(EventEquipment.event_id != excluding_event_id)
    return query.first() is not None


def mark_equipment_available_if_unused(
    db: Session,
    equipment: Equipment,
    excluding_event_id: Optional[UUID] = None,
) -> None:
    if equipment.status != EquipmentStatus.IN_USE:
        return
    if equipment_has_active_events(db, equipment.id, excluding_event_id):
        return
    equipment.status = EquipmentStatus.AVAILABLE
    equipment.updated_at = datetime.now(timezone.utc)
    db.add(equipment)


def mark_equipment_in_use(db: Session, equipment: Equipment) -> None:
    if equipment.status == EquipmentStatus.IN_USE:
        return
    if equipment.status != EquipmentStatus.AVAILABLE:
        return
    equipment.status = EquipmentStatus.IN_USE
    equipment.updated_at = datetime.now(timezone.utc)
    db.add(equipment)


def get_event_or_404(db: Session, event_id: UUID) -> Event:
    event = db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    return event


def get_equipment_or_404(db: Session, equipment_id: UUID) -> Equipment:
    equipment = db.get(Equipment, equipment_id)
    if not equipment or equipment.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Equipment not found")
    return equipment


def link_equipment_to_event(db: Session, event: Event, equipment: Equipment, quantity: int) -> EventEquipment:
    if quantity < 1:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Quantity must be at least 1")

    link = (
        db.query(EventEquipment)
        .filter(
            EventEquipment.event_id == event.id,
            EventEquipment.equipment_id == equipment.id,
        )
        .first()
    )
    if link:
        link.quantity = quantity
    else:
        link = EventEquipment(
            event_id=event.id,
            equipment_id=equipment.id,
            quantity=quantity,
        )
        db.add(link)

    mark_equipment_in_use(db, equipment)
    return link


def serialize_event(event: Event) -> EventRead:
    allocations = [
        EventEquipmentAllocation(
            equipment_id=association.equipment_id,
            quantity=association.quantity,
        )
        for association in event.equipment_associations
    ]
    return EventRead(
        id=event.id,
        name=event.name,
        start_date=event.start_date,
        end_date=event.end_date,
        location=event.location,
        notes=event.notes,
        status=event.status,
        created_at=event.created_at,
        deleted_at=event.deleted_at,
        equipment_ids=[allocation.equipment_id for allocation in allocations],
        equipment_allocations=allocations,
    )


@router.get("/equipment", response_model=list[EquipmentRead])
def list_equipment(
    status_filter: Optional[EquipmentStatus] = Query(default=None, alias="status"),
    include_deleted: bool = Query(default=False, description="Include soft-deleted equipment"),
    db: Session = Depends(get_db),
) -> list[Equipment]:
    query = db.query(Equipment)
    if not include_deleted:
        query = query.filter(Equipment.deleted_at.is_(None))
    if status_filter:
        query = query.filter(Equipment.status == status_filter)
    return query.order_by(Equipment.created_at.desc()).all()


@router.post("/equipment", response_model=EquipmentRead, status_code=status.HTTP_201_CREATED)
def create_equipment(payload: EquipmentCreate, db: Session = Depends(get_db)) -> Equipment:
    equipment = Equipment(**payload.model_dump())
    db.add(equipment)
    db.commit()
    db.refresh(equipment)
    return equipment


@router.get("/equipment/{equipment_id}", response_model=EquipmentRead)
def get_equipment(equipment_id: UUID, db: Session = Depends(get_db)) -> Equipment:
    equipment = db.get(Equipment, equipment_id)
    if not equipment or equipment.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Equipment not found")
    return equipment


@router.put("/equipment/{equipment_id}", response_model=EquipmentRead)
def update_equipment(
    equipment_id: UUID,
    payload: EquipmentUpdate,
    db: Session = Depends(get_db),
) -> Equipment:
    equipment = db.get(Equipment, equipment_id)
    if not equipment or equipment.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Equipment not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(equipment, field, value)

    equipment.updated_at = datetime.now(timezone.utc)
    db.add(equipment)
    db.commit()
    db.refresh(equipment)
    return equipment


@router.delete(
    "/equipment/{equipment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
def delete_equipment(equipment_id: UUID, db: Session = Depends(get_db)) -> Response:
    equipment = db.get(Equipment, equipment_id)
    if not equipment or equipment.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Equipment not found")

    equipment.deleted_at = datetime.now(timezone.utc)
    db.add(equipment)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/equipment/reconcile", response_model=EquipmentReconcileResponse)
def reconcile_equipment_status(db: Session = Depends(get_db)) -> EquipmentReconcileResponse:
    equipments = (
        db.query(Equipment)
        .filter(Equipment.deleted_at.is_(None))
        .all()
    )
    released_ids: list[UUID] = []

    for equipment in equipments:
        if equipment.status != EquipmentStatus.IN_USE:
            continue
        previous_status = equipment.status
        mark_equipment_available_if_unused(db, equipment)
        if previous_status != equipment.status and equipment.status == EquipmentStatus.AVAILABLE:
            released_ids.append(equipment.id)

    db.commit()
    return EquipmentReconcileResponse(
        released_equipment_ids=released_ids,
        total_processed=len(equipments),
    )


@router.get("/events", response_model=list[EventRead])
def list_events(db: Session = Depends(get_db)) -> list[EventRead]:
    events = (
        db.query(Event)
        .options(selectinload(Event.equipment_associations))
        .order_by(Event.start_date.desc())
        .all()
    )
    return [serialize_event(event) for event in events]


@router.post("/events", response_model=EventRead, status_code=status.HTTP_201_CREATED)
def create_event(payload: EventCreate, db: Session = Depends(get_db)) -> EventRead:
    event_data = payload.model_dump(exclude={"equipment_allocations"})
    event = Event(**event_data)
    db.add(event)
    db.flush()

    for allocation in payload.equipment_allocations:
        equipment = get_equipment_or_404(db, allocation.equipment_id)
        link_equipment_to_event(db, event, equipment, allocation.quantity)

    db.commit()
    db.refresh(event)
    return serialize_event(event)


@router.put("/events/{event_id}", response_model=EventRead)
def update_event(event_id: UUID, payload: EventUpdate, db: Session = Depends(get_db)) -> EventRead:
    event = db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    data = payload.model_dump(exclude_unset=True)
    previous_status = event.status
    for field, value in data.items():
        setattr(event, field, value)

    if "status" in data and data["status"] is not None and data["status"] != previous_status:
        new_status = data["status"]
        if isinstance(new_status, str):
            new_status = EventStatus(new_status)
        if new_status == EventStatus.COMPLETED:
            for equipment in event.equipment:
                mark_equipment_available_if_unused(db, equipment, excluding_event_id=event.id)
        elif new_status == EventStatus.PENDING:
            for equipment in event.equipment:
                mark_equipment_in_use(db, equipment)

    db.add(event)
    db.commit()
    db.refresh(event)
    return serialize_event(event)


@router.delete(
    "/events/{event_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
def delete_event(event_id: UUID, db: Session = Depends(get_db)) -> Response:
    event = db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    equipments = list(event.equipment)
    for equipment in equipments:
        mark_equipment_available_if_unused(db, equipment, excluding_event_id=event.id)

    db.delete(event)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post(
    "/events/{event_id}/equipment/{equipment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
def add_equipment_to_event(
    event_id: UUID,
    equipment_id: UUID,
    quantity: int = Body(1, ge=1),
    db: Session = Depends(get_db),
) -> Response:
    event = get_event_or_404(db, event_id)
    equipment = get_equipment_or_404(db, equipment_id)
    link_equipment_to_event(db, event, equipment, quantity)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete(
    "/events/{event_id}/equipment/{equipment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
def remove_equipment_from_event(event_id: UUID, equipment_id: UUID, db: Session = Depends(get_db)) -> Response:
    link = (
        db.query(EventEquipment)
        .filter(
            EventEquipment.event_id == event_id,
            EventEquipment.equipment_id == equipment_id,
        )
        .first()
    )
    if not link:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Relationship not found")

    # Remover equipamento do evento
    db.delete(link)
    
    equipment = db.get(Equipment, equipment_id)
    if equipment:
        mark_equipment_available_if_unused(db, equipment, excluding_event_id=event_id)
    
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
