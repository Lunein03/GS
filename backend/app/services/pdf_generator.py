"""
PDF Document Generation Service using ReportLab.
Professional document generation for proposals, contracts, and more.
"""
from __future__ import annotations

import io
from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm, mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    Image,
    NextPageTemplate,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.graphics.shapes import Drawing, Rect
from reportlab.graphics import renderPDF

from app.schemas.documents import (
    CompanyData,
    ProposalDocumentRequest,
    ProposalItemData,
    SignatureData,
)


# Brand Colors
BRAND_PRIMARY = colors.HexColor("#6620F2")  # Electric Indigo
BRAND_SECONDARY = colors.HexColor("#31EBCB")  # Turquesa Viva
BRAND_DARK = colors.HexColor("#1E1B4B")  # Azul Índigo Escuro
BRAND_CHARCOAL = colors.HexColor("#374151")  # Cinza Carvão
BRAND_VANILLA = colors.HexColor("#FEF3C7")  # Vanilla
BRAND_SNOW = colors.HexColor("#F9FAFB")  # Cinza Neve


def hex_to_color(hex_code: str) -> colors.Color:
    """Convert hex color code to ReportLab color."""
    return colors.HexColor(hex_code)


def format_currency(value: Decimal | float) -> str:
    """Format value as Brazilian currency."""
    if isinstance(value, float):
        value = Decimal(str(value))
    return f"R$ {value:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def format_date_br(d: date | datetime | None) -> str:
    """Format date in Brazilian format."""
    if d is None:
        return "--/--/----"
    if isinstance(d, datetime):
        d = d.date()
    return d.strftime("%d/%m/%Y")


def format_date_extenso(d: date | datetime | None = None) -> str:
    """Format date in full Brazilian format."""
    if d is None:
        d = date.today()
    if isinstance(d, datetime):
        d = d.date()
    
    meses = [
        "", "janeiro", "fevereiro", "março", "abril", "maio", "junho",
        "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
    ]
    return f"{d.day} de {meses[d.month]} de {d.year}"


