from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class CategoryBase(BaseModel):
    name: str
    color: str
    optional_field: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None
    optional_field: Optional[str] = None


class CategoryRead(CategoryBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


class ItemBase(BaseModel):
    type: str
    name: str
    description: Optional[str] = None
    default_price: Decimal
    unit: str
    sku: Optional[str] = None
    pn: Optional[str] = None
    features: Optional[str] = None
    images: Optional[list[str]] = None
    category_id: Optional[UUID] = None
    active: bool = True


class ItemCreate(ItemBase):
    pass


class ItemUpdate(BaseModel):
    type: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    default_price: Optional[Decimal] = None
    unit: Optional[str] = None
    sku: Optional[str] = None
    pn: Optional[str] = None
    features: Optional[str] = None
    images: Optional[list[str]] = None
    category_id: Optional[UUID] = None
    active: Optional[bool] = None


class ItemRead(ItemBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
