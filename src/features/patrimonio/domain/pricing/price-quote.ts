export type Category = 'Equipamento' | 'Mobiliário' | 'Eletrodoméstico';

export type ItemInput = {
  id: string;
  name: string;
  category: Category;
  replacementCost: number;
  qty: number;
  days: number;
  taxable?: boolean;
};

export type VolumeDiscount = {
  minQty: number;
  discountPct: number;
};

export type ServiceFees = {
  delivery?: number;
  setupPct?: number;
  insurancePct?: number;
};

export type PricingConfig = {
  pctDaily: number;
  pctWeekly: number;
  pctMonthly: number;
  categoryMultiplier: Record<Category, number>;
  volumeDiscounts: VolumeDiscount[];
  serviceFees: ServiceFees;
  taxRate: number;
};

export type LineCalc = {
  id: string;
  name: string;
  qty: number;
  days: number;
  unitDaily: number;
  unitWeekly: number;
  unitMonthly: number;
  decomposed: { months: number; weeks: number; days: number };
  unitSubtotal: number;
  lineSubtotal: number;
  volumeDiscount: number;
  taxableBase: number;
};

export type PriceQuoteResult = {
  lines: LineCalc[];
  itemsSubtotal: number;
  servicesBreakdown: {
    delivery: number;
    setupFee: number;
    insurance: number;
  };
  services: number;
  taxes: number;
  total: number;
  depositSuggested: number;
};

function pickVolumeDiscount(discounts: VolumeDiscount[], qty: number): number {
  if (discounts.length === 0) {
    return 0;
  }

  const sorted = [...discounts].sort((a, b) => b.minQty - a.minQty);
  const match = sorted.find((item) => qty >= item.minQty);
  if (!match) {
    return 0;
  }
  return match.discountPct;
}

export function priceQuote(items: ItemInput[], cfg: PricingConfig): PriceQuoteResult {
  const lines: LineCalc[] = items.map((item) => {
    const multiplier = cfg.categoryMultiplier[item.category] ?? 1;
    const unitDaily = item.replacementCost * cfg.pctDaily * multiplier;
    const unitWeekly = item.replacementCost * cfg.pctWeekly * multiplier;
    const unitMonthly = item.replacementCost * cfg.pctMonthly * multiplier;

    const months = Math.floor(item.days / 30);
    const remainder30 = item.days % 30;
    const weeks = Math.floor(remainder30 / 7);
    const days = remainder30 % 7;

    const unitSubtotal = months * unitMonthly + weeks * unitWeekly + days * unitDaily;
    const lineGross = unitSubtotal * item.qty;

    const volumeDiscountPct = pickVolumeDiscount(cfg.volumeDiscounts, item.qty);
    const volumeDiscount = lineGross * volumeDiscountPct;
    const lineSubtotal = lineGross - volumeDiscount;

    const taxableBase = item.taxable === false ? 0 : lineSubtotal;

    return {
      id: item.id,
      name: item.name,
      qty: item.qty,
      days: item.days,
      unitDaily,
      unitWeekly,
      unitMonthly,
      decomposed: { months, weeks, days },
      unitSubtotal,
      lineSubtotal,
      volumeDiscount,
      taxableBase,
    };
  });

  const itemsSubtotal = lines.reduce((acc, line) => acc + line.lineSubtotal, 0);

  const setupFee = (cfg.serviceFees.setupPct ?? 0) * itemsSubtotal;
  const insurance = (cfg.serviceFees.insurancePct ?? 0) * itemsSubtotal;
  const delivery = cfg.serviceFees.delivery ?? 0;
  const services = setupFee + insurance + delivery;

  const taxableBase = lines.reduce((acc, line) => acc + line.taxableBase, 0) + services;
  const taxes = taxableBase * cfg.taxRate;
  const total = itemsSubtotal + services + taxes;

  return {
    lines,
    itemsSubtotal,
    servicesBreakdown: { delivery, setupFee, insurance },
    services,
    taxes,
    total,
    depositSuggested: itemsSubtotal * 0.2,
  };
}
