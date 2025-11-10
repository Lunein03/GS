from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models import Category, Item
from app.schemas.catalog import (
    CategoryCreate,
    CategoryRead,
    CategoryUpdate,
    ItemCreate,
    ItemRead,
    ItemUpdate,
)

router = APIRouter(prefix="/catalog", tags=["catalog"])


def apply_category_filters(query, include_deleted: bool) -> list[Category]:
    if not include_deleted:
        query = query.filter(Category.deleted_at.is_(None))
    return query.order_by(Category.created_at.desc())


@router.get("/categories", response_model=list[CategoryRead])
def list_categories(
    include_deleted: bool = Query(default=False),
    db: Session = Depends(get_db),
) -> list[Category]:
    query = db.query(Category)
    return apply_category_filters(query, include_deleted).all()


@router.post("/categories", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
def create_category(payload: CategoryCreate, db: Session = Depends(get_db)) -> Category:
    existing = (
        db.query(Category)
        .filter(func.lower(Category.name) == payload.name.lower(), Category.deleted_at.is_(None))
        .first()
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Category already exists.")

    category = Category(
        name=payload.name,
        color=payload.color,
        optional_field=payload.optional_field,
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.put("/categories/{category_id}", response_model=CategoryRead)
def update_category(category_id: UUID, payload: CategoryUpdate, db: Session = Depends(get_db)) -> Category:
    category = db.get(Category, category_id)
    if not category or category.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(category, field, value)

    category.updated_at = datetime.now(timezone.utc)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.delete(
    "/categories/{category_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
def delete_category(category_id: UUID, db: Session = Depends(get_db)) -> Response:
    category = db.get(Category, category_id)
    if not category or category.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    category.deleted_at = datetime.now(timezone.utc)
    db.add(category)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/items", response_model=list[ItemRead])
def list_items(
    include_inactive: bool = Query(default=False),
    include_deleted: bool = Query(default=False),
    db: Session = Depends(get_db),
) -> list[Item]:
    query = db.query(Item)
    if not include_deleted:
        query = query.filter(Item.deleted_at.is_(None))
    if not include_inactive:
        query = query.filter(Item.active == 1)
    return query.order_by(Item.created_at.desc()).all()


@router.post("/items", response_model=ItemRead, status_code=status.HTTP_201_CREATED)
def create_item(payload: ItemCreate, db: Session = Depends(get_db)) -> Item:
    item = Item(
        type=payload.type,
        name=payload.name,
        description=payload.description,
        default_price=payload.default_price,
        unit=payload.unit,
        sku=payload.sku,
        pn=payload.pn,
        features=payload.features,
        images=payload.images or [],
        category_id=payload.category_id,
        active=1 if payload.active else 0,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/items/{item_id}", response_model=ItemRead)
def update_item(item_id: UUID, payload: ItemUpdate, db: Session = Depends(get_db)) -> Item:
    item = db.get(Item, item_id)
    if not item or item.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

    data = payload.model_dump(exclude_unset=True)
    if "active" in data:
        item.active = 1 if data.pop("active") else 0

    for field, value in data.items():
        setattr(item, field, value)

    item.updated_at = datetime.now(timezone.utc)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.delete(
    "/items/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
def delete_item(item_id: UUID, db: Session = Depends(get_db)) -> Response:
    item = db.get(Item, item_id)
    if not item or item.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

    item.deleted_at = datetime.now(timezone.utc)
    item.active = 0
    db.add(item)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
