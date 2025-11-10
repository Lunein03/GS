from __future__ import annotations

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models import ExpenseReport, OvertimeRequest
from app.schemas.intranet import (
    ExpenseReportCreate,
    ExpenseReportRead,
    ExpenseReportUpdate,
    OvertimeRequestCreate,
    OvertimeRequestRead,
    OvertimeRequestUpdate,
)

router = APIRouter(prefix="/forms", tags=["forms"])


@router.get("/overtime", response_model=list[OvertimeRequestRead])
def list_overtime_requests(
    status_filter: Optional[str] = Query(default=None, alias="status"),
    db: Session = Depends(get_db),
) -> list[OvertimeRequest]:
    query = db.query(OvertimeRequest).order_by(OvertimeRequest.created_at.desc())
    if status_filter:
        query = query.filter(OvertimeRequest.status == status_filter)
    return query.all()


@router.post("/overtime", response_model=OvertimeRequestRead, status_code=status.HTTP_201_CREATED)
def create_overtime_request(
    payload: OvertimeRequestCreate,
    db: Session = Depends(get_db),
) -> OvertimeRequest:
    request = OvertimeRequest(**payload.model_dump())
    db.add(request)
    db.commit()
    db.refresh(request)
    return request


@router.patch("/overtime/{request_id}", response_model=OvertimeRequestRead)
def update_overtime_request(
    request_id: UUID,
    payload: OvertimeRequestUpdate,
    db: Session = Depends(get_db),
) -> OvertimeRequest:
    request = db.get(OvertimeRequest, request_id)
    if not request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(request, field, value)

    db.add(request)
    db.commit()
    db.refresh(request)
    return request


@router.delete(
    "/overtime/{request_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
def delete_overtime_request(request_id: UUID, db: Session = Depends(get_db)) -> Response:
    request = db.get(OvertimeRequest, request_id)
    if not request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")

    db.delete(request)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/expenses", response_model=list[ExpenseReportRead])
def list_expense_reports(
    status_filter: Optional[str] = Query(default=None, alias="status"),
    db: Session = Depends(get_db),
) -> list[ExpenseReport]:
    query = db.query(ExpenseReport).order_by(ExpenseReport.created_at.desc())
    if status_filter:
        query = query.filter(ExpenseReport.status == status_filter)
    return query.all()


@router.post("/expenses", response_model=ExpenseReportRead, status_code=status.HTTP_201_CREATED)
def create_expense_report(payload: ExpenseReportCreate, db: Session = Depends(get_db)) -> ExpenseReport:
    report = ExpenseReport(**payload.model_dump())
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@router.patch("/expenses/{report_id}", response_model=ExpenseReportRead)
def update_expense_report(
    report_id: UUID,
    payload: ExpenseReportUpdate,
    db: Session = Depends(get_db),
) -> ExpenseReport:
    report = db.get(ExpenseReport, report_id)
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(report, field, value)

    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@router.delete(
    "/expenses/{report_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
def delete_expense_report(report_id: UUID, db: Session = Depends(get_db)) -> Response:
    report = db.get(ExpenseReport, report_id)
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

    db.delete(report)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
