"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Path,
  Defs,
  LinearGradient,
  Stop,
  G,
} from "@react-pdf/renderer";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 11,
    paddingTop: 32,
    paddingBottom: 60,
    paddingHorizontal: 60,
    backgroundColor: "#ffffff",
    color: "#18181b",
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  headerLeft: {
    flex: 1,
    gap: 2,
  },
  logoContainer: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  headerRight: {
    textAlign: "right",
    paddingTop: 6,
    width: 60,
    alignItems: "flex-end",
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: "#18181b",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: 500,
  },
  companyBlock: {
    marginTop: 2,
    gap: 1,
  },
  docTitleBlock: {
    marginTop: 8,
    marginBottom: 12,
  },
  docTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: "#18181b",
  },
  docSubtitle: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: 500,
    marginTop: 2,
  },
  companyLine: {
    fontSize: 10,
    color: "#4b5563",
  },
  // Metadata section
  metadataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f4f4f5",
    paddingVertical: 16,
    marginBottom: 24,
  },
  metadataCol: {
    gap: 4,
  },
  metadataColRight: {
    gap: 4,
    textAlign: "right",
    alignItems: "flex-end",
  },
  metadataLabel: {
    fontWeight: 600,
    color: "#18181b",
  },
  metadataValue: {
    color: "#52525b",
  },
  metadataLine: {
    flexDirection: "row",
    gap: 4,
    fontSize: 11,
  },
  // Entities section
  entitiesRow: {
    flexDirection: "row",
    gap: 40,
    marginBottom: 30,
  },
  entityCol: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: "#18181b",
    textTransform: "uppercase",
    letterSpacing: 1,
    borderBottomWidth: 1,
    borderColor: "#f4f4f5",
    paddingBottom: 4,
    marginBottom: 10,
  },
  entityName: {
    fontSize: 11,
    fontWeight: 700,
    color: "#18181b",
    marginBottom: 2,
  },
  entityDetail: {
    fontSize: 10,
    color: "#52525b",
    marginBottom: 2,
  },
  entityPlaceholder: {
    fontSize: 10,
    color: "#a1a1aa",
  },
  // Content section
  contentSection: {
    flex: 1,
    marginBottom: 20,
  },
  contentTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: "#18181b",
    marginBottom: 8,
  },
  contentText: {
    fontSize: 10,
    color: "#52525b",
    lineHeight: 1.6,
    textAlign: "justify",
  },
  // Signature section
  signatureSection: {
    marginTop: "auto",
    paddingTop: 40,
  },
  signatureDate: {
    fontSize: 10,
    color: "#52525b",
    marginBottom: 50,
  },
  signatureLine: {
    width: "60%",
    borderTopWidth: 1,
    borderColor: "#d4d4d8",
    paddingTop: 10,
  },
  signatureName: {
    fontSize: 11,
    fontWeight: 600,
    color: "#18181b",
    textAlign: "center",
  },
  signatureCompany: {
    fontSize: 9,
    color: "#71717a",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginTop: 4,
    textAlign: "center",
  },
  // Watermark
  watermark: {
    position: "absolute",
    // Centered on A4 (595x842 pt): (595-260)/2 ≈ 168, (842-260)/2 ≈ 291
    top: 291,
    left: 168,
    width: 260,
    height: 260,
    opacity: 0.05, // 5% keeps readability
  },
  // Page 2 - Client signature
  page2Header: {
    marginBottom: 40,
  },
  logoSmall: {
    width: 50,
    height: 50,
  },
  clientSignatureArea: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 80,
  },
  clientSignatureLine: {
    width: "60%",
    borderTopWidth: 1,
    borderColor: "#71717a",
    paddingTop: 10,
  },
  clientSignatureLabel: {
    fontSize: 11,
    color: "#52525b",
    textAlign: "center",
  },
  watermarkPage2: {
    position: "absolute",
    // Centered, slightly smaller on page 2
    top: 301,
    left: 178,
    width: 240,
    height: 240,
    opacity: 0.05,
  },
  // Items table
  itemsSection: {
    marginBottom: 20,
  },
  itemsTable: {
    width: "100%",
    marginTop: 8,
  },
  itemsHeader: {
    flexDirection: "row",
    backgroundColor: "#f4f4f5",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderColor: "#e4e4e7",
  },
  itemsHeaderText: {
    fontSize: 9,
    fontWeight: 600,
    color: "#18181b",
    textTransform: "uppercase",
  },
  itemRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderColor: "#f4f4f5",
  },
  itemColDesc: {
    flex: 3,
  },
  itemColQty: {
    flex: 1,
    textAlign: "center",
  },
  itemColValue: {
    flex: 1,
    textAlign: "right",
  },
  itemColTotal: {
    flex: 1,
    textAlign: "right",
  },
  itemText: {
    fontSize: 10,
    color: "#52525b",
  },
  // Footer/Total
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingTop: 12,
    paddingRight: 8,
    marginTop: 8,
    borderTopWidth: 2,
    borderColor: "#18181b",
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: "#18181b",
    marginRight: 20,
  },
  totalValue: {
    fontSize: 11,
    fontWeight: 700,
    color: "#18181b",
  },
});

