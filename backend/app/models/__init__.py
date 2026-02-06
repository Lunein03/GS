from app.db.base import Base

from .crm import (
    Activity,
    Category,
    Client,
    ClientSecondaryContact,
    Empresa,
    Item,
    Opportunity,
    OpportunityActivity,
    PaymentMode,
    Proposal,
    ProposalItem,
    ProposalNote,
    ProposalSignature,
    ProposalHistory,
)
from .inventory import Equipment, Event, EventEquipment
from .intranet import ExpenseReport, OvertimeRequest

__all__ = [
    "Base",
    "Opportunity",
    "OpportunityActivity",
    "Proposal",
    "ProposalItem",
    "Activity",
    "Client",
    "ClientSecondaryContact",
    "Empresa",
    "Category",
    "ProposalNote",
    "PaymentMode",
    "ProposalSignature",
    "ProposalHistory",
    "Item",
    "Equipment",
    "Event",
    "EventEquipment",
    "OvertimeRequest",
    "ExpenseReport",
]
