#!/usr/bin/env python3
"""
Script para popular o banco de dados com equipamentos de patrimônio
"""
import sys
from datetime import datetime
from pathlib import Path

# Adicionar o diretório raiz ao path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.db.session import SessionLocal
from app.models import Equipment
from app.models.enums import EquipmentStatus


def parse_currency(value: str) -> float:
    """Converte string de moeda brasileira para float"""
    if not value or value == "-":
        return 0.0
    # Remove R$, espaços e pontos de milhar, substitui vírgula por ponto
    value = value.replace("R$", "").replace(" ", "").replace(".", "").replace(",", ".")
    return float(value)


def parse_date(date_str: str) -> datetime:
    """Converte string de data DD/MM/YYYY para datetime"""
    return datetime.strptime(date_str, "%d/%m/%Y")


# Lista de equipamentos para inserir
EQUIPMENT_DATA = [
    {"code": "001", "name": "Softbox Lanterna Bowens Greika 65 cm", "category": "Equipamento", "quantity": 2, "location": "Depósito", "acquisition_date": "01/01/2025", "acquisition_value": "R$ 760,00"},
    {"code": "002", "name": "Estante 6 Prateleiras de Aço na cor Preta", "category": "Mobiliário", "quantity": 2, "location": "Depósito", "acquisition_date": "01/01/2025", "acquisition_value": "R$ 500,00"},
    {"code": "003", "name": "Mesa de Computador Industrial na cor Madeira", "category": "Mobiliário", "quantity": 1, "location": "Depósito", "acquisition_date": "01/01/2025", "acquisition_value": "R$ 200,00"},
    {"code": "004", "name": "Mesa Dobrável de Alumínio com Tampo de MDF 90 x 60 CM", "category": "Mobiliário", "quantity": 1, "location": "Depósito", "acquisition_date": "01/01/2025", "acquisition_value": "R$ 162,00"},
    {"code": "005", "name": "Microfone Fifine XLR AM8 Dinâmico Cardioide cor Preto", "category": "Equipamento", "quantity": 1, "location": "Sala Principal", "acquisition_date": "01/01/2025", "acquisition_value": "R$ 320,00"},
    {"code": "006", "name": "Interface de Áudio Focusrite 3ª Gen Scarlett 2i2 3ª Geração", "category": "Equipamento", "quantity": 1, "location": "Sala Principal", "acquisition_date": "01/01/2025", "acquisition_value": "R$ 1.900,00"},
    {"code": "007", "name": "Iluminação Led Amaran 200xS Bicolor Cob Luz Contínua 200w", "category": "Equipamento", "quantity": 2, "location": "Estúdio", "acquisition_date": "01/01/2025", "acquisition_value": "R$ 5.600,00"},
    {"code": "008", "name": "Bastão Para Selfie Com Mini Controle Remoto Inova Sel-8548", "category": "Equipamento", "quantity": 1, "location": "Sala Principal", "acquisition_date": "01/01/2025", "acquisition_value": "R$ 40,00"},
    {"code": "009", "name": "Máquina de Cartão de crédito", "category": "Equipamento", "quantity": 1, "location": "Sala Principal", "acquisition_date": "01/01/2025", "acquisition_value": "R$ 200,00"},
    {"code": "010", "name": "Fone Headset Gamer Havit Hv-h2002d 3.5mm Cor Preto", "category": "Equipamento", "quantity": 2, "location": "Sala Principal/Estúdio", "acquisition_date": "01/01/2025", "acquisition_value": "R$ 470,00"},
    {"code": "011", "name": "Chroma Key verde Oxford e lycra 4 metros de largura e 3 de altura", "category": "Equipamento", "quantity": 3, "location": "Depósito/Estúdio", "acquisition_date": "01/01/2025", "acquisition_value": "R$ 270,00"},
    {"code": "012", "name": "Grampo de Prender o Chroam key", "category": "Equipamento", "quantity": 16, "location": "Depósito", "acquisition_date": "01/01/2025", "acquisition_value": "R$ 50,00"},
    {"code": "013", "name": "WAP Aspirador de Pó e Água GTW 10", "category": "Equipamento", "quantity": 1, "location": "Depósito", "acquisition_date": "01/01/2025", "acquisition_value": "R$ 270,00"},
    {"code": "014", "name": "Tripé de Ação Compacto Manfrotto MKCOMPACTACN-BK 60", "category": "Equipamento", "quantity": 1, "location": "Depósito", "acquisition_date": "01/01/2025", "acquisition_value": "R$ 1.500,00"},
    {"code": "015", "name": "Suporte Tripé de Chão P/ Caixa De Som Pedestal", "category": "Equipamento", "quantity": 1, "location": "Depósito", "acquisition_date": "01/01/2025", "acquisition_value": "R$ 150,00"},
    {"code": "016", "name": "Tripé para Tela Mapa 2,80 Metros", "category": "Equipamento", "quantity": 1, "location": "Depósito", "acquisition_date": "01/01/2025", "acquisition_value": "R$ 140,00"},
    {"code": "017", "name": "Tripé de Iluminação Altura Máxima de 2 Metros", "category": "Equipamento", "quantity": 1, "location": "Depósito", "acquisition_date": "01/01/2025", "acquisition_value": "R$ 80,00"},
    {"code": "018", "name": "Suporte de Parede T Holder T120 P/ Estúdio E Iluminação 12cm", "category": "Equipamento", "quantity": 2, "location": "Depósito", "acquisition_date": "01/01/2025", "acquisition_value": "R$ 200,00"},
    {"code": "019", "name": "Ferro de Passar Black + Decker Roupa a Seco, Metálico Preto", "category": "Equipamento", "quantity": 1, "location": "Depósito", "acquisition_date": "01/01/2025", "acquisition_value": "R$ 140,00"},
    {"code": "020", "name": "Escada Multiuso de Alumínio 5 Degraus", "category": "Mobiliário", "quantity": 1, "location": "Depósito", "acquisition_date": "01/01/2025", "acquisition_value": "R$ 180,00"},
    {"code": "021", "name": "Mochila Pirulito Acessibilidade", "category": "Equipamento", "quantity": 4, "location": "Depósito", "acquisition_date": "01/01/2025", "acquisition_value": "R$ 600,00"},
    {"code": "022", "name": "Rádio de Audiodescrição", "category": "Equipamento", "quantity": 20, "location": "Sala Principal", "acquisition_date": "01/01/2025", "acquisition_value": "R$ 2.200,00"},
    {"code": "023", "name": "Fone de ouvido para shows kz-EDX PRO", "category": "Equipamento", "quantity": 2, "location": "Sala Principal", "acquisition_date": "01/01/2025", "acquisition_value": "R$ 300,00"},
    {"code": "024", "name": "Teclado e Mouse com fio USB", "category": "Equipamento", "quantity": 1, "location": "Depósito", "acquisition_date": "01/01/2025", "acquisition_value": "R$ 70,00"},
    {"code": "025", "name": "Carregador Portátil 20000 mah 50w Power Bank", "category": "Equipamento", "quantity": 1, "location": "Sala Principal", "acquisition_date": "01/01/2025", "acquisition_value": "R$ 220,00"},
    {"code": "026", "name": "Microfone para Palestra Com Fio De 3m Alta Frequência", "category": "Equipamento", "quantity": 1, "location": "Depósito", "acquisition_date": "01/01/2025", "acquisition_value": "R$ 40,00"},
    {"code": "027", "name": "Transmissor sem fio para Audiodescrição", "category": "Equipamento", "quantity": 2, "location": "Sala Principal", "acquisition_date": "01/01/2025", "acquisition_value": "R$ 500,00"},
    {"code": "028", "name": "Frigobar Philco 92 Litros Inox PFG111I 110V", "category": "Eletrodoméstico", "quantity": 1, "location": "Cozinha", "acquisition_date": "01/01/2025", "acquisition_value": "R$ 1.189,07"},
    {"code": "029", "name": "Purificador Electrolux Eletrônico Compacto Experience Pure 4x Digital Cinza", "category": "Eletrodoméstico", "quantity": 1, "location": "Cozinha", "acquisition_date": "01/01/2025", "acquisition_value": "R$ 699,00"},
    {"code": "030", "name": "Micro-ondas Electrolux 23L Prata", "category": "Eletrodoméstico", "quantity": 1, "location": "Cozinha", "acquisition_date": "01/01/2025", "acquisition_value": "R$ 670,00"},
    {"code": "031", "name": "Cafeteira Elétrica Electrolux 15 Xícaras", "category": "Eletrodoméstico", "quantity": 1, "location": "Cozinha", "acquisition_date": "01/01/2025", "acquisition_value": "R$ 150,00"},
    {"code": "032", "name": "Mesa De Jantar industrial 6 Pessoas", "category": "Eletrodoméstico", "quantity": 1, "location": "Cozinha", "acquisition_date": "01/01/2025", "acquisition_value": "R$ 420,00"},
    {"code": "033", "name": "Banquetas Argila Alta para Balcão Gourmet", "category": "Mobiliário", "quantity": 5, "location": "Cozinha", "acquisition_date": "01/01/2025", "acquisition_value": "R$ 670,00"},
    {"code": "034", "name": "Notebook Gamer Acer Nitro 5 Intel Core i7-11800H", "category": "Equipamento", "quantity": 1, "location": "Sala Principal", "acquisition_date": "01/01/2025", "acquisition_value": "R$ 5.270,00"},
    {"code": "035", "name": "Tablet Samsung Galaxy Tab S6 Lite com Caneta 10,4\" 64GB 4GB RAM", "category": "Equipamento", "quantity": 1, "location": "Casa Gabriel", "acquisition_date": "01/01/2025", "acquisition_value": "R$ 1.800,00"},
    {"code": "036", "name": "Armário Roupeiro Aço 8 Portas", "category": "Mobiliário", "quantity": 1, "location": "Cozinha", "acquisition_date": "01/01/2025", "acquisition_value": "R$ 675,00"},
    {"code": "037", "name": "Balcão para Escritório 3 portas na cor Branca", "category": "Mobiliário", "quantity": 1, "location": "Sala Principal", "acquisition_date": "01/01/2025", "acquisition_value": "R$ 436,00"},
    {"code": "038", "name": "Escrivaninha Studio na cor Branco e Pé Preto", "category": "Mobiliário", "quantity": 2, "location": "Sala Principal/Estúdio", "acquisition_date": "01/01/2025", "acquisition_value": "R$ 732,00"},
    {"code": "039", "name": "Cafeteira elétrica Arno Nescafe Dolce Gusto", "category": "Eletrodoméstico", "quantity": 1, "location": "Sala Principal", "acquisition_date": "01/01/2025", "acquisition_value": "R$ 600,00"},
    {"code": "040", "name": "Extensão Tripolar com Carretel 20 Metros", "category": "Equipamento", "quantity": 1, "location": "Estúdio", "acquisition_date": "01/01/2025", "acquisition_value": "R$ 188,00"},
    {"code": "041", "name": "Carrinho de Café", "category": "Equipamento", "quantity": 1, "location": "Estúdio", "acquisition_date": "01/01/2025", "acquisition_value": "R$ 350,00"},
    {"code": "042", "name": "Monitor Gamer Samsung 27\" 75hz 5ms T350 Full Hd", "category": "Equipamento", "quantity": 6, "location": "Sala Principal/Estúdio", "acquisition_date": "01/01/2025", "acquisition_value": "R$ 5.700,00"},
    {"code": "043", "name": "Computador Simples", "category": "Equipamento", "quantity": 3, "location": "Sala Principal", "acquisition_date": "01/01/2025", "acquisition_value": "R$ 9.000,00"},
    {"code": "044", "name": "Computador de Edição", "category": "Equipamento", "quantity": 1, "location": "Estúdio", "acquisition_date": "01/01/2025", "acquisition_value": "R$ 15.000,00"},
    {"code": "045", "name": "Kit Teclado Sem Fio Dell", "category": "Equipamento", "quantity": 5, "location": "Sala Principal/Estúdio", "acquisition_date": "01/01/2025", "acquisition_value": "R$ 1.150,00"},
    {"code": "046", "name": "Ar Condicionado Split Hi Wall Electrolux 24000 BTU/h", "category": "Eletrodoméstico", "quantity": 1, "location": "Estúdio", "acquisition_date": "01/01/2025", "acquisition_value": "R$ 5.000,00"},
    {"code": "047", "name": "Estação de Trabalho na cor Branca", "category": "Mobiliário", "quantity": 1, "location": "Sala Principal", "acquisition_date": "01/01/2025", "acquisition_value": "R$ 1.000,00"},
    {"code": "048", "name": "Smart Tv 4k 65 Lg Uhd 65ut8050", "category": "Equipamento", "quantity": 1, "location": "Gs Cursos", "acquisition_date": "01/01/2025", "acquisition_value": "R$ 2.800,00"},
    {"code": "049", "name": "Softbox Triopod 90 cm parabólico gkp-90", "category": "Equipamento", "quantity": 2, "location": "Estúdio", "acquisition_date": "01/01/2025", "acquisition_value": "R$ 1.308,00"},
    {"code": "050", "name": "Refletores Lâmpadas Led Luz Fria Mako t-8 Bivolt 6500k 60w", "category": "Equipamento", "quantity": 2, "location": "Estúdio", "acquisition_date": "01/01/2025", "acquisition_value": "R$ 3.100,00"},
]