export interface ProposalItem {
  id: string;
  description: string;
  quantity: number;
  unitValue: number;
}

export interface ProposalPdfData {
  code?: string;
  name?: string;
  status?: string;
  date?: Date;
  validity?: Date;
  clientName?: string;
  contactName?: string;
  companyName?: string;
  companyCnpj?: string;
  companyAddress?: string;
  companyEmail?: string;
  companyPhone?: string;
  responsibleName?: string;
  items?: ProposalItem[];
  observations?: string;
}

interface ProposalPdfDocumentProps {
  data: ProposalPdfData;
}

// Logo component using react-pdf's Svg primitives
function GsLogo({ size = 70, opacity = 1 }: { size?: number; opacity?: number }) {
  return (
    <Svg
      viewBox="0 0 54.33 47.14"
      style={{ width: size, height: size * (47.14 / 54.33) }}
      opacity={opacity}
    >
      <Defs>
        <LinearGradient id="gs-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#6620F2" />
          <Stop offset="100%" stopColor="#31EBCB" />
        </LinearGradient>
      </Defs>
      <G>
        <Path
          fill="url(#gs-gradient)"
          d="M15.4,46.22l2.71-2.71,3.62-3.63h-10.16c-.39,0-.7.3-.71.67v4.01c0,1.41,1.16,2.57,2.58,2.57.78,0,1.49-.36,1.96-.91Z"
        />
        <Path
          fill="url(#gs-gradient)"
          d="M28.97,25.38l-3.62,3.63-2.05,2.05c-.88.87-2.05,1.57-3.35,1.57-4.24,0-8.47,0-12.71,0-3.98,0-7.24-3.26-7.24-7.24v-14.53C0,6.88,3.26,3.62,7.24,3.62h28.97s-3.62,3.63-3.62,3.63l-2.05,2.05c-.88.87-2.05,1.57-3.35,1.57H7.24s0,0,0,0v14.51h10.87s10.87,0,10.87,0h0Z"
        />
        <Path
          fill="url(#gs-gradient)"
          d="M25.35,21.76l3.62-3.63,2.05-2.05c.88-.87,2.05-1.57,3.35-1.57,4.24,0,8.47,0,12.71,0,3.98,0,7.24,3.26,7.24,7.24v14.53c0,3.98-3.26,7.24-7.24,7.24h-28.97s3.62-3.63,3.62-3.63l2.05-2.05c.88-.87,2.05-1.57,3.35-1.57h19.95s0,0,0,0v-14.51h-10.87s-10.87,0-10.87,0h0Z"
        />
        <Path
          fill="url(#gs-gradient)"
          d="M38.93.91l-2.71,2.71-3.62,3.63h10.16c.39,0,.7-.3.71-.67V2.57c0-1.41-1.16-2.57-2.58-2.57-.78,0-1.49.36-1.96.91h0Z"
        />
      </G>
    </Svg>
  );
}

