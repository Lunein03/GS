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
  Image,
} from "@react-pdf/renderer";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  formatCNPJ,
  formatCPF,
  formatPhone,
  formatCEP,
  removeNonNumeric,
  toTitleCase,
} from "@/shared/lib/validators";

const COLORS = {
  bg: "#ffffff",
  textPrimary: "#0f172a",
  textSecondary: "#475569",
  border: "#cbd5e1",
  bgSubtle: "#f8fafc",
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 11,
    paddingTop: 32,
    paddingBottom: 60,
    paddingHorizontal: 46,
    backgroundColor: COLORS.bg,
    color: COLORS.textPrimary,
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
    borderColor: COLORS.border,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
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
    minWidth: 60,
    alignItems: "flex-end",
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
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
    color: COLORS.textPrimary,
  },
  docSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: 500,
    marginTop: 2,
  },
  companyLine: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  // Metadata section
  metadataBlock: {
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 8,
    marginBottom: 8,
    gap: 2,
  },
  metadataLine: {
    fontSize: 10.5,
    color: COLORS.textPrimary,
  },
  metadataLabelInline: {
    fontWeight: 700,
  },
  observationsBlock: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  observationsText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    lineHeight: 1.6,
    textAlign: "justify",
  },
  // Entities section
  entitiesRow: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  entityCol: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  entityName: {
    fontSize: 11,
    fontWeight: 700,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  entityDetail: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  entityPlaceholder: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  // Content section
  contentSection: {
    flex: 1,
    marginBottom: 20,
  },
  contentTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  contentText: {
    fontSize: 10,
    color: COLORS.textSecondary,
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
    color: COLORS.textSecondary,
    marginBottom: 90,
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
    borderColor: COLORS.border,
    paddingTop: 10,
  },
  signatureName: {
    fontSize: 9,
    fontWeight: 700,
    color: COLORS.textPrimary,
    textAlign: "center",
    textTransform: "uppercase",
  },
  signatureCompany: {
    fontSize: 9,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: "center",
  },
  // Watermark
  watermark: {
    position: "absolute",
    top: 291,
    left: 168,
    width: 260,
    height: 260,
    opacity: 0.05,
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
    borderColor: COLORS.border,
    borderRadius: 3,
  },
  itemsHeader: {
    flexDirection: "row",
    backgroundColor: COLORS.bgSubtle,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  itemsHeaderText: {
    fontSize: 9.5,
    fontWeight: 700,
    color: COLORS.textPrimary,
  },
  itemRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  itemColName: { 
    width: "28%",
    borderRightWidth: 1, 
    borderRightColor: COLORS.border,
    paddingRight: 4,
  },
  itemColDesc: { 
    width: "30%",
    borderRightWidth: 1, 
    borderRightColor: COLORS.border,
    paddingRight: 4,
    paddingLeft: 4,
  },
  itemColQty: { 
    width: "9%",
    textAlign: "center", 
    borderRightWidth: 1, 
    borderRightColor: COLORS.border, 
  },
  itemColUnit: { 
    width: "8%",
    textAlign: "center", 
    borderRightWidth: 1, 
    borderRightColor: COLORS.border, 
  },
  itemColValue: { 
    width: "12.5%", 
    textAlign: "right", 
    borderRightWidth: 1, 
    borderRightColor: COLORS.border,
    paddingRight: 4, 
  },
  itemColTotal: { 
    width: "12.5%", 
    textAlign: "right",
    paddingRight: 4,
  },
  itemText: {
    fontSize: 9.5,
    color: COLORS.textPrimary,
  },
  // Footer/Total
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: COLORS.bgSubtle,
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: COLORS.textPrimary,
    marginRight: 8,
  },
  totalValue: {
    fontSize: 11,
    fontWeight: 700,
    color: COLORS.textPrimary,
  },
});

export interface ProposalItem {
  id: string;
  description: string;
  quantity: number;
  unitValue: number;
  unit?: string;
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
  logoUrl?: string;
  logoPosition?: 'left' | 'right';
}

