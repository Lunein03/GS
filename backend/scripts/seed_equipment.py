#!/usr/bin/env python3
"""
Script para popular o banco de dados com equipamentos de patrimônio
"""
import sys
from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP, InvalidOperation
from pathlib import Path
import re

# Adicionar o diretório raiz ao path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import text
from app.db.session import SessionLocal
from app.models.enums import EquipmentStatus


def parse_currency_to_cents(value: str) -> int:
    """Converte string BRL (ex: 'R$ 1.234,56') para centavos inteiros (int)."""
    if not value or value == "-":
        return 0
    sanitized = value.replace("R$", "").strip()
    # remove separador de milhar e normaliza decimal
    sanitized = sanitized.replace(".", "").replace(",", ".")
    try:
        dec = Decimal(sanitized)
    except (InvalidOperation, ValueError):
        return 0
    cents = (dec * 100).quantize(Decimal("1"), rounding=ROUND_HALF_UP)
    return int(cents)


def parse_date(date_str: str) -> datetime:
    """Converte string de data DD/MM/YYYY para datetime timezone-aware (UTC)."""
    dt = datetime.strptime(date_str, "%d/%m/%Y")
    return dt.replace(tzinfo=timezone.utc)


def infer_quantity_and_clean_name(name: str) -> tuple[int, str]:
    """Se o nome começar com número (ex: '30 Cadeiras ...'),
    infere a quantidade e retorna (quantidade, nome_sem_prefixo_numerico).
    Caso contrário, retorna (1, nome_original).
    """
    if not name:
        return 1, name
    m = re.match(r"^\s*(\d{1,3})\s+(.+)$", name)
    if not m:
        return 1, name
    try:
        q = int(m.group(1))
    except ValueError:
        return 1, name
    if q <= 1:
        return 1, name
    return q, m.group(2).strip()