def seed_equipment():
    """Popula o banco de dados com equipamentos"""
    db = SessionLocal()
    
    try:
        # Limpar equipamentos existentes
        existing_count = db.query(Equipment).count()
        if existing_count > 0:
            print(f"🗑️  Removendo {existing_count} equipamentos existentes...")
            db.query(Equipment).delete()
            db.commit()
            print("✅ Equipamentos removidos.")
        
        print(f"🌱 Inserindo {len(EQUIPMENT_DATA)} equipamentos...")
        inserted = 0
        
        for item in EQUIPMENT_DATA:
            # Criar equipamento para cada unidade da quantidade
            quantity = item.get("quantity", 1)
            acquisition_value = parse_currency(item.get("acquisition_value", "0"))
            acquisition_date = parse_date(item["acquisition_date"])
            
            for i in range(quantity):
                # Se quantidade > 1, adicionar sufixo ao código
                code = f"{item['code']}-{i+1:02d}" if quantity > 1 else item["code"]
                
                equipment = Equipment(
                    code=code,
                    name=item["name"],
                    category=item["category"],
                    acquisition_date=acquisition_date,
                    status=EquipmentStatus.AVAILABLE,
                    location=item.get("location"),
                    notes=f"Valor de aquisição: R$ {acquisition_value:.2f}" if acquisition_value > 0 else None
                )
                
                db.add(equipment)
                inserted += 1
        
        db.commit()
        print(f"✅ {inserted} equipamentos inseridos com sucesso!")
        
        # Mostrar estatísticas
        from sqlalchemy import func
        total = db.query(Equipment).count()
        by_category = db.query(Equipment.category, func.count(Equipment.id)).group_by(Equipment.category).all()
        
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