const UNIT_LABELS: Record<string, string> = {
  hora: 'h',
  dia: 'd',
  unidade: 'un',
  evento: 'ev',
};

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

  const formatDocumentDisplay = (doc?: string) => {
    if (!doc) return '';
    const digits = removeNonNumeric(doc);
    if (digits.length === 11) return formatCPF(digits);
    if (digits.length === 14) return formatCNPJ(digits);
    return doc;
  };

  const formatPhoneDisplay = (phone?: string) => {
    if (!phone) return '';
    const digits = removeNonNumeric(phone);
    if (digits.length >= 10) return formatPhone(digits);
    return phone;
  };

  const formatCepDisplay = (cep?: string) => {
    if (!cep) return '';
    const digits = removeNonNumeric(cep);
    if (digits.length === 8) return formatCEP(digits);
    return cep;
  };

  const formatCompanyLocation = () => {
    const neighborhood = data.companyNeighborhood ? toTitleCase(data.companyNeighborhood) : '';
    const city = data.companyCity ? toTitleCase(data.companyCity) : '';
    const placeParts = [neighborhood, city].filter(Boolean);
    const place = placeParts.join(", ");
    const cepFormatted = formatCepDisplay(data.companyZip);
    const ufZip = [data.companyState?.toUpperCase(), cepFormatted].filter(Boolean).join(" - ");

    if (place && ufZip) return `${place} - ${ufZip}`;
    return place || ufZip;
  };

  const companyLocationLine = formatCompanyLocation();
  const companyEmailLine = data.companyEmail ? `E-mail: ${data.companyEmail}` : '';
  const companyPhoneLine = data.companyPhone ? `Telefone: ${formatPhoneDisplay(data.companyPhone)}` : '';

  const observationsText =
    data.observations && data.observations.trim().length > 0
      ? data.observations.trim()
      : "Sem observações adicionais.";

  return (
    <Document>
      {/* Page 1 - Main Content */}
      <Page size="A4" style={styles.page}>
        {/* Watermark */}
        <View style={styles.watermark}>
          <GsLogo size={240} opacity={0.05} />
        </View>

      {/* Header */}
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {/* Left Side */}
          <View style={[styles.headerLeft, { alignItems: 'flex-start' }]}>
            {data.logoUrl && data.logoPosition === 'left' ? (
              <Image 
                src={data.logoUrl} 
                style={{ height: 70, width: 180, objectFit: 'contain', objectPosition: 'left' }} 
              />
            ) : null}
          </View>

          {/* Right Side */}
          <View style={styles.headerRight}>
            {data.logoUrl && data.logoPosition === 'right' ? (
              <Image 
                src={data.logoUrl} 
                style={{ height: 70, width: 180, objectFit: 'contain', objectPosition: 'right' }} 
              />
            ) : (
              !data.logoUrl && <GsLogo size={42} /> 
            )}
          </View>
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

        {/* Entities */}
        <View style={styles.entitiesRow}>
          <View style={styles.entityCol}>
            <Text style={styles.sectionTitle}>Empresa</Text>
            <Text style={styles.entityName}>
              {data.companyName || "Nome da Empresa"}
            </Text>
            {data.companyCnpj && (
              <Text style={styles.entityDetail}>{formatDocumentDisplay(data.companyCnpj)}</Text>
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
            <Text style={styles.entityName}>
              {data.clientName || "Nome do Cliente"}
            </Text>
            <Text style={styles.entityDetail}>
              {data.contactName || "Nome do Responsável"}
            </Text>
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
                  <Text style={[styles.itemsHeaderText, styles.itemColQty]}>Qtd.</Text>
                  <Text style={[styles.itemsHeaderText, styles.itemColUnit]}>Unid.</Text>
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
                    <Text style={[styles.itemText, styles.itemColUnit]}>
                      {UNIT_LABELS[item.unit || 'hora'] || item.unit || 'h'}
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
            </>
          ) : (
            <Text style={styles.contentText}>
              Adicione os itens e serviços da proposta aqui...
            </Text>
          )}
        </View>

        {/* Observações */}
        <View style={styles.observationsBlock}>
          <Text style={styles.sectionTitle}>Observações</Text>
          <Text style={styles.observationsText}>{observationsText}</Text>
        </View>



        {/* Signature Section */}
        <View style={styles.signatureSection} wrap={false}>
          <Text style={styles.signatureDate}>
            {data.companyCity ? toTitleCase(data.companyCity) : "Cidade"}, {formatFullDate()}.
          </Text>

          <View style={styles.signatureRow}>
            {/* GS Signature */}
            <View style={styles.signatureBox}>
              <View style={styles.signatureLine}>
                <Text style={styles.signatureName}>
                  {data.companyName || "Empresa"}
                </Text>
                <Text style={styles.signatureCompany}>
                  {data.responsibleName ? toTitleCase(data.responsibleName) : "Responsável"}
                </Text>
              </View>
            </View>

            {/* Client Signature */}
            <View style={styles.signatureBox}>
              <View style={styles.signatureLine}>
                <Text style={styles.signatureName}>
                  {data.clientName || "Nome do Cliente"}
                </Text>
                <Text style={styles.signatureCompany}>
                  {data.contactName ? toTitleCase(data.contactName) : "Nome do Responsável"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
