from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models import Client, ClientSecondaryContact, Empresa, Opportunity, OpportunityActivity
from app.models.enums import OpportunityStatus
from app.schemas.crm import (
    ClientCreate,
    ClientRead,
    ClientSecondaryContactCreate,
    ClientSecondaryContactRead,
    ClientSecondaryContactUpdate,
    ClientUpdate,
    CompanyCreate,
    CompanyRead,
    CompanyUpdate,
    OpportunityActivityRead,
    OpportunityCreate,
    OpportunityRead,
    OpportunityStatusUpdate,
    OpportunityUpdate,
)

router = APIRouter(prefix="/crm", tags=["crm"])


def sanitize_document(value: str) -> str:
    return "".join(ch for ch in value if ch.isdigit())


@router.get("/opportunities", response_model=list[OpportunityRead])
def list_opportunities(
    status_filter: Optional[OpportunityStatus] = Query(default=None, alias="status"),
    db: Session = Depends(get_db),
) -> list[Opportunity]:
    query = db.query(Opportunity).order_by(Opportunity.created_at.desc())
    if status_filter:
        query = query.filter(Opportunity.status == status_filter)
    return query.all()


@router.post("/opportunities", response_model=OpportunityRead, status_code=status.HTTP_201_CREATED)
def create_opportunity(payload: OpportunityCreate, db: Session = Depends(get_db)) -> Opportunity:
    opportunity = Opportunity(
        title=payload.title,
        description=payload.description,
        value=payload.value,
        probability=payload.probability,
        next_step=payload.next_step,
        client_name=payload.client_name,
        client_email=payload.client_email,
        responsible_user=payload.responsible_user,
        tags=payload.tags or [],
    )

    db.add(opportunity)
    db.flush()

    activity = OpportunityActivity(
        opportunity_id=opportunity.id,
        action="created",
        to_status=OpportunityStatus.OPEN,
        user_id=payload.responsible_user or "system",
    )
    db.add(activity)
    db.commit()
    db.refresh(opportunity)

    return opportunity


@router.get("/opportunities/{opportunity_id}", response_model=OpportunityRead)
def get_opportunity(opportunity_id: UUID, db: Session = Depends(get_db)) -> Opportunity:
    opportunity = db.get(Opportunity, opportunity_id)
    if not opportunity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found")
    return opportunity


@router.patch("/opportunities/{opportunity_id}", response_model=OpportunityRead)
def update_opportunity(
    opportunity_id: UUID,
    payload: OpportunityUpdate,
    db: Session = Depends(get_db),
) -> Opportunity:
    opportunity = db.get(Opportunity, opportunity_id)
    if not opportunity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(opportunity, field, value)

    opportunity.updated_at = datetime.now(timezone.utc)
    db.add(opportunity)
    db.commit()
    db.refresh(opportunity)
    return opportunity


@router.post("/opportunities/{opportunity_id}/status", response_model=OpportunityActivityRead)
def change_opportunity_status(
    opportunity_id: UUID,
    payload: OpportunityStatusUpdate,
    db: Session = Depends(get_db),
) -> OpportunityActivity:
    opportunity = db.get(Opportunity, opportunity_id)
    if not opportunity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found")

    if opportunity.status == payload.new_status:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Status already set")

    previous_status = opportunity.status
    opportunity.status = payload.new_status
    opportunity.updated_at = datetime.now(timezone.utc)

    activity = OpportunityActivity(
        opportunity_id=opportunity.id,
        action="status_changed",
        from_status=previous_status,
        to_status=payload.new_status,
        user_id=payload.user_id or "system",
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)

    return activity


@router.get(
    "/opportunities/{opportunity_id}/activities",
    response_model=list[OpportunityActivityRead],
)
def list_opportunity_activities(opportunity_id: UUID, db: Session = Depends(get_db)) -> list[OpportunityActivity]:
    if not db.query(Opportunity).filter(Opportunity.id == opportunity_id).first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found")

    return (
        db.query(OpportunityActivity)
        .filter(OpportunityActivity.opportunity_id == opportunity_id)
        .order_by(OpportunityActivity.created_at.desc())
        .all()
    )


