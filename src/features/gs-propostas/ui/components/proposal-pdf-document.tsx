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
    paddingHorizontal: 46,
    backgroundColor: "#ffffff",
    color: "#18181b",
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: "#d4d4d8",
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
    paddingTop: 4,
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
    marginTop: 6,
    marginBottom: 10,
    alignItems: "center",
    textAlign: "center",
    gap: 3,
  },
  docTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: "#1f2937",
  },
  docSubtitle: {
    fontSize: 12,
    color: "#4b5563",
    fontWeight: 500,
    marginTop: 2,
  },
  companyLine: {
    fontSize: 10,
    color: "#4b5563",
  },
  // Metadata section
  metadataBlock: {
    borderBottomWidth: 1,
    borderColor: "#d4d4d8",
    paddingVertical: 8,
    marginBottom: 8,
    gap: 2,
  },
  metadataLine: {
    fontSize: 10.5,
    color: "#111827",
  },
  metadataLabelInline: {
    fontWeight: 700,
  },
  serviceBlock: {
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderColor: "#d4d4d8",
  },
  serviceTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 4,
  },
  // Entities section
  entitiesRow: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#d4d4d8",
  },
  entityCol: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: "#18181b",
    marginBottom: 6,
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
    marginTop: 36,
    paddingTop: 12,
  },
  signatureDate: {
    fontSize: 10,
    color: "#52525b",
    marginBottom: 20,
  },
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    gap: 32,
  },
  signatureBox: {
    alignItems: "center",
    flex: 1,
  },
  signatureLine: {
    width: "78%",
    maxWidth: 240,
    alignSelf: "center",
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

  // Items table
  itemsSection: {
    marginBottom: 18,
    gap: 6,
  },

  itemsTable: {
    width: "100%",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#d4d4d8",
    borderRadius: 3,
  },
  itemsHeader: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderColor: "#d4d4d8",
    borderLeftWidth: 1,
    borderLeftColor: "#d4d4d8",
    borderRightWidth: 1,
    borderRightColor: "#d4d4d8",
  },
  itemsHeaderText: {
    fontSize: 9.5,
    fontWeight: 700,
    color: "#111827",
  },
  itemRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderColor: "#d4d4d8",
    borderLeftWidth: 1,
    borderLeftColor: "#d4d4d8",
    borderRightWidth: 1,
    borderRightColor: "#d4d4d8",
  },
  itemColName: { 
    width: "30%", 
    borderRightWidth: 1, 
    borderRightColor: "#d4d4d8",
    paddingRight: 4,
  },
  itemColDesc: { 
    width: "35%", 
    borderRightWidth: 1, 
    borderRightColor: "#d4d4d8",
    paddingRight: 4,
    paddingLeft: 4,
  },
  itemColQty: { 
    width: "10%", 
    textAlign: "center", 
    borderRightWidth: 1, 
    borderRightColor: "#d4d4d8", 
  },
  itemColValue: { 
    width: "12.5%", 
    textAlign: "right", 
    borderRightWidth: 1, 
    borderRightColor: "#d4d4d8",
    paddingRight: 4, 
  },
  itemColTotal: { 
    width: "12.5%", 
    textAlign: "right",
    paddingRight: 4,
  },
  itemText: {
    fontSize: 9.5,
    color: "#111827",
  },
  // Footer/Total
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: "#f9fafb",
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: "#18181b",
    marginRight: 8,
  },
  totalValue: {
    fontSize: 11,
    fontWeight: 700,
    color: "#18181b",
  },
  itemNoteTitle: {
    fontSize: 10,
    fontWeight: 700,
    marginTop: 6,
    marginBottom: 2,
  },
  itemNoteText: {
    fontSize: 9.5,
    color: "#52525b",
    lineHeight: 1.5,
  },
});

export interface ProposalItem {
  id: string;
  description: string;
  quantity: number;
  unitValue: number;
  itemObservation?: string;
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
  companyNeighborhood?: string;
  companyCity?: string;
  companyState?: string;
  companyZip?: string;
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

  const formatCompanyLocation = () => {
    const placeParts = [data.companyNeighborhood, data.companyCity].filter(Boolean);
    const place = placeParts.join(", ");
    const ufZip = [data.companyState, data.companyZip].filter(Boolean).join(" - ");

    if (place && ufZip) return `${place} - ${ufZip}`;
    return place || ufZip;
  };

  const companyLocationLine = formatCompanyLocation();
  const companyEmailLine = data.companyEmail ? `E-mail: ${data.companyEmail}` : '';
  const companyPhoneLine = data.companyPhone ? `Telefone: ${data.companyPhone}` : '';

  const serviceSummary =
    data.observations && data.observations.trim().length > 0
      ? data.observations
      : data.items && data.items[0]
        ? `Prestação de serviço: ${data.items[0].description}`
        : "Contratação de intérprete(s) de Libras conforme condições descritas abaixo.";

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
              {data.companyName ?? "GS PRODUÇÕES E ACESSIBILIDADE"}
            </Text>
            {data.companyCnpj && (
              <Text style={styles.companyLine}>CNPJ: {data.companyCnpj}</Text>
            )}
            {data.companyAddress && (
              <Text style={styles.companyLine}>{data.companyAddress}</Text>
            )}
            {companyLocationLine ? (
              <Text style={styles.companyLine}>{companyLocationLine}</Text>
            ) : null}
            {companyEmailLine ? (
              <Text style={styles.companyLine}>{companyEmailLine}</Text>
            ) : null}
            {companyPhoneLine ? (
              <Text style={styles.companyLine}>{companyPhoneLine}</Text>
            ) : null}
          </View>
        </View>
        <View style={styles.headerRight}>
          <GsLogo size={42} />
        </View>
      </View>