class ProposalPDFGenerator:
    """
    PDF Generator for commercial proposals.
    Creates professional, branded documents using ReportLab.
    """
    
    def __init__(self, data: ProposalDocumentRequest):
        self.data = data
        self.width, self.height = A4
        self.margin_left = 2 * cm
        self.margin_right = 2 * cm
        self.margin_top = 2 * cm
        self.margin_bottom = 2 * cm
        self.buffer = io.BytesIO()
        
        # Colors from request or defaults
        self.primary_color = hex_to_color(data.primary_color)
        self.secondary_color = hex_to_color(data.secondary_color)
        
        # Setup styles
        self._setup_styles()
    
    def _setup_styles(self) -> None:
        """Configure paragraph styles for the document."""
        self.styles = getSampleStyleSheet()
        
        # Title style
        self.styles.add(ParagraphStyle(
            name="DocTitle",
            fontName="Helvetica-Bold",
            fontSize=20,
            leading=24,
            textColor=BRAND_DARK,
            alignment=TA_RIGHT,
            spaceAfter=4,
        ))
        
        # Subtitle style
        self.styles.add(ParagraphStyle(
            name="DocSubtitle",
            fontName="Helvetica",
            fontSize=12,
            leading=14,
            textColor=colors.HexColor("#71717A"),
            alignment=TA_RIGHT,
        ))
        
        # Section title
        self.styles.add(ParagraphStyle(
            name="SectionTitle",
            fontName="Helvetica-Bold",
            fontSize=10,
            leading=12,
            textColor=BRAND_DARK,
            spaceBefore=16,
            spaceAfter=8,
            borderPadding=(0, 0, 4, 0),
        ))
        
        # Normal text
        self.styles.add(ParagraphStyle(
            name="BodyText",
            fontName="Helvetica",
            fontSize=10,
            leading=14,
            textColor=BRAND_CHARCOAL,
            alignment=TA_JUSTIFY,
        ))
        
        # Small text
        self.styles.add(ParagraphStyle(
            name="SmallText",
            fontName="Helvetica",
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#52525B"),
        ))
        
        # Label style
        self.styles.add(ParagraphStyle(
            name="Label",
            fontName="Helvetica-Bold",
            fontSize=10,
            leading=12,
            textColor=BRAND_DARK,
        ))
        
        # Value style
        self.styles.add(ParagraphStyle(
            name="Value",
            fontName="Helvetica",
            fontSize=10,
            leading=12,
            textColor=BRAND_CHARCOAL,
        ))
        
        # Entity name
        self.styles.add(ParagraphStyle(
            name="EntityName",
            fontName="Helvetica-Bold",
            fontSize=11,
            leading=14,
            textColor=BRAND_DARK,
            spaceAfter=2,
        ))
        
        # Entity detail
        self.styles.add(ParagraphStyle(
            name="EntityDetail",
            fontName="Helvetica",
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#52525B"),
        ))
        
        # Signature style
        self.styles.add(ParagraphStyle(
            name="SignatureName",
            fontName="Helvetica-Bold",
            fontSize=11,
            leading=14,
            textColor=BRAND_DARK,
            alignment=TA_CENTER,
        ))
        
        # Signature company
        self.styles.add(ParagraphStyle(
            name="SignatureCompany",
            fontName="Helvetica",
            fontSize=9,
            leading=11,
            textColor=colors.HexColor("#71717A"),
            alignment=TA_CENTER,
            spaceAfter=0,
        ))
    
    def _draw_logo(self, canvas, x: float, y: float, size: float = 50) -> None:
        """
        Draw the GS Produções logo.
        Using simple geometric shapes to approximate the logo.
        """
        # Create a gradient-like effect with the brand colors
        d = Drawing(size, size)
        
        # Simplified logo representation
        # Main shape - stylized 'GS'
        d.add(Rect(
            0, 0, size, size,
            fillColor=None,
            strokeColor=None,
        ))
        
        renderPDF.draw(d, canvas, x, y)
        
        # Draw text as fallback
        canvas.saveState()
        canvas.setFont("Helvetica-Bold", size * 0.4)
        
        # Gradient effect simulation
        canvas.setFillColor(self.primary_color)
        canvas.drawString(x + size * 0.15, y + size * 0.35, "GS")
        
        canvas.restoreState()
    
    def _draw_watermark(self, canvas) -> None:
        """Draw a subtle watermark in the center of the page."""
        if not self.data.include_watermark:
            return
        
        canvas.saveState()
        canvas.setFillColor(colors.HexColor("#6620F2"))
        canvas.setFillAlpha(0.03)
        
        # Center of page
        cx = self.width / 2
        cy = self.height / 2
        
        canvas.setFont("Helvetica-Bold", 120)
        canvas.drawCentredString(cx, cy, "GS")
        
        canvas.restoreState()
    
    def _header_footer(self, canvas, doc) -> None:
        """Draw header and footer on each page."""
        canvas.saveState()
        
        # Watermark
        self._draw_watermark(canvas)
        
        # Footer with page number
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(colors.HexColor("#9CA3AF"))
        
        page_num = canvas.getPageNumber()
        footer_text = f"Página {page_num}"
        canvas.drawCentredString(self.width / 2, 1.2 * cm, footer_text)
        
        canvas.restoreState()
    
    def _build_header(self) -> list:
        """Build the document header with logo and title."""
        elements = []
        
        # Header table: Logo on left, Title on right
        company = self.data.company or CompanyData()
        
        # Left side - Company logo placeholder
        logo_text = Paragraph(
            f'<font size="24" color="#{self.data.primary_color[1:]}">'
            f'<b>GS</b></font>',
            self.styles["Normal"]
        )
        
        # Right side - Document title
        title = Paragraph("Proposta Comercial", self.styles["DocTitle"])
        subtitle = Paragraph(
            self.data.name or "Nova Proposta",
            self.styles["DocSubtitle"]
        )
        
        header_data = [[logo_text, [title, subtitle]]]
        header_table = Table(
            header_data,
            colWidths=[3 * cm, (self.width - 4 * cm - 3 * cm)]
        )
        header_table.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("ALIGN", (1, 0), (1, 0), "RIGHT"),
        ]))
        
        elements.append(header_table)
        elements.append(Spacer(1, 0.8 * cm))
        
        return elements
    
    def _build_metadata(self) -> list:
        """Build the metadata section with code, status, dates."""
        elements = []
        
        proposal_date = self.data.date or date.today()
        validity_date = self.data.validity
        
        # Metadata in a bordered table
        metadata_data = [
            [
                Paragraph(f"<b>Código:</b> {self.data.code or '------'}", self.styles["SmallText"]),
                Paragraph(f"<b>Data:</b> {format_date_br(proposal_date)}", self.styles["SmallText"]),
            ],
            [
                Paragraph(f"<b>Status:</b> {self.data.status or 'Aberto'}", self.styles["SmallText"]),
                Paragraph(f"<b>Validade:</b> {format_date_br(validity_date)}", self.styles["SmallText"]),
            ],
        ]
        
        col_width = (self.width - 4 * cm) / 2
        metadata_table = Table(metadata_data, colWidths=[col_width, col_width])
        metadata_table.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("ALIGN", (1, 0), (1, -1), "RIGHT"),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("LINEABOVE", (0, 0), (-1, 0), 1, colors.HexColor("#F4F4F5")),
            ("LINEBELOW", (0, -1), (-1, -1), 1, colors.HexColor("#F4F4F5")),
        ]))
        
        elements.append(metadata_table)
        elements.append(Spacer(1, 0.6 * cm))
        
        return elements
    
    def _build_entities(self) -> list:
        """Build the company and client information section."""
        elements = []
        
        company = self.data.company or CompanyData()
        client = self.data.client
        
        # Company column
        company_content = [
            Paragraph("EMPRESA", self.styles["SectionTitle"]),
            Paragraph(company.name, self.styles["EntityName"]),
            Paragraph(f"CNPJ: {company.cnpj}", self.styles["EntityDetail"]),
            Paragraph(f"Endereço: {company.address}", self.styles["EntityDetail"]),
            Paragraph(f"{company.neighborhood}, {company.city} - {company.state} - {company.zip_code}", 
                     self.styles["EntityDetail"]),
            Paragraph(f"E-mail: {company.email}", self.styles["EntityDetail"]),
            Paragraph(f"Telefone: {company.phone}", self.styles["EntityDetail"]),
        ]
        
        # Client column
        if client and client.name:
            client_content = [
                Paragraph("CLIENTE", self.styles["SectionTitle"]),
                Paragraph(client.name, self.styles["EntityName"]),
            ]
            if client.contact_name:
                client_content.append(
                    Paragraph(client.contact_name, self.styles["EntityDetail"])
                )
            if client.cnpj:
                client_content.append(
                    Paragraph(f"CNPJ: {client.cnpj}", self.styles["EntityDetail"])
                )
            if client.email:
                client_content.append(
                    Paragraph(f"E-mail: {client.email}", self.styles["EntityDetail"])
                )
            if client.phone:
                client_content.append(
                    Paragraph(f"Telefone: {client.phone}", self.styles["EntityDetail"])
                )
        else:
            client_content = [
                Paragraph("CLIENTE", self.styles["SectionTitle"]),
                Paragraph("<i>Contratante</i>", self.styles["EntityDetail"]),
            ]
        
        # Two-column layout
        col_width = (self.width - 4 * cm - 1 * cm) / 2
        entities_data = [[company_content, client_content]]
        entities_table = Table(entities_data, colWidths=[col_width, col_width])
        entities_table.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ]))
        
        elements.append(entities_table)
        elements.append(Spacer(1, 0.8 * cm))
        
        return elements
    
    def _build_items_table(self) -> list:
        """Build the items/services table."""
        elements = []
        
        elements.append(Paragraph("Itens", self.styles["SectionTitle"]))
        
        items = self.data.items or []
        
        if not items:
            elements.append(
                Paragraph(
                    "Adicione os itens e serviços da proposta aqui...",
                    self.styles["BodyText"]
                )
            )
            elements.append(Spacer(1, 0.5 * cm))
            return elements
        
        # Table header
        header = [
            Paragraph("<b>DESCRIÇÃO</b>", self.styles["SmallText"]),
            Paragraph("<b>QTD</b>", self.styles["SmallText"]),
            Paragraph("<b>VALOR UNIT.</b>", self.styles["SmallText"]),
            Paragraph("<b>TOTAL</b>", self.styles["SmallText"]),
        ]
        
        # Table rows
        table_data = [header]
        total = Decimal("0")
        
        for item in items:
            item_total = item.total or (item.quantity * item.unit_value)
            total += item_total
            
            row = [
                Paragraph(item.description, self.styles["SmallText"]),
                Paragraph(str(item.quantity), self.styles["SmallText"]),
                Paragraph(format_currency(item.unit_value), self.styles["SmallText"]),
                Paragraph(format_currency(item_total), self.styles["SmallText"]),
            ]
            table_data.append(row)
        
        # Column widths
        available_width = self.width - 4 * cm
        col_widths = [
            available_width * 0.45,  # Description
            available_width * 0.12,  # Qty
            available_width * 0.21,  # Unit value
            available_width * 0.22,  # Total
        ]
        
        items_table = Table(table_data, colWidths=col_widths)
        items_table.setStyle(TableStyle([
            # Header
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F4F4F5")),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 9),
            
            # All cells
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            
            # Alignment
            ("ALIGN", (1, 0), (1, -1), "CENTER"),  # Qty
            ("ALIGN", (2, 0), (-1, -1), "RIGHT"),  # Values
            
            # Grid
            ("LINEBELOW", (0, 0), (-1, -1), 0.5, colors.HexColor("#F4F4F5")),
        ]))
        
        elements.append(items_table)
        
        # Total row
        total_data = [[
            "",
            "",
            Paragraph("<b>Total:</b>", self.styles["Label"]),
            Paragraph(f"<b>{format_currency(total)}</b>", self.styles["Label"]),
        ]]
        
        total_table = Table(total_data, colWidths=col_widths)
        total_table.setStyle(TableStyle([
            ("ALIGN", (2, 0), (-1, -1), "RIGHT"),
            ("TOPPADDING", (0, 0), (-1, -1), 12),
            ("LINEABOVE", (2, 0), (-1, 0), 2, BRAND_DARK),
        ]))
        
        elements.append(total_table)
        elements.append(Spacer(1, 0.5 * cm))
        
        return elements
    
    def _build_observations(self) -> list:
        """Build the observations section."""
        elements = []
        
        observations = self.data.observations or (
            "Os objetivos na contratação dos intérpretes de Libras - português foram "
            "logrados, visando uma estrutura operacional para dar apoio a esse nicho "
            "da população, atendendo a legislação ao dispor profissionais proficientes "
            "na Libras, para os surdos exercerem em seus direitos em um grande evento "
            "aberto a todos os públicos, sob a perspectiva da promoção da diversidade."
        )
        
        elements.append(Paragraph("Observações", self.styles["SectionTitle"]))
        elements.append(Paragraph(observations, self.styles["BodyText"]))
        elements.append(Spacer(1, 1 * cm))
        
        return elements
    
    def _build_signature(self) -> list:
        """Build the signature section."""
        elements = []
        
        signature = self.data.signature or SignatureData()
        
        # Date
        elements.append(
            Paragraph(
                f"Rio de Janeiro, {format_date_extenso()}.",
                self.styles["SmallText"]
            )
        )
        elements.append(Spacer(1, 1.5 * cm))
        
        # Signature line
        sig_data = [[
            Paragraph("_" * 40, self.styles["SignatureName"]),
        ], [
            Paragraph(signature.name, self.styles["SignatureName"]),
        ], [
            Paragraph(signature.company.upper(), self.styles["SignatureCompany"]),
        ]]
        
        sig_table = Table(sig_data, colWidths=[8 * cm])
        sig_table.setStyle(TableStyle([
            ("ALIGN", (0, 0), (-1, -1), "LEFT"),
        ]))
        
        elements.append(sig_table)
        
        return elements
    
    def _build_client_signature_page(self) -> list:
        """Build the client signature page (page 2)."""
        elements = []
        
        # Page break
        elements.append(PageBreak())
        
        # Small logo
        logo_text = Paragraph(
            f'<font size="18" color="#{self.data.primary_color[1:]}">'
            f'<b>GS</b></font>',
            self.styles["Normal"]
        )
        elements.append(logo_text)
        elements.append(Spacer(1, 4 * cm))
        
        # Client signature area
        elements.append(Spacer(1, 2 * cm))
        
        sig_data = [[
            Paragraph("_" * 50, self.styles["SignatureName"]),
        ], [
            Paragraph("Contratante", self.styles["SignatureCompany"]),
        ]]
        
        sig_table = Table(sig_data, colWidths=[10 * cm])
        sig_table.setStyle(TableStyle([
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ]))
        
        elements.append(sig_table)
        
        return elements
    
    def generate(self) -> bytes:
        """Generate the PDF document and return as bytes."""
        # Create the document
        doc = BaseDocTemplate(
            self.buffer,
            pagesize=A4,
            leftMargin=self.margin_left,
            rightMargin=self.margin_right,
            topMargin=self.margin_top,
            bottomMargin=self.margin_bottom,
            title=f"Proposta {self.data.code or 'Nova'}",
            author="GS Produções",
            subject="Proposta Comercial",
        )
        
        # Create frame
        frame = Frame(
            self.margin_left,
            self.margin_bottom,
            self.width - self.margin_left - self.margin_right,
            self.height - self.margin_top - self.margin_bottom,
            id="normal",
        )
        
        # Page template
        template = PageTemplate(
            id="main",
            frames=[frame],
            onPage=self._header_footer,
        )
        doc.addPageTemplates([template])
        
        # Build content
        elements = []
        elements.extend(self._build_header())
        elements.extend(self._build_metadata())
        elements.extend(self._build_entities())
        elements.extend(self._build_items_table())
        elements.extend(self._build_observations())
        elements.extend(self._build_signature())
        
        if self.data.include_signature_page:
            elements.extend(self._build_client_signature_page())
        
        # Build the PDF
        doc.build(elements)
        
        # Get the PDF content
        pdf_content = self.buffer.getvalue()
        self.buffer.close()
        
        return pdf_content


def generate_proposal_pdf(data: ProposalDocumentRequest) -> bytes:
    """
    Generate a proposal PDF document.
    
    Args:
        data: Proposal document data
        
    Returns:
        PDF content as bytes
    """
    generator = ProposalPDFGenerator(data)
    return generator.generate()
