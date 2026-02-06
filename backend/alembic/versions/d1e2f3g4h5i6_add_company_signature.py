"""Add company signature columns

Revision ID: d1e2f3g4h5i6
Revises: 69873882579e
Create Date: 2026-02-06 14:57:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd1e2f3g4h5i6'
down_revision = '69873882579e'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create enum types first
    company_signature_type = sa.Enum(
        'govbr', 'certificado',
        name='company_signature_type',
        create_type=False
    )
    company_signature_status = sa.Enum(
        'pendente', 'verificado', 'expirado',
        name='company_signature_status',
        create_type=False
    )
    
    # Create enum types in PostgreSQL
    op.execute("CREATE TYPE company_signature_type AS ENUM ('govbr', 'certificado')")
    op.execute("CREATE TYPE company_signature_status AS ENUM ('pendente', 'verificado', 'expirado')")
    
    # Add columns to empresas table
    op.add_column('empresas', sa.Column('assinatura_tipo', company_signature_type, nullable=True))
    op.add_column('empresas', sa.Column('assinatura_status', company_signature_status, nullable=True))
    op.add_column('empresas', sa.Column('assinatura_cpf_titular', sa.Text(), nullable=True))
    op.add_column('empresas', sa.Column('assinatura_nome_titular', sa.Text(), nullable=True))
    op.add_column('empresas', sa.Column('assinatura_govbr_identifier', sa.Text(), nullable=True))
    op.add_column('empresas', sa.Column('assinatura_validado_em', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    # Remove columns
    op.drop_column('empresas', 'assinatura_validado_em')
    op.drop_column('empresas', 'assinatura_govbr_identifier')
    op.drop_column('empresas', 'assinatura_nome_titular')
    op.drop_column('empresas', 'assinatura_cpf_titular')
    op.drop_column('empresas', 'assinatura_status')
    op.drop_column('empresas', 'assinatura_tipo')
    
    # Drop enum types
    op.execute("DROP TYPE IF EXISTS company_signature_status")
    op.execute("DROP TYPE IF EXISTS company_signature_type")