# Lista de equipamentos para inserir
EQUIPMENT_DATA = [
    {
        "code": "001",
        "name": "Softbox Lanterna Bowens 65cm",
        "category": "Equipamento",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 760,00",
        "description": "Softbox estilo lanterna para iluminação suave e difusa em gravações.",
    },
    {
        "code": "002",
        "name": "Estante 6 Prateleiras",
        "category": "Mobiliário",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 500,00",
        "description": "Estante metálica para armazenamento pesado.",
    },
    {
        "code": "003",
        "name": "Mesa Industrial",
        "category": "Mobiliário",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 200,00",
        "description": "Mesa de apoio para computador e operação.",
    },
    {
        "code": "004",
        "name": "Mesa Dobrável",
        "category": "Mobiliário",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 162,00",
        "description": "Mesa portátil leve para apoio rápido.",
    },
    {
        "code": "005",
        "name": "Microfone Fifine AM8",
        "category": "Equipamento",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 320,00",
        "description": "Microfone dinâmico XLR com captação cardioide para voz clara em estúdio.",
    },
    {
        "code": "006",
        "name": "Focusrite Scarlett 2i2",
        "category": "Equipamento",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 1.900,00",
        "description": "Interface de áudio profissional com pré-amps limpos e conexão USB.",
    },
    {
        "code": "007",
        "name": "Amaran 200xS",
        "category": "Equipamento",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 5.600,00",
        "description": "Luz contínua bicolor de alta potência para gravações profissionais.",
    },
    {
        "code": "008",
        "name": "Bastão Selfie Inova",
        "category": "Equipamento",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 40,00",
        "description": "Bastão compacto com controle remoto para gravações rápidas.",
    },
    {
        "code": "009",
        "name": "Máquina de Cartão",
        "category": "Equipamento",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 200,00",
        "description": "Terminal de pagamento portátil para operações presenciais.",
    },
    {
        "code": "010",
        "name": "Headset Havit",
        "category": "Equipamento",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 470,00",
        "description": "Headset gamer com boa resposta para monitoramento de áudio.",
    },
    {
        "code": "011",
        "name": "Chroma Key 4×3",
        "category": "Equipamento",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 270,00",
        "description": "Fundo verde de tecido para recortes e filmagens com keying limpo.",
    },
    {
        "code": "012",
        "name": "Grampos para Chroma",
        "category": "Equipamento",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 50,00",
        "description": "Fixadores resistentes para prender tecidos e painéis.",
    },
    {
        "code": "013",
        "name": "Aspirador WAP GTW10",
        "category": "Equipamento",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 270,00",
        "description": "Aspirador pó/água compacto para limpeza de estúdios.",
    },
    {
        "code": "014",
        "name": "Tripé Manfrotto",
        "category": "Equipamento",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 1.500,00",
        "description": "Tripé profissional compacto e resistente para câmeras.",
    },
    {
        "code": "015",
        "name": "Tripé para Caixa de Som",
        "category": "Equipamento",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 150,00",
        "description": "Suporte robusto para elevação de caixas em eventos.",
    },
    {
        "code": "016",
        "name": "Tripé para Tela Mapa",
        "category": "Equipamento",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 140,00",
        "description": "Suporte para projeções, telas e banners.",
    },
    {
        "code": "017",
        "name": "Tripé de Iluminação 2m",
        "category": "Equipamento",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 80,00",
        "description": "Suporte básico para luzes de estúdio.",
    },
    {
        "code": "018",
        "name": "Suporte Parede T120",
        "category": "Equipamento",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 200,00",
        "description": "Suporte fixo para iluminação ou acessórios.",
    },
    {
        "code": "019",
        "name": "Ferro Black+Decker",
        "category": "Equipamento",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 140,00",
        "description": "Ferro a seco para ajustes de figurino e tecidos.",
    },
    {
        "code": "020",
        "name": "Escada 5 Degraus",
        "category": "Mobiliário",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 180,00",
        "description": "Escada para acesso a montagem e iluminação.",
    },
    {
        "code": "021",
        "name": "Mochila Pirulito",
        "category": "Equipamento",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 600,00",
        "description": "Mochila utilizada em trabalhos de acessibilidade e suporte.",
    },
    {
        "code": "022",
        "name": "Rádios de Audiodescrição",
        "category": "Equipamento",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 2.200,00",
        "description": "Equipamentos de transmissão para acessibilidade em eventos.",
    },
    {
        "code": "023",
        "name": "Fone kz-EDX PRO",
        "category": "Equipamento",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 300,00",
        "description": "In-ear de alta sensibilidade para monitoramento preciso.",
    },
    {
        "code": "024",
        "name": "Teclado/Mouse USB",
        "category": "Equipamento",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 70,00",
        "description": "Periféricos básicos para operação de computadores.",
    },
    {
        "code": "025",
        "name": "Power Bank 20.000mAh",
        "category": "Equipamento",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 220,00",
        "description": "Bateria portátil para carregamento rápido em campo.",
    },
    {
        "code": "026",
        "name": "Microfone de Palestra",
        "category": "Equipamento",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 40,00",
        "description": "Microfone com fio para uso em eventos e falas públicas.",
    },
    {
        "code": "027",
        "name": "Transmissor Sem Fio AD",
        "category": "Equipamento",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 500,00",
        "description": "Sistema de transmissão para audiodescrição e apoio técnico.",
    },
    {
        "code": "028",
        "name": "Frigobar Philco",
        "category": "Eletrodoméstico",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 1.189,07",
        "description": "Mini geladeira para bebidas e alimentos.",
    },
    {
        "code": "029",
        "name": "Purificador Electrolux",
        "category": "Eletrodoméstico",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 699,00",
        "description": "Purificador digital com água filtrada.",
    },
    {
        "code": "030",
        "name": "Micro-ondas Electrolux",
        "category": "Eletrodoméstico",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 670,00",
        "description": "Micro-ondas para cozinha do estúdio.",
    },
    {
        "code": "031",
        "name": "Cafeteira Electrolux",
        "category": "Eletrodoméstico",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 150,00",
        "description": "Cafeteira compacta do dia a dia.",
    },
    {
        "code": "032",
        "name": "Mesa de Jantar",
        "category": "Eletrodoméstico",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 420,00",
        "description": "Mesa para refeições da equipe.",
    },
    {
        "code": "033",
        "name": "Banquetas Argila",
        "category": "Mobiliário",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 670,00",
        "description": "Banquetas altas para área gourmet.",
    },
    {
        "code": "034",
        "name": "Notebook Acer Nitro 5",
        "category": "Equipamento",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 5.270,00",
        "description": "Laptop de alto desempenho para edição e operação pesada.",
    },
    {
        "code": "035",
        "name": "Samsung Tab S6 Lite",
        "category": "Equipamento",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 1.800,00",
        "description": "Tablet para anotações, controle de produção e mobilidade.",
    },
    {
        "code": "036",
        "name": "Armário 8 Portas",
        "category": "Mobiliário",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 675,00",
        "description": "Armário grande para organização.",
    },
    {
        "code": "037",
        "name": "Balcão 3 Portas",
        "category": "Mobiliário",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 436,00",
        "description": "Balcão para materiais administrativos.",
    },
    {
        "code": "038",
        "name": "Escrivaninha Studio",
        "category": "Mobiliário",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 732,00",
        "description": "Estações de trabalho para equipe.",
    },
    {
        "code": "039",
        "name": "Cafeteira Dolce Gusto",
        "category": "Equipamento",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 600,00",
        "description": "Cafeteira compacta para suporte a equipe e convidados.",
    },
    {
        "code": "040",
        "name": "Extensão 20m Tripolar",
        "category": "Equipamento",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 188,00",
        "description": "Cabo reforçado para equipamentos de alta demanda.",
    },
    {
        "code": "041",
        "name": "Carrinho de Café",
        "category": "Equipamento",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 350,00",
        "description": "Carrinho móvel para servir bebidas em gravações e cursos.",
    },
    {
        "code": "042",
        "name": "Monitor 27” Samsung",
        "category": "Equipamento",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 5.700,00",
        "description": "Monitores Full HD para edição, operação e multi-tarefa.",
    },
    {
        "code": "043",
        "name": "Computadores Simples",
        "category": "Equipamento",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 9.000,00",
        "description": "PCs básicos para funções administrativas e operacionais.",
    },
    {
        "code": "044",
        "name": "PC de Edição",
        "category": "Equipamento",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 15.000,00",
        "description": "Estação profissional para edição de vídeo de alta carga.",
    },
    {
        "code": "045",
        "name": "Kit Teclado Sem Fio",
        "category": "Equipamento",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 1.150,00",
        "description": "Periféricos wireless para mesas de operação.",
    },
    {
        "code": "046",
        "name": "Ar-condicionado 24k BTU",
        "category": "Eletrodoméstico",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 5.000,00",
        "description": "Climatização de alta potência para o estúdio.",
    },
    {
        "code": "047",
        "name": "Estação de Trabalho",
        "category": "Mobiliário",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 1.000,00",
        "description": "Mesa principal de operação.",
    },
    {
        "code": "048",
        "name": "Smart TV LG 65” 4K",
        "category": "Equipamento",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 2.800,00",
        "description": "Tela de alta definição para cursos e apresentações.",
    },
    {
        "code": "049",
        "name": "Softbox Triopod 90cm",
        "category": "Equipamento",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 1.308,00",
        "description": "Softbox parabólico para iluminação mais direcional.",
    },
    {
        "code": "050",
        "name": "Refletores T-8 60W",
        "category": "Equipamento",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 3.100,00",
        "description": "Conjunto de lâmpadas LED potentes para iluminação geral.",
    },
    {
        "code": "051",
        "name": "Suporte TV de Chão",
        "category": "Equipamento",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 518,00",
        "description": "Suporte móvel para telas grandes em eventos.",
    },
    {
        "code": "052",
        "name": "30 Cadeiras Universitárias",
        "category": "Mobiliário",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 5.310,00",
        "description": "Cadeiras para cursos e treinamentos.",
    },
    {
        "code": "053",
        "name": "5 Cadeiras Dot Sky Blue",
        "category": "Mobiliário",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 3.500,00",
        "description": "Cadeiras ergonômicas para longas jornadas.",
    },
    {
        "code": "054",
        "name": "JBL Partybox Encore",
        "category": "Equipamento",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 2.900,00",
        "description": "Caixa de som potente com microfone incluso.",
    },
    {
        "code": "055",
        "name": "Micro Converter SDI/HDMI",
        "category": "Equipamento",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 850,00",
        "description": "Conversor para interligação de equipamentos profissionais.",
    },
    {
        "code": "056",
        "name": "Ar-Condicionado (Sala)",
        "category": "Equipamento",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 3.600,00",
        "description": "Sistema de climatização para conforto da equipe.",
    },
    {
        "code": "057",
        "name": "Fone Philips TWS",
        "category": "Equipamento",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 140,00",
        "description": "Fone Bluetooth para mobilidade no dia a dia.",
    },
    {
        "code": "058",
        "name": "Blackmagic Pocket 4K",
        "category": "Equipamento",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 15.000,00",
        "description": "Câmera cinema digital para produções profissionais.",
    },
    {
        "code": "059",
        "name": "Tripé Profissional",
        "category": "Equipamento",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 1.230,00",
        "description": "Tripé de alta estabilidade para câmera cinema.",
    },
    {
        "code": "061",
        "name": "Puff Redondo",
        "category": "Mobiliário",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 77,00",
        "description": "Puff decorativo e funcional.",
    },
    {
        "code": "062",
        "name": "Bolsa de Tripés 110cm",
        "category": "Equipamento",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 208,00",
        "description": "Bolsa rígida para transporte de suportes.",
    },
    {
        "code": "063",
        "name": "Furadeira 12v",
        "category": "Equipamento",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 520,00",
        "description": "Ferramenta para instalações, montagens e ajustes.",
    },
    {
        "code": "064",
        "name": "Tomadas Inteligentes",
        "category": "Equipamento",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 360,00",
        "description": "Automação e controle remoto de energia.",
    },
    {
        "code": "065",
        "name": "Amaran 150c",
        "category": "Equipamento",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 4.200,00",
        "description": "Iluminador RGBWW para produções avançadas.",
    },
    {
        "code": "066",
        "name": "Gaveteiro 3 Gavetas",
        "category": "Mobiliário",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 240,00",
        "description": "Móvel auxiliar para documentos.",
    },
    {
        "code": "067",
        "name": "Softbox Grid 60cm",
        "category": "Equipamento",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 1.070,00",
        "description": "Softbox com grid para controle preciso da luz.",
    },
    {
        "code": "068",
        "name": "Tripé Greika",
        "category": "Equipamento",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 500,00",
        "description": "Tripé reforçado para luzes de produção.",
    },
    {
        "code": "069",
        "name": "Tabelas Box",
        "category": "Mobiliário",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 360,00",
        "description": "Bases para apoio ou exercícios funcionais.",
    },
    {
        "code": "070",
        "name": "Bolsa de Cabos",
        "category": "Equipamento",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 342,00",
        "description": "Mala para organização e transporte de cabos.",
    },
    {
        "code": "071",
        "name": "Case Baú 100×50×50",
        "category": "Equipamento",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 1.800,00",
        "description": "Baú rígido com rodas para equipamentos pesados.",
    },
    {
        "code": "072",
        "name": "Carregador Baseus",
        "category": "Equipamento",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 90,00",
        "description": "Fonte para alimentações específicas de câmera/conversor.",
    },
    {
        "code": "073",
        "name": "Mochila Profissional",
        "category": "Equipamento",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 395,00",
        "description": "Mochila acolchoada para câmeras e lentes.",
    },
    {
        "code": "074",
        "name": "Bolsa de Couro",
        "category": "Equipamento",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 80,00",
        "description": "Bolsa reforçada para transporte geral.",
    },
    {
        "code": "075",
        "name": "Carrinho de Carga",
        "category": "Mobiliário",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 180,00",
        "description": "Carrinho para transporte de itens pesados.",
    },
    {
        "code": "076",
        "name": "Webcam Logitech C920s",
        "category": "Equipamento",
        "acquisition_date": "01/01/2025",
        "acquisition_value": "R$ 450,00",
        "description": "Webcam Full HD para transmissões e videochamadas.",
    },
]

