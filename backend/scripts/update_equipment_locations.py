"""
Script para atualizar as localizações dos equipamentos no banco de dados.
Baseado no arquivo 'Lista de equipamentos.md'.
"""

import sys
from pathlib import Path

# Adiciona o diretório raiz ao path para importar os módulos da aplicação
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.inventory import Equipment


# Mapeamento de código -> localização extraído do documento
EQUIPMENT_LOCATIONS = {
    "001": "Depósito",
    "002": "Depósito",
    "003": "Depósito",
    "004": "Depósito",
    "005": "Sala Principal",
    "006": "Sala Principal",
    "007": "Estúdio",
    "008": "Sala Principal",
    "009": "Sala Principal",
    "010": "Sala Principal/Estúdio",
    "011": "Depósito/Estúdio",
    "012": "Depósito",
    "013": "Depósito",
    "014": "Depósito",
    "015": "Depósito",
    "016": "Depósito",
    "017": "Depósito",
    "018": "Depósito",
    "019": "Depósito",
    "020": "Depósito",
    "021": "Depósito",
    "022": "Sala Principal",
    "023": "Sala Principal",
    "024": "Depósito",
    "025": "Sala Principal",
    "026": "Depósito",
    "027": "Sala Principal",
    "028": "Cozinha",
    "029": "Cozinha",
    "030": "Cozinha",
    "031": "Cozinha",
    "032": "Cozinha",
    "033": "Cozinha",
    "034": "Sala Principal",
    "035": "Casa Gabriel",
    "036": "Cozinha",
    "037": "Sala Principal",
    "038": "Sala Principal/Estúdio",
    "039": "Sala Principal",
    "040": "Estúdio",
    "041": "Estúdio",
    "042": "4 Sala Principal / 2 Estúdio",
    "043": "Sala Principal",
    "044": "Estúdio",
    "045": "Sala Principal/Estúdio",
    "046": "Estúdio",
    "047": "Sala Principal",
    "048": "Gs Cursos",
    "049": "Estúdio",
    "050": "Estúdio",
    "051": "Estúdio",
    "052": "Gs Cursos",
    "053": "4 Sala Principal / 1 Estúdio",
    "054": "Estúdio",
    "055": "Sala Principal",
    "056": "Sala Principal",
    "057": "Sala Principal",
    "058": "Estúdio",
    "059": "Estúdio",
    "060": "Gs Cursos",
    "061": "Estúdio",
    "062": "Depósito",
    "063": "Depósito",
    "064": "Estúdio",
    "065": "Sala Principal",
    "066": "Estúdio",
    "067": "Sala Principal",
    "068": "Sala Principal",
    "069": "Estúdio",
    "070": "Sala Principal",
    "071": "Sala Principal",
    "072": "Sala Principal",
    "073": "Depósito",
    "074": "Sala Principal",
    "075": "Depósito",
    "076": "Sala Principal",
}


def update_locations():
    """Atualiza as localizações dos equipamentos no banco de dados."""
    
    print("🔄 Iniciando atualização de localizações dos equipamentos...")
    
    updated_count = 0
    not_found_count = 0
    
    session = SessionLocal()
    
    try:
        for code, location in EQUIPMENT_LOCATIONS.items():
            # Busca o equipamento pelo código
            result = session.execute(
                select(Equipment).where(Equipment.code == code)
            )
            equipment = result.scalar_one_or_none()
            
            if equipment:
                # Atualiza a localização
                equipment.location = location
                updated_count += 1
                print(f"✅ {code} - {equipment.name[:40]:<40} → {location}")
            else:
                not_found_count += 1
                print(f"⚠️  Equipamento {code} não encontrado no banco de dados")
        
        # Commit das alterações
        session.commit()
        
        print("\n" + "=" * 80)
        print(f"✨ Atualização concluída!")
        print(f"   • Equipamentos atualizados: {updated_count}")
        print(f"   • Equipamentos não encontrados: {not_found_count}")
        print("=" * 80)
        
    except Exception as e:
        session.rollback()
        print(f"\n❌ Erro ao atualizar localizações: {e}")
        raise
    finally:
        session.close()


def main():
    """Função principal."""
    try:
        update_locations()
    except Exception as e:
        print(f"\n❌ Erro fatal: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
