"""
API routes for document generation (PDF, DOCX).
"""
from __future__ import annotations

from datetime import date
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response, StreamingResponse
from sqlalchemy.orm import Session
import io

from app.api.deps import get_db
from app.models import Proposal, ProposalItem
from app.schemas.documents import (
    DocumentType,
    ProposalDocumentRequest,
    ProposalItemData,
    CompanyData,
    ClientData,
    SignatureData,
)
from app.services.pdf_weasy import generate_proposal_pdf


router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("/proposal/generate")
async def generate_proposal_document(
    payload: ProposalDocumentRequest,
    doc_type: DocumentType = DocumentType.PDF,
):
    """
    Generate a proposal document (PDF or DOCX).
    
    Receives proposal data and returns the generated document as a downloadable file.
    """
    try:
        if doc_type == DocumentType.PDF:
            pdf_bytes = generate_proposal_pdf(payload)
            
            filename = f"proposta-{payload.code or 'nova'}-{date.today().strftime('%Y%m%d')}.pdf"
            
            return Response(
                content=pdf_bytes,
                media_type="application/pdf",
                headers={
                    "Content-Disposition": f'attachment; filename="{filename}"',
                    "Content-Length": str(len(pdf_bytes)),
                },
            )
        else:
            # DOCX generation - to be implemented
            raise HTTPException(
                status_code=status.HTTP_501_NOT_IMPLEMENTED,
                detail="DOCX generation not yet implemented",
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating document: {str(e)}",
        )


@router.get("/proposal/{proposal_id}/pdf")
async def generate_proposal_pdf_from_db(
    proposal_id: UUID,
    db: Session = Depends(get_db),
    include_signature_page: bool = True,
):
    """
    Generate a PDF for a proposal stored in the database.
    
    Fetches proposal data from the database and generates a PDF document.
    """
    # Fetch proposal from database
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    
    if not proposal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proposal not found",
        )
    
    # Fetch proposal items
    items = db.query(ProposalItem).filter(ProposalItem.proposal_id == proposal_id).all()
    
    # Build document request from database data
    document_request = ProposalDocumentRequest(
        code=proposal.code,
        name=proposal.title,
        status=proposal.status,
        date=proposal.created_at.date() if proposal.created_at else None,
        validity=proposal.valid_until,
        company=CompanyData(),  # Default company data
        client=ClientData(
            name=proposal.client_name,
            email=proposal.client_email,
            phone=proposal.client_phone,
        ) if proposal.client_name else None,
        signature=SignatureData(
            name=proposal.responsible_user or "Gabriel Sampaio Verissimo",
        ) if proposal.responsible_user else None,
        items=[
            ProposalItemData(
                id=str(item.id),
                description=item.name or item.description or "",
                quantity=item.quantity or 1,
                unitValue=item.unit_price or 0,
            )
            for item in items
        ],
        observations=proposal.notes,
        include_signature_page=include_signature_page,
    )
    
    try:
        pdf_bytes = generate_proposal_pdf(document_request)
        
        filename = f"proposta-{proposal.code or proposal_id}-{date.today().strftime('%Y%m%d')}.pdf"
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Content-Length": str(len(pdf_bytes)),
            },
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating PDF: {str(e)}",
        )


@router.post("/proposal/preview")
async def preview_proposal_document(
    payload: ProposalDocumentRequest,
):
    """
    Generate a proposal PDF preview (inline display).
    
    Returns the PDF for inline viewing in browser instead of download.
    """
    try:
        pdf_bytes = generate_proposal_pdf(payload)
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": "inline",
                "Content-Length": str(len(pdf_bytes)),
            },
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating preview: {str(e)}",
        )


@router.get("/health")
async def documents_health():
    """Health check for document generation service."""
    return {
        "status": "ok",
        "service": "documents",
        "supported_formats": ["pdf"],
        "supported_documents": ["proposal"],
    }