export function ProposalPdfDocument({ data }: ProposalPdfDocumentProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const calculateTotal = () => {
    if (!data.items || data.items.length === 0) return 0;
    return data.items.reduce((sum, item) => sum + item.quantity * item.unitValue, 0);
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return "--/--/----";
    return format(date, "dd/MM/yyyy");
  };

  const formatFullDate = () => {
    return format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  return (
    <Document>
      {/* Page 1 - Main Content */}
      <Page size="A4" style={styles.page}>
        {/* Watermark */}
        <View style={styles.watermark}>
          <GsLogo size={240} opacity={0.05} />
        </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.companyBlock}>
            <Text style={[styles.companyLine, { fontWeight: 700 }]}>
              {data.companyName || "GS PRODUÇÕES E ACESSIBILIDADE"}
            </Text>
            <Text style={styles.companyLine}>CNPJ: {data.companyCnpj || "35.282.691/0001-48"}</Text>
            <Text style={styles.companyLine}>{data.companyAddress || "Rua Cinco de Julho, 388, APT 103"}</Text>
            <Text style={styles.companyLine}>Copacabana, Rio de Janeiro - RJ - 22051-030</Text>
            <Text style={styles.companyLine}>E-mail: {data.companyEmail || "comercial@gsproducao.com"}</Text>
            <Text style={styles.companyLine}>Telefone: {data.companyPhone || "+55 21 96819-9637"}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <GsLogo size={42} />
        </View>
      </View>

      {/* Document Title (separate from header) */}
      <View style={styles.docTitleBlock}>
        <Text style={styles.docTitle}>Proposta Comercial</Text>
        {data.name && data.name !== "Nova Proposta" && (
          <Text style={styles.docSubtitle}>{data.name}</Text>
        )}
      </View>

        {/* Metadata */}
        <View style={styles.metadataRow}>
          <View style={styles.metadataCol}>
            <View style={styles.metadataLine}>
              <Text style={styles.metadataLabel}>Código:</Text>
              <Text style={styles.metadataValue}> {data.code || "------"}</Text>
            </View>
            <View style={styles.metadataLine}>
              <Text style={styles.metadataLabel}>Status da Proposta:</Text>
              <Text style={styles.metadataValue}> {data.status || "Aberto"}</Text>
            </View>
          </View>
          <View style={styles.metadataColRight}>
            <View style={styles.metadataLine}>
              <Text style={styles.metadataLabel}>Data da Proposta:</Text>
              <Text style={styles.metadataValue}> {formatDate(data.date || new Date())}</Text>
            </View>
            <View style={styles.metadataLine}>
              <Text style={styles.metadataLabel}>Validade:</Text>
              <Text style={styles.metadataValue}> {formatDate(data.validity)}</Text>
            </View>
          </View>
        </View>

        {/* Entities */}
        <View style={styles.entitiesRow}>
          <View style={styles.entityCol}>
            <Text style={styles.sectionTitle}>Empresa</Text>
            <Text style={styles.entityName}>
              {data.companyName || "GS PRODUÇÕES E ACESSIBILIDADE"}
            </Text>
          </View>
          <View style={styles.entityCol}>
            <Text style={styles.sectionTitle}>Cliente</Text>
            {data.clientName ? (
              <>
                <Text style={styles.entityName}>{data.clientName}</Text>
                {data.contactName && (
                  <Text style={styles.entityDetail}>{data.contactName}</Text>
                )}
              </>
            ) : (
              <Text style={styles.entityPlaceholder}>Contratante</Text>
            )}
          </View>
        </View>

        {/* Items Section */}
        <View style={styles.itemsSection}>
          <Text style={styles.contentTitle}>Itens</Text>
          {data.items && data.items.length > 0 ? (
            <View style={styles.itemsTable}>
              <View style={styles.itemsHeader}>
                <Text style={[styles.itemsHeaderText, styles.itemColDesc]}>Descrição</Text>
                <Text style={[styles.itemsHeaderText, styles.itemColQty]}>Qtd</Text>
                <Text style={[styles.itemsHeaderText, styles.itemColValue]}>Valor Unit.</Text>
                <Text style={[styles.itemsHeaderText, styles.itemColTotal]}>Total</Text>
              </View>
              {data.items.map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  <Text style={[styles.itemText, styles.itemColDesc]}>{item.description}</Text>
                  <Text style={[styles.itemText, styles.itemColQty]}>{item.quantity}</Text>
                  <Text style={[styles.itemText, styles.itemColValue]}>
                    {formatCurrency(item.unitValue)}
                  </Text>
                  <Text style={[styles.itemText, styles.itemColTotal]}>
                    {formatCurrency(item.quantity * item.unitValue)}
                  </Text>
                </View>
              ))}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalValue}>{formatCurrency(calculateTotal())}</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.contentText}>
              Adicione os itens e serviÃ§os da proposta aqui...
            </Text>
          )}
        </View>

        {/* Observations */}
        <View style={styles.contentSection}>
            <Text style={styles.contentTitle}>Observações</Text>
          <Text style={styles.contentText}>
            {data.observations ||
              "Os objetivos na contratação dos intérpretes de Libras - português foram logrados, visando uma estrutura operacional para dar apoio a esse nicho da população, atendendo à legislação ao dispor profissionais proficientes em Libras, para os surdos exercerem seus direitos em um grande evento aberto a todos os públicos, sob a perspectiva da promoção da diversidade."}
          </Text>
        </View>

        {/* Signature Section */}
        <View style={styles.signatureSection}>
          <Text style={styles.signatureDate}>Rio de Janeiro, {formatFullDate()}.</Text>
          <View style={styles.signatureLine}>
            <Text style={styles.signatureName}>
              {data.responsibleName || "Gabriel Sampaio Verissimo"}
            </Text>
            <Text style={styles.signatureCompany}>GS Produções</Text>
          </View>
        </View>
      </Page>

      {/* Page 2 - Client Signature */}
      <Page size="A4" style={styles.page}>
        {/* Watermark */}
        <View style={styles.watermarkPage2}>
          <GsLogo size={220} opacity={0.05} />
        </View>

        {/* Header */}
        <View style={styles.page2Header}>
          <GsLogo size={50} />
        </View>

        {/* Client Signature Area */}
        <View style={styles.clientSignatureArea}>
          <View style={styles.clientSignatureLine}>
            <Text style={styles.clientSignatureLabel}>Contratante</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
