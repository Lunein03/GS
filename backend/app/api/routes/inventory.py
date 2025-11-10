from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models import Equipment, Event, EventEquipment
from app.models.enums import EquipmentStatus
from app.schemas.inventory import (
    EquipmentCreate,
    EquipmentRead,
    EquipmentUpdate,
    EventCreate,
    EventRead,
    EventUpdate,
)

router = APIRouter(prefix="/inventory", tags=["inventory"])


def serialize_event(event: Event) -> EventRead:
    return EventRead(
        id=event.id,
        name=event.name,
        date=event.date,
        location=event.location,
        notes=event.notes,
        created_at=event.created_at,
        deleted_at=event.deleted_at,
        equipment_ids=[equipment.id for equipment in event.equipment],
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


@router.get("/events", response_model=list[EventRead])
def list_events(db: Session = Depends(get_db)) -> list[EventRead]:
    events = db.query(Event).order_by(Event.date.desc()).all()
    return [serialize_event(event) for event in events]


@router.post("/events", response_model=EventRead, status_code=status.HTTP_201_CREATED)
def create_event(payload: EventCreate, db: Session = Depends(get_db)) -> EventRead:
    event = Event(**payload.model_dump())
    db.add(event)
    db.commit()
    db.refresh(event)
    return serialize_event(event)


@router.put("/events/{event_id}", response_model=EventRead)
def update_event(event_id: UUID, payload: EventUpdate, db: Session = Depends(get_db)) -> EventRead:
    event = db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(event, field, value)

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

    db.delete(event)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post(
    "/events/{event_id}/equipment/{equipment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
def add_equipment_to_event(event_id: UUID, equipment_id: UUID, db: Session = Depends(get_db)) -> Response:
    event = db.get(Event, event_id)
    equipment = db.get(Equipment, equipment_id)
    if not event or not equipment or equipment.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event or equipment not found",
        )

    link = (
        db.query(EventEquipment)
        .filter(
            EventEquipment.event_id == event_id,
            EventEquipment.equipment_id == equipment_id,
        )
        .first()
    )
    if link:
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    # Adicionar equipamento ao evento
    db.add(EventEquipment(event_id=event_id, equipment_id=equipment_id))
    
    # Atualizar status do equipamento para "em uso"
    equipment.status = EquipmentStatus.IN_USE
    equipment.updated_at = datetime.now(timezone.utc)
    db.add(equipment)
    
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
    
    # Verificar se o equipamento está em outros eventos ativos
    equipment = db.get(Equipment, equipment_id)
    if equipment:
        other_events = (
            db.query(EventEquipment)
            .filter(EventEquipment.equipment_id == equipment_id)
            .count()
        )
        
        # Se não está em nenhum outro evento, voltar para disponível
        if other_events == 0:
            equipment.status = EquipmentStatus.AVAILABLE
            equipment.updated_at = datetime.now(timezone.utc)
            db.add(equipment)
    
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
