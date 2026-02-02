# 📄 Document Generation Module

This module provides PDF document generation using a Python backend with ReportLab.

## 🏗️ Architecture

```
┌─────────────────────┐     HTTP      ┌─────────────────────┐
│    Next.js App      │ ───────────▶  │   Python Backend    │
│  (Frontend + API)   │               │   (FastAPI + PDF)   │
│   Port: 3000        │  ◀───────────  │   Port: 9000        │
└─────────────────────┘     PDF       └─────────────────────┘
```

## 📁 Structure

### Backend (Python)

```
backend/
├── app/
│   ├── api/routes/
│   │   └── documents.py      # API endpoints
│   ├── schemas/
│   │   └── documents.py      # Pydantic schemas
│   └── services/
│       └── pdf_generator.py  # PDF generation with ReportLab
└── pyproject.toml
```

### Frontend (TypeScript)

```
src/features/gs-propostas/
├── api/
│   └── document-client.ts    # API client
└── hooks/
    └── use-document-generator.ts  # React hook
```

## 🚀 Quick Start

### 1. Start the Python Backend

```bash
cd backend

# Create virtual environment
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -e .

# Run the server
uvicorn app.main:app --reload --port 9000
```

### 2. Configure Environment

Add to your `.env.local`:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:9000
```

### 3. Use in Frontend

```tsx
import {
  useDocumentGenerator,
  transformToBackendFormat,
} from "@/features/gs-propostas/hooks/use-document-generator";

function MyComponent() {
  const { downloadPdf, isGenerating } = useDocumentGenerator();

  const handleExport = async () => {
    const data = transformToBackendFormat({
      code: "251203-1",
      name: "Nova Proposta",
      clientName: "Cliente ABC",
      items: [
        { id: "1", description: "Serviço", quantity: 1, unitValue: 1000 },
      ],
    });

    await downloadPdf(data);
  };

  return (
    <button onClick={handleExport} disabled={isGenerating}>
      {isGenerating ? "Gerando..." : "Exportar PDF"}
    </button>
  );
}
```

## 📡 API Endpoints

### Generate Proposal PDF

```http
POST /api/v1/documents/proposal/generate?doc_type=pdf
Content-Type: application/json

{
  "code": "251203-1",
  "name": "Nova Proposta",
  "status": "Aberto",
  "date": "2026-02-02",
  "validity": "2026-03-02",
  "company": {
    "name": "GS PRODUÇÕES E ACESSIBILIDADE",
    "cnpj": "35.282.691/0001-48",
    "email": "comercial@gsproducao.com"
  },
  "client": {
    "name": "Cliente ABC",
    "email": "cliente@email.com"
  },
  "items": [
    {
      "id": "1",
      "description": "Serviço de Acessibilidade",
      "quantity": 1,
      "unitValue": 1500.00
    }
  ],
  "observations": "Texto de observações...",
  "include_watermark": true,
  "include_signature_page": true
}
```

### Generate from Database

```http
GET /api/v1/documents/proposal/{proposal_id}/pdf?include_signature_page=true
```

### Preview (inline display)

```http
POST /api/v1/documents/proposal/preview
Content-Type: application/json

{ ... same as generate ... }
```

### Health Check

```http
GET /api/v1/documents/health
```

## 🎨 Brand Colors

The PDF uses the official GS Produções brand colors:

| Color              | Hex       | Usage            |
| ------------------ | --------- | ---------------- |
| Electric Indigo    | `#6620F2` | Primary accent   |
| Turquesa Viva      | `#31EBCB` | Secondary accent |
| Azul Índigo Escuro | `#1E1B4B` | Dark text        |
| Cinza Carvão       | `#374151` | Body text        |

## 🔧 Customization

### Custom Colors

```json
{
  "primary_color": "#6620F2",
  "secondary_color": "#31EBCB"
}
```

### Disable Signature Page

```json
{
  "include_signature_page": false
}
```

### Disable Watermark

```json
{
  "include_watermark": false
}
```

## 📋 TODO

- [ ] DOCX export support (python-docx)
- [ ] Contract document template
- [ ] Media Kit template
- [ ] Invoice template
- [ ] Custom fonts support
- [ ] Image/logo upload

## 🐛 Troubleshooting

### CORS Errors

Make sure the Python backend includes `http://localhost:3000` in allowed origins (already configured).

### Connection Refused

Ensure the Python backend is running on port 9000:

```bash
uvicorn app.main:app --reload --port 9000
```

### PDF Not Generating

Check the backend logs for errors. The ReportLab library should be installed:

```bash
pip install reportlab
```