      {/* Document Title (separate from header) */}
      <View style={styles.docTitleBlock}>
        <Text style={styles.docTitle}>Proposta Comercial</Text>
        {data.clientName && (
          <Text style={styles.docSubtitle}>{data.clientName}</Text>
        )}
      </View>

        {/* Metadata */}
        <View style={styles.metadataBlock}>
          <Text style={styles.metadataLine}>
            <Text style={styles.metadataLabelInline}>Código: </Text>{data.code || "------"}
          </Text>
          <Text style={styles.metadataLine}>
            <Text style={styles.metadataLabelInline}>Status da Proposta: </Text>{data.status || "Aberto"}
          </Text>
          <Text style={styles.metadataLine}>
            <Text style={styles.metadataLabelInline}>Data da Proposta: </Text>{formatDate(data.date || new Date())}
          </Text>
          <Text style={styles.metadataLine}>
            <Text style={styles.metadataLabelInline}>Validade: </Text>{formatDate(data.validity)}
          </Text>
        </View>

        {/* Service summary */}
        <View style={styles.serviceBlock}>
          <Text style={styles.serviceTitle}>Prestação de Serviço</Text>
          <Text style={styles.contentText}>{serviceSummary}</Text>
        </View>

        {/* Entities */}
        <View style={styles.entitiesRow}>
          <View style={styles.entityCol}>
            <Text style={styles.sectionTitle}>Empresa</Text>
            <Text style={styles.entityName}>
              {data.companyName ?? "GS PRODUÇÕES E ACESSIBILIDADE"}
            </Text>
            {data.companyCnpj && (
              <Text style={styles.entityDetail}>{data.companyCnpj}</Text>
            )}
            {data.companyAddress && (
              <Text style={styles.entityDetail}>{data.companyAddress}</Text>
            )}
            {companyLocationLine ? (
              <Text style={styles.entityDetail}>{companyLocationLine}</Text>
            ) : null}
            {companyEmailLine ? (
              <Text style={styles.entityDetail}>{companyEmailLine}</Text>
            ) : null}
            {companyPhoneLine ? (
              <Text style={styles.entityDetail}>{companyPhoneLine}</Text>
            ) : null}
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
            <>


              <View style={styles.itemsTable}>
                <View style={styles.itemsHeader}>
                  <Text style={[styles.itemsHeaderText, styles.itemColName]}>Item</Text>
                  <Text style={[styles.itemsHeaderText, styles.itemColDesc]}>Descrição</Text>
                  <Text style={[styles.itemsHeaderText, styles.itemColQty]}>Prazo/Qtd.</Text>
                  <Text style={[styles.itemsHeaderText, styles.itemColValue]}>Valor Un.</Text>
                  <Text style={[styles.itemsHeaderText, styles.itemColTotal]}>Total</Text>
                </View>
                {data.items.map((item, index) => (
                  <View key={item.id} style={styles.itemRow}>
                    <Text style={[styles.itemText, styles.itemColName]}>{item.description}</Text>
                    <Text style={[styles.itemText, styles.itemColDesc]}>{item.itemObservation || ""}</Text>
                    <Text style={[styles.itemText, styles.itemColQty]}>
                      {item.quantity?.toFixed(2) ?? "0,00"}
                    </Text>
                    <Text style={[styles.itemText, styles.itemColValue]}>
                      {formatCurrency(item.unitValue)}
                    </Text>
                    <Text style={[styles.itemText, styles.itemColTotal]}>
                      {formatCurrency(item.quantity * item.unitValue)}
                    </Text>
                  </View>
                ))}
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Valor Total:</Text>
                  <Text style={styles.totalValue}>{formatCurrency(calculateTotal())}</Text>
                </View>
              </View>
              {data.observations && (
                <View>
                  <Text style={styles.itemNoteTitle}>Observação</Text>
                  <Text style={styles.itemNoteText}>{data.observations}</Text>
                </View>
              )}
            </>
          ) : (
            <Text style={styles.contentText}>
              Adicione os itens e serviÃ§os da proposta aqui...
            </Text>
          )}
        </View>



        {/* Signature Section */}
        <View style={styles.signatureSection} wrap={false}>
          <Text style={styles.signatureDate}>
            Rio de Janeiro, {formatFullDate()}.
          </Text>

          <View style={styles.signatureRow}>
            {/* GS Signature */}
            <View style={styles.signatureBox}>
              <View style={styles.signatureLine}>
                <Text style={styles.signatureName}>
                  {data.responsibleName || "Gabriel Sampaio Verissimo"}
                </Text>
                <Text style={styles.signatureCompany}>GS Produções</Text>
              </View>
            </View>

            {/* Client Signature */}
            <View style={styles.signatureBox}>
              <View style={styles.signatureLine}>
                <Text style={styles.signatureName}>
                  {data.clientName || "Contratante"}
                </Text>
                <Text style={styles.signatureCompany}>Contratante</Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
