from enum import Enum


class OpportunityStatus(str, Enum):
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    WON = "WON"
    LOST = "LOST"


class ProposalStatus(str, Enum):
    DRAFT = "DRAFT"
    OPEN = "OPEN"
    SENT = "SENT"
    WON = "WON"
    LOST = "LOST"


class ActivityStatus(str, Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class ActivityPriority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    URGENT = "URGENT"


class EmpresaTipo(str, Enum):
    FISICA = "fisica"
    JURIDICA = "juridica"


class ProposalNoteMode(str, Enum):
    MANUAL = "manual"
    AUTOMATIC = "automatic"


class ProposalSignatureType(str, Enum):
    GOVBR = "govbr"
    CUSTOM = "custom"


class ProposalSignatureStatus(str, Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REVOKED = "revoked"


class EquipmentStatus(str, Enum):
    AVAILABLE = "available"
    IN_USE = "in-use"
    MAINTENANCE = "maintenance"
    RETIRED = "retired"


class EventStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"


class ProposalHistoryEventType(str, Enum):
    CREATE = "create"
    UPDATE = "update"
    STATUS_CHANGE = "status_change"
    EMAIL_SENT = "email_sent"
    PDF_GENERATED = "pdf_generated"
    VIEWED = "viewed"
    NOTE_ADDED = "note_added"
    NOTE_UPDATED = "note_updated"
    NOTE_DELETED = "note_deleted"


class CompanySignatureType(str, Enum):
    GOVBR = "govbr"
    CERTIFICADO = "certificado"


class CompanySignatureStatus(str, Enum):
    PENDING = "pendente"
    VERIFIED = "verificado"
    EXPIRED = "expirado"