# Quantidades canônicas por código quando não explícitas no nome
KNOWN_QUANTITIES = {
    "001": 2,
    "002": 2,
    "007": 2,
    "010": 2,
    "011": 3,
    "012": 16,
    "018": 2,
    "021": 4,
    "022": 20,
    "023": 2,
}


def seed_equipment():
    """Popula o banco de dados com equipamentos"""
    db = SessionLocal()
    
    try:
        # Limpar equipamentos existentes (raw SQL para evitar incompatibilidades de schema)
        print("🗑️  Removendo equipamentos existentes...")
        db.execute(text("DELETE FROM equipment"))
        db.commit()
        print("✅ Equipamentos removidos.")

        print(f"🌱 Inserindo {len(EQUIPMENT_DATA)} equipamentos (1 registro por item)...")
        inserted = 0
        
        for item in EQUIPMENT_DATA:
            # Inferir quantidade a partir do campo explícito ou do prefixo no nome
            raw_name = item["name"]
            explicit_quantity = item.get("quantity")
            inferred_q, cleaned_name = infer_quantity_and_clean_name(raw_name)
            quantity = explicit_quantity or KNOWN_QUANTITIES.get(item["code"]) or inferred_q
            if quantity is None or quantity < 1:
                quantity = 1

            acquisition_value_str = item.get("acquisition_value", "0")
            total_value_cents = parse_currency_to_cents(acquisition_value_str)
            acquisition_date = parse_date(item["acquisition_date"])
            description = item.get("description")

            # Se quantidade > 1, assumimos que o valor informado é o total e calculamos unitário,
            # a menos que o item marque explicitamente que o valor já é unitário
            if quantity > 1 and total_value_cents > 0 and not item.get("unit_value_is_unit", False):
                per_unit_cents = int(
                    (Decimal(total_value_cents) / Decimal(quantity)).quantize(Decimal("1"), rounding=ROUND_HALF_UP)
                )
            else:
                per_unit_cents = total_value_cents

            # Montar notas informativas
            note_parts = []
            if description:
                note_parts.append(description)
            if per_unit_cents > 0:
                note_parts.append(f"Valor unitário (centavos): {per_unit_cents}")

            notes = "\n\n".join(note_parts) if note_parts else None

            # Inserir um único registro por equipamento com quantidade e valor unitário
            db.execute(
                text(
                    """
                    INSERT INTO equipment (
                        code, name, category, acquisition_date, status, location, notes, quantity, unit_value_cents
                    ) VALUES (
                        :code, :name, :category, :acquisition_date, :status, :location, :notes, :quantity, :unit_value_cents
                    )
                    """
                ),
                {
                    "code": item["code"],
                    "name": cleaned_name if quantity > 1 else raw_name,
                    "category": item["category"],
                    "acquisition_date": acquisition_date,
                    "status": EquipmentStatus.AVAILABLE.value,
                    "location": item.get("location"),
                    "notes": notes,
                    "quantity": int(quantity),
                    "unit_value_cents": per_unit_cents if per_unit_cents > 0 else None,
                },
            )
            inserted += 1
        
        db.commit()
        print(f"✅ {inserted} equipamentos inseridos com sucesso!")
        
        # Mostrar estatísticas
        # Estatísticas (raw SQL)
        total = db.execute(text("SELECT COUNT(*) FROM equipment")).scalar() or 0
        by_category = db.execute(
            text("SELECT category, COUNT(id) FROM equipment GROUP BY category ORDER BY category")
        ).fetchall()

        print(f"\n📊 Estatísticas:")
        print(f"   Total de equipamentos: {total}")
        print(f"   Por categoria:")
        for category, count in by_category:
            print(f"     - {category}: {count}")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Erro ao inserir equipamentos: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_equipment()