@router.delete(
    "/opportunities/{opportunity_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
def delete_opportunity(opportunity_id: UUID, db: Session = Depends(get_db)) -> Response:
    opportunity = db.get(Opportunity, opportunity_id)
    if not opportunity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found")
    db.delete(opportunity)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/clients", response_model=list[ClientRead])
def list_clients(
    search: Optional[str] = Query(default=None, description="Search by nome, email, telefone or cpf_cnpj"),
    db: Session = Depends(get_db),
) -> list[Client]:
    query = db.query(Client).filter(Client.deleted_at.is_(None))

    if search:
        value = f"%{search.lower()}%"
        query = query.filter(
            or_(
                func.lower(Client.nome).like(value),
                func.lower(Client.contato_email).like(value),
                func.lower(Client.contato_telefone).like(value),
                Client.cpf_cnpj.like(value.replace("%", "")),
            )
        )

    return query.order_by(Client.created_at.desc()).all()


@router.post("/clients", response_model=ClientRead, status_code=status.HTTP_201_CREATED)
def create_client(payload: ClientCreate, db: Session = Depends(get_db)) -> Client:
    cpf_cnpj = sanitize_document(payload.cpf_cnpj)

    existing = (
        db.query(Client)
        .filter(
            Client.cpf_cnpj == cpf_cnpj,
            Client.deleted_at.is_(None),
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="CPF/CNPJ already registered",
        )

    client = Client(
        tipo=payload.tipo,
        cpf_cnpj=cpf_cnpj,
        nome=payload.nome,
        cargo=payload.cargo,
        cep=payload.cep,
        endereco=payload.endereco,
        numero=payload.numero,
        complemento=payload.complemento,
        bairro=payload.bairro,
        cidade=payload.cidade,
        estado=payload.estado,
        contato_nome=payload.contato_nome,
        contato_email=payload.contato_email,
        contato_telefone=payload.contato_telefone,
        ativo=1 if payload.ativo else 0,
    )

    db.add(client)
    db.commit()
    db.refresh(client)
    return client


@router.get("/clients/{client_id}", response_model=ClientRead)
def get_client(client_id: UUID, db: Session = Depends(get_db)) -> Client:
    client = db.get(Client, client_id)
    if not client or client.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")
    return client


@router.put("/clients/{client_id}", response_model=ClientRead)
def update_client(
    client_id: UUID,
    payload: ClientUpdate,
    db: Session = Depends(get_db),
) -> Client:
    client = db.get(Client, client_id)
    if not client or client.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")

    data = payload.model_dump(exclude_unset=True)

    if "ativo" in data:
        client.ativo = 1 if data.pop("ativo") else 0

    for field, value in data.items():
        setattr(client, field, value)

    client.updated_at = datetime.now(timezone.utc)

    db.add(client)
    db.commit()
    db.refresh(client)
    return client


@router.delete(
    "/clients/{client_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
def delete_client(client_id: UUID, db: Session = Depends(get_db)) -> Response:
    client = db.get(Client, client_id)
    if not client or client.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")

    client.deleted_at = datetime.now(timezone.utc)
    client.ativo = 0
    db.add(client)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get(
    "/clients/{client_id}/contacts",
    response_model=list[ClientSecondaryContactRead],
)
def list_secondary_contacts(client_id: UUID, db: Session = Depends(get_db)) -> list[ClientSecondaryContact]:
    if not db.query(Client).filter(Client.id == client_id, Client.deleted_at.is_(None)).first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")

    return (
        db.query(ClientSecondaryContact)
        .filter(ClientSecondaryContact.client_id == client_id)
        .order_by(ClientSecondaryContact.created_at.asc())
        .all()
    )


@router.post(
    "/clients/{client_id}/contacts",
    response_model=ClientSecondaryContactRead,
    status_code=status.HTTP_201_CREATED,
)
def create_secondary_contact(
    client_id: UUID,
    payload: ClientSecondaryContactCreate,
    db: Session = Depends(get_db),
) -> ClientSecondaryContact:
    if not db.query(Client).filter(Client.id == client_id, Client.deleted_at.is_(None)).first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")

    contact = ClientSecondaryContact(
        client_id=client_id,
        nome=payload.nome,
        email=payload.email,
        telefone=payload.telefone,
        cargo=payload.cargo,
    )
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact


@router.put(
    "/clients/{client_id}/contacts/{contact_id}",
    response_model=ClientSecondaryContactRead,
)
def update_secondary_contact(
    client_id: UUID,
    contact_id: UUID,
    payload: ClientSecondaryContactUpdate,
    db: Session = Depends(get_db),
) -> ClientSecondaryContact:
    contact = (
        db.query(ClientSecondaryContact)
        .filter(
            ClientSecondaryContact.id == contact_id,
            ClientSecondaryContact.client_id == client_id,
        )
        .first()
    )
    if not contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(contact, field, value)

    contact.updated_at = datetime.now(timezone.utc)
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact


@router.delete(
    "/clients/{client_id}/contacts/{contact_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
def delete_secondary_contact(client_id: UUID, contact_id: UUID, db: Session = Depends(get_db)) -> Response:
    contact = (
        db.query(ClientSecondaryContact)
        .filter(
            ClientSecondaryContact.id == contact_id,
            ClientSecondaryContact.client_id == client_id,
        )
        .first()
    )
    if not contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found")

    db.delete(contact)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/companies", response_model=list[CompanyRead])
def list_companies(
    search: Optional[str] = Query(default=None, description="Search by nome, razão social ou CPF/CNPJ"),
    db: Session = Depends(get_db),
) -> list[Empresa]:
    query = db.query(Empresa).filter(Empresa.deleted_at.is_(None))

    if search:
        value = f"%{search.lower()}%"
        normalized_doc = sanitize_document(search)
        query = query.filter(
            or_(
                func.lower(Empresa.nome).like(value),
                func.lower(Empresa.razao_social).like(value),
                func.lower(Empresa.nome_fantasia).like(value),
                Empresa.cpf_cnpj.like(f"%{normalized_doc}%"),
            )
        )

    return query.order_by(Empresa.created_at.desc()).all()


@router.post("/companies", response_model=CompanyRead, status_code=status.HTTP_201_CREATED)
def create_company(payload: CompanyCreate, db: Session = Depends(get_db)) -> Empresa:
    cpf_cnpj = sanitize_document(payload.cpf_cnpj)
    existing = (
        db.query(Empresa)
        .filter(Empresa.cpf_cnpj == cpf_cnpj, Empresa.deleted_at.is_(None))
        .first()
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Company already exists.")

    company = Empresa(
        tipo=payload.tipo,
        cpf_cnpj=cpf_cnpj,
        nome=payload.nome,
        razao_social=payload.razao_social,
        nome_fantasia=payload.nome_fantasia,
        logo=payload.logo,
        contato_nome=payload.contato_nome,
        contato_email=payload.contato_email,
        contato_telefone=payload.contato_telefone,
        cep=payload.cep,
        endereco=payload.endereco,
        numero=payload.numero,
        complemento=payload.complemento,
        bairro=payload.bairro,
        cidade=payload.cidade,
        estado=payload.estado,
        ativo=payload.ativo,
    )
    db.add(company)
    db.commit()
    db.refresh(company)
    return company


@router.get("/companies/{company_id}", response_model=CompanyRead)
def get_company(company_id: UUID, db: Session = Depends(get_db)) -> Empresa:
    company = db.get(Empresa, company_id)
    if not company or company.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")
    return company


@router.put("/companies/{company_id}", response_model=CompanyRead)
def update_company(
    company_id: UUID,
    payload: CompanyUpdate,
    db: Session = Depends(get_db),
) -> Empresa:
    company = db.get(Empresa, company_id)
    if not company or company.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(company, field, value)

    company.updated_at = datetime.now(timezone.utc)
    db.add(company)
    db.commit()
    db.refresh(company)
    return company


@router.delete(
    "/companies/{company_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
def delete_company(company_id: UUID, db: Session = Depends(get_db)) -> Response:
    company = db.get(Empresa, company_id)
    if not company or company.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")

    company.deleted_at = datetime.now(timezone.utc)
    company.ativo = 0
    db.add(company)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
