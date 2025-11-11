from __future__ import annotations

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.enums import EquipmentStatus, EventStatus


class EquipmentBase(BaseModel):
    code: str
    name: str
    category: str
    brand: Optional[str] = None
    model: Optional[str] = None
    serial_number: Optional[str] = None
    acquisition_date: datetime
    status: EquipmentStatus = EquipmentStatus.AVAILABLE
    location: Optional[str] = None
    notes: Optional[str] = None


class EquipmentCreate(EquipmentBase):
    pass


class EquipmentUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    serial_number: Optional[str] = None
    acquisition_date: Optional[datetime] = None
    status: Optional[EquipmentStatus] = None
    location: Optional[str] = None
    notes: Optional[str] = None


class EquipmentRead(EquipmentBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    deleted_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class EventBase(BaseModel):
    name: str
    start_date: datetime
    end_date: datetime
    location: str
    notes: Optional[str] = None
    status: EventStatus = EventStatus.PENDING


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    name: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    location: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[EventStatus] = None


class EventRead(EventBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    deleted_at: Optional[datetime]
    created_at: datetime
    equipment_ids: List[UUID] = []
