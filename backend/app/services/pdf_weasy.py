from __future__ import annotations

import base64
from datetime import date, datetime
from decimal import Decimal
from pathlib import Path

from jinja2 import Environment, FileSystemLoader, select_autoescape
try:
    from weasyprint import HTML
except (ImportError, OSError):
    HTML = None

from app.schemas.documents import (
    ProposalDocumentRequest,
    CompanyData,
    ClientData,
    SignatureData,
)

TEMPLATE_DIR = Path(__file__).resolve().parent.parent / "templates"
env = Environment(
    loader=FileSystemLoader(TEMPLATE_DIR),
    autoescape=select_autoescape(["html"]),
)


def _format_currency(value: Decimal | float | int) -> str:
    if value is None:
        value = 0
    if isinstance(value, (int, float)):
        value = Decimal(str(value))
    return f"R$ {value:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def _fmt_date(d: date | datetime | None) -> str:
    if d is None:
        return "--/--/----"
    if isinstance(d, datetime):
        d = d.date()
    return d.strftime("%d/%m/%Y")


def _fmt_full_date(d: date | datetime | None = None) -> str:
    if d is None:
        d = date.today()
    if isinstance(d, datetime):
        d = d.date()
    months = [
        "",
        "janeiro",
        "fevereiro",
        "março",
        "abril",
        "maio",
        "junho",
        "julho",
        "agosto",
        "setembro",
        "outubro",
        "novembro",
        "dezembro",
    ]
    return f"{d.day} de {months[d.month]} de {d.year}"


def _logo_data_url(primary_color: str, secondary_color: str, opacity: float = 0.05) -> str:
    """
    Build a lightweight inline SVG for the logo, applying opacity at the path level.
    """
    svg = f"""
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 54.33 47.14' fill='{primary_color}' fill-opacity='{opacity}'>
      <path d='M15.4,46.22l2.71-2.71,3.62-3.63h-10.16c-.39,0-.7.3-.71.67v4.01c0,1.41,1.16,2.57,2.58,2.57.78,0,1.49-.36,1.96-.91Z' />
      <path d='M28.97,25.38l-3.62,3.63-2.05,2.05c-.88.87-2.05,1.57-3.35,1.57-4.24,0-8.47,0-12.71,0-3.98,0-7.24-3.26-7.24-7.24v-14.53C0,6.88,3.26,3.62,7.24,3.62h28.97s-3.62,3.63-3.62,3.63l-2.05,2.05c-.88.87-2.05,1.57-3.35,1.57H7.24v14.51h21.73Z' />
      <path d='M25.35,21.76l3.62-3.63,2.05-2.05c.88-.87,2.05-1.57,3.35-1.57,4.24,0,8.47,0,12.71,0,3.98,0,7.24,3.26,7.24,7.24v14.53c0,3.98-3.26,7.24-7.24,7.24h-28.97l3.62-3.63,2.05-2.05c.88-.87,2.05-1.57,3.35-1.57h19.95v-14.51h-21.73Z' />
      <path d='M38.93.91l-2.71,2.71-3.62,3.63h10.16c.39,0,.7-.3.71-.67V2.57c0-1.41-1.16-2.57-2.58-2.57-.78,0-1.49.36-1.96.91Z' />
    </svg>
    """
    encoded = base64.b64encode(svg.encode("utf-8")).decode("ascii")
    return f"data:image/svg+xml;base64,{encoded}"


def generate_proposal_pdf(data: ProposalDocumentRequest) -> bytes:
    """
    Render proposal PDF using WeasyPrint (HTML/CSS).
    """
    company = data.company or CompanyData()
    client = data.client or ClientData()
    signature = data.signature or SignatureData()

    items = []
    total = Decimal("0")
    for item in data.items:
        unit = item.unit_value
        line_total = item.total or (item.quantity * unit)
        total += line_total
        items.append(
            {
                "description": item.description,
                "quantity": item.quantity,
                "unit_value_fmt": _format_currency(unit),
                "total_fmt": _format_currency(line_total),
            }
        )

    ctx = {
        "data": data,
        "company": company,
        "client": client,
        "signature": signature,
        "items": items,
        "total_fmt": _format_currency(total),
        "observations": data.observations,
        "date_str": _fmt_date(data.date or date.today()),
        "validity_str": _fmt_date(data.validity),
        "today_full": _fmt_full_date(),
        "watermark_opacity": 0.05,
        "watermark_data_url": _logo_data_url(
            primary_color=data.primary_color,
            secondary_color=data.secondary_color,
            opacity=0.05,
        ),
        "logo_data_url": _logo_data_url(
            primary_color=data.primary_color,
            secondary_color=data.secondary_color,
            opacity=1.0,
        ),
    }

    template = env.get_template("proposal.html")
    html = template.render(**ctx)
    pdf_bytes = HTML(string=html, base_url=str(TEMPLATE_DIR)).write_pdf()
    return pdf_bytes
