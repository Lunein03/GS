from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class OvertimeRequestBase(BaseModel):
    employee_name: str
    overtime_date: datetime
    start_time: str
    end_time: str
    justification: str
    status: str = "pending"
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None


class OvertimeRequestCreate(OvertimeRequestBase):
    pass


class OvertimeRequestUpdate(BaseModel):
    status: Optional[str] = None
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None


class OvertimeRequestRead(OvertimeRequestBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime
    updated_at: datetime


class ExpenseReportBase(BaseModel):
    employee_name: str
    expense_date: datetime
    category: str
    category_other: Optional[str] = None
    event_name: str
    transport_type: Optional[str] = None
    transport_other: Optional[str] = None
    amount: Decimal
    status: str = "pending"
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None


class ExpenseReportCreate(ExpenseReportBase):
    pass


class ExpenseReportUpdate(BaseModel):
    status: Optional[str] = None
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None


class ExpenseReportRead(ExpenseReportBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime
    updated_at: datetime
