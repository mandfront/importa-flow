"use client";

import { useState, useEffect, type FocusEvent } from "react";
import { Header } from "@/components/header";
import { FormField } from "@/components/form-field";

import calculatorMessages from "@/locales/pt-BR/calculator.json";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { X } from "lucide-react";

type Messages = typeof calculatorMessages;

function t<K extends keyof Messages>(key: K): Messages[K] {
  return calculatorMessages[key];
}

type RateioMode = "by_value" | "by_weight" | "by_quantity";
type TaxBaseMode = "declared_only" | "declared_plus_freight";

type PackageItem = {
  id: string;
  description: string;
  storeName: string;
  unitPriceCNY: number;
  quantity: number;
  weightGrams?: number;
};

type PackageCosts = {
  internationalShippingCNY: number;
  domesticShippingCNY?: number;
  serviceFeeCNY?: number;
  insuranceCNY?: number;
  otherCostsCNY?: number;
};

type TaxConfig = {
  importTaxRate: number;
  icmsRate: number;
  taxBaseMode: TaxBaseMode;
};

type FxConfig = {
  cnyToBrlRate: number;
  usdToBrlRateForTaxes?: number;
};

type PackageSimulationInput = {
  packageName?: string;
  shippingLine?: string;
  fx: FxConfig;
  items: PackageItem[];
  costs: PackageCosts;
  declarationTotalUSD: number;
  taxConfig: TaxConfig;
  rateioMode: RateioMode;
  mainMarginPercent: number;
};

type ItemResult = {
  item: PackageItem;
  totalCostBRL: number;
  unitCostBRL: number;
  suggestedPriceBRL: number;
  profitPerUnitBRL: number;
  totalProfitBRL: number;
};

type PackageSimulationResult = {
  totalProductCostBRL: number;
  totalServicesCostBRL: number;
  totalTaxesBRL: number;
  totalCostBRL: number;
  totalWeightGrams: number;
  costPerKgBRL: number | null;
  totalItemsCount: number;
  itemResults: ItemResult[];
  importTaxBRL: number;
  icmsBRL: number;
};

const handleNumberFocus = (event: FocusEvent<HTMLInputElement>) => {
  event.target.select();
};

function calculatePackageSimulation(
  input: PackageSimulationInput
): PackageSimulationResult {
  const {
    items,
    costs,
    fx,
    declarationTotalUSD,
    taxConfig,
    rateioMode,
    mainMarginPercent,
  } = input;
  const { cnyToBrlRate, usdToBrlRateForTaxes } = fx;

  const {
    internationalShippingCNY,
    domesticShippingCNY = 0,
    serviceFeeCNY = 0,
    insuranceCNY = 0,
    otherCostsCNY = 0,
  } = costs;

  const totalProductCNY = items.reduce(
    (sum, item) => sum + item.unitPriceCNY * item.quantity,
    0
  );
  const totalWeightGrams = items.reduce(
    (sum, item) => sum + (item.weightGrams ?? 0),
    0
  );
  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const productCostBRL = totalProductCNY * cnyToBrlRate;
  const internationalShippingBRL = internationalShippingCNY * cnyToBrlRate;
  const domesticShippingBRL = domesticShippingCNY * cnyToBrlRate;
  const serviceFeeBRL = serviceFeeCNY * cnyToBrlRate;
  const insuranceBRL = insuranceCNY * cnyToBrlRate;
  const otherCostsBRL = otherCostsCNY * cnyToBrlRate;

  const totalServicesCostBRL =
    internationalShippingBRL +
    domesticShippingBRL +
    serviceFeeBRL +
    insuranceBRL +
    otherCostsBRL;

  const totalProductCostBRL = productCostBRL;

  const usdRate = usdToBrlRateForTaxes ?? cnyToBrlRate;
  const declaredBRL = declarationTotalUSD * usdRate;

  let taxBaseBRL = declaredBRL;
  if (taxConfig.taxBaseMode === "declared_plus_freight") {
    taxBaseBRL += internationalShippingBRL;
  }

  const importTaxBRL = (taxBaseBRL * taxConfig.importTaxRate) / 100;
  const icmsBRL = (taxBaseBRL * taxConfig.icmsRate) / 100;
  const totalTaxesBRL = importTaxBRL + icmsBRL;

  const totalCostBRL =
    totalProductCostBRL + totalServicesCostBRL + totalTaxesBRL;
  const costPerKgBRL =
    totalWeightGrams > 0 ? (totalCostBRL / totalWeightGrams) * 1000 : null;

  let denominator = 0;
  if (rateioMode === "by_value") {
    denominator = totalProductCNY;
  } else if (rateioMode === "by_weight") {
    denominator = totalWeightGrams || 0;
  } else if (rateioMode === "by_quantity") {
    denominator = totalItemsCount;
  }

  const packageVariableCostBRL =
    totalProductCostBRL + totalServicesCostBRL + totalTaxesBRL;

  const itemResults: ItemResult[] = items.map((item) => {
    let weight = 0;
    if (rateioMode === "by_value") {
      weight = item.unitPriceCNY * item.quantity;
    } else if (rateioMode === "by_weight") {
      weight = item.weightGrams ?? 0;
    } else if (rateioMode === "by_quantity") {
      weight = item.quantity;
    }

    const shareRatio = denominator > 0 && weight > 0 ? weight / denominator : 0;
    const itemTotalCostBRL = packageVariableCostBRL * shareRatio;
    const unitCostBRL =
      item.quantity > 0 ? itemTotalCostBRL / item.quantity : 0;
    const suggestedPriceBRL = unitCostBRL * (1 + mainMarginPercent / 100);
    const profitPerUnitBRL = suggestedPriceBRL - unitCostBRL;
    const totalProfitBRL = profitPerUnitBRL * item.quantity;

    return {
      item,
      totalCostBRL: itemTotalCostBRL,
      unitCostBRL,
      suggestedPriceBRL,
      profitPerUnitBRL,
      totalProfitBRL,
    };
  });

  return {
    totalProductCostBRL,
    totalServicesCostBRL,
    totalTaxesBRL,
    totalCostBRL,
    totalWeightGrams,
    costPerKgBRL,
    totalItemsCount,
    itemResults,
    importTaxBRL,
    icmsBRL,
  };
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function parseCssbuySummary(raw: string): {
  items: PackageItem[];
  inferredCosts: Partial<PackageCosts>;
  errors?: string[];
} {
  const items: PackageItem[] = [];
  const inferredCosts: Partial<PackageCosts> = {};
  const errors: string[] = [];

  if (!raw || raw.trim().length === 0) {
    return { items, inferredCosts, errors: [t("parseErrorEmptyText")] };
  }

  const allLines = raw.split(/\r?\n/).map((l) => l.trim());

  const parseMoneyFromLine = (line?: string): number | undefined => {
    if (!line) return undefined;
    const m = line.match(/[¥￥]\s*([\d.,]+)/);
    if (!m) return undefined;
    const normalized = m[1].replace(",", ".");
    const v = Number.parseFloat(normalized);
    return Number.isNaN(v) ? undefined : v;
  };

  for (let i = 0; i < allLines.length; i++) {
    const line = allLines[i];
    const lower = line.toLowerCase();
    const next = allLines[i + 1] ?? "";

    const fromThis = parseMoneyFromLine(line);
    const fromNext = parseMoneyFromLine(next);
    const value = fromThis ?? fromNext;

    if (lower.includes("frete") || lower.includes("shipping")) {
      if (value !== undefined) {
        inferredCosts.internationalShippingCNY = value;
      }
    }

    if (
      lower.includes("servidor") ||
      lower.includes("service fee") ||
      (lower.includes("service") && !lower.includes("insurance"))
    ) {
      if (value !== undefined) {
        inferredCosts.serviceFeeCNY = value;
      }
    }

    if (lower.includes("seguro") || lower.includes("insurance")) {
      if (value !== undefined) {
        inferredCosts.insuranceCNY = value;
      }
    }
  }

  const compactLines = allLines.filter((l) => l.length > 0);

  const idIndices: number[] = [];
  for (let i = 0; i < compactLines.length; i++) {
    if (/id do pedido/i.test(compactLines[i])) {
      idIndices.push(i);
    }
  }

  const blocks: string[][] = [];

  if (idIndices.length > 0) {
    for (let idx = 0; idx < idIndices.length; idx++) {
      const start = idIndices[idx];
      const end =
        idx + 1 < idIndices.length ? idIndices[idx + 1] : compactLines.length;
      blocks.push(compactLines.slice(start, end));
    }
  } else {
    const fallbackBlocks = raw.split(/\n\s*\n+/).map((b) =>
      b
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0)
    );
    blocks.push(...fallbackBlocks);
  }

  blocks.forEach((block, blockIndex) => {
    const joined = block.join("\n");
    if (!/[¥￥]/.test(joined)) {
      return;
    }

    let storeName = "";
    let weightGrams: number | undefined;
    let priceCNY: number | undefined;
    let quantity = 1;
    let description = "";

    for (let i = 0; i < block.length; i++) {
      if (/nome da loja/i.test(block[i])) {
        const next = block[i + 1]?.trim();
        if (next) {
          storeName = next;
        }
      }
    }

    for (let i = 0; i < block.length; i++) {
      if (/peso/i.test(block[i])) {
        const combo = `${block[i]} ${block[i + 1] ?? ""}`;
        const m = combo.match(/(\d+(?:\.\d+)?)(?:\s*)g/i);
        if (m) {
          const v = Number.parseFloat(m[1].replace(",", "."));
          if (!Number.isNaN(v)) {
            weightGrams = v;
            break;
          }
        }
      }
    }

    let priceLineIndex = -1;
    for (let i = 0; i < block.length; i++) {
      if (/[¥￥]/.test(block[i])) {
        const v = parseMoneyFromLine(block[i]);
        if (v !== undefined) {
          priceCNY = v;
          priceLineIndex = i;
          break;
        }
      }
    }

    if (priceLineIndex === -1 || priceCNY === undefined) {
      return;
    }

    for (let i = priceLineIndex; i < block.length; i++) {
      const m = block[i].match(/x\s*(\d+)/i);
      if (m) {
        const q = Number.parseInt(m[1], 10);
        if (!Number.isNaN(q) && q > 0) {
          quantity = q;
          break;
        }
      }
    }

    for (let i = priceLineIndex - 1; i >= 0; i--) {
      const line = block[i].trim();
      if (!line) continue;
      if (/id do pedido/i.test(line)) continue;
      if (/nome da loja/i.test(line)) continue;
      if (/peso/i.test(line)) continue;
      if (/[¥￥]/.test(line)) continue;
      if (/([xX×]\s*\d+|\d+\s*[xX×])/.test(line)) continue;
      if (line.length < 3) continue;
      description = line;
      break;
    }

    if (!description) {
      description = `Item ${blockIndex + 1}`;
    }

    items.push({
      id: `parsed-${Date.now()}-${blockIndex}`,
      description,
      storeName,
      unitPriceCNY: priceCNY,
      quantity,
      weightGrams,
    });
  });

  if (items.length === 0 && Object.keys(inferredCosts).length === 0) {
    errors.push(t("parseErrorNoItemsOrCosts"));
  } else if (items.length === 0) {
    errors.push(t("parseErrorNoItemsWithPrice"));
  }

  return { items, inferredCosts, errors: errors.length ? errors : undefined };
}

type ParsedPreview = {
  items: PackageItem[];
  inferredCosts: Partial<PackageCosts>;
};

export default function CalculatorPage() {
  const [mounted, setMounted] = useState(false);
  const [rawSummary, setRawSummary] = useState("");

  const [parsedPreview, setParsedPreview] = useState<ParsedPreview | null>(
    null
  );
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [packageName, setPackageName] = useState("");
  const [shippingLine, setShippingLine] = useState("");
  const [cnyToBrlRate, setCnyToBrlRate] = useState(0.8542);
  const [usdToBrlRate, setUsdToBrlRate] = useState(5.0);

  const [items, setItems] = useState<PackageItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [internationalShippingCNY, setInternationalShippingCNY] = useState(0);
  const [domesticShippingCNY, setDomesticShippingCNY] = useState(0);
  const [serviceFeeCNY, setServiceFeeCNY] = useState(0);
  const [insuranceCNY, setInsuranceCNY] = useState(0);
  const [otherCostsCNY, setOtherCostsCNY] = useState(0);

  const [declarationTotalUSD, setDeclarationTotalUSD] = useState(0);
  const [importTaxRate, setImportTaxRate] = useState(60);
  const [icmsRate, setIcmsRate] = useState(18);
  const [taxBaseMode, setTaxBaseMode] = useState<TaxBaseMode>("declared_only");

  const [rateioMode, setRateioMode] = useState<RateioMode>("by_value");
  const [mainMarginPercent, setMainMarginPercent] = useState(50);

  const [result, setResult] = useState<PackageSimulationResult | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const addItem = () => {
    const newItem: PackageItem = {
      id: Date.now().toString(),
      description: "",
      storeName: "",
      unitPriceCNY: 0,
      quantity: 1,
      weightGrams: 0,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof PackageItem, value: any) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (cnyToBrlRate <= 0) newErrors.cnyToBrlRate = t("formRequiredError");
    if (items.length === 0) newErrors.items = t("formRequiredError");
    if (items.some((item) => item.unitPriceCNY <= 0 || item.quantity <= 0)) {
      newErrors.items = t("formRequiredError");
    }
    if (internationalShippingCNY < 0)
      newErrors.internationalShippingCNY = t("formRequiredError");
    if (declarationTotalUSD <= 0)
      newErrors.declarationTotalUSD = t("formRequiredError");
    if (importTaxRate < 0) newErrors.importTaxRate = t("formRequiredError");
    if (icmsRate < 0) newErrors.icmsRate = t("formRequiredError");
    if (mainMarginPercent < 0)
      newErrors.mainMarginPercent = t("formRequiredError");

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCalculate = () => {
    if (!validateForm()) return;

    const input: PackageSimulationInput = {
      packageName: packageName || undefined,
      shippingLine: shippingLine || undefined,
      fx: {
        cnyToBrlRate,
        usdToBrlRateForTaxes: usdToBrlRate || undefined,
      },
      items,
      costs: {
        internationalShippingCNY,
        domesticShippingCNY: domesticShippingCNY || undefined,
        serviceFeeCNY: serviceFeeCNY || undefined,
        insuranceCNY: insuranceCNY || undefined,
        otherCostsCNY: otherCostsCNY || undefined,
      },
      declarationTotalUSD,
      taxConfig: {
        importTaxRate,
        icmsRate,
        taxBaseMode,
      },
      rateioMode,
      mainMarginPercent,
    };

    const calculationResult = calculatePackageSimulation(input);
    setResult(calculationResult);
  };

  const handleReset = () => {
    setPackageName("");
    setShippingLine("");
    setCnyToBrlRate(0.8542);
    setUsdToBrlRate(5.0);
    setItems([]);
    setInternationalShippingCNY(0);
    setDomesticShippingCNY(0);
    setServiceFeeCNY(0);
    setInsuranceCNY(0);
    setOtherCostsCNY(0);
    setDeclarationTotalUSD(0);
    setImportTaxRate(60);
    setIcmsRate(18);
    setTaxBaseMode("declared_only");
    setRateioMode("by_value");
    setMainMarginPercent(50);
    setResult(null);
    setErrors({});
    setRawSummary("");
    setSummaryError(null);
  };

  const handlePasteCssbuySummary = () => {
    setSummaryError(null);

    if (!rawSummary.trim()) {
      setSummaryError(t("pasteSummaryValidationError"));
      return;
    }

    const { items: parsedItems, inferredCosts } =
      parseCssbuySummary(rawSummary);

    const hasItems = parsedItems.length > 0;
    const hasUsefulCosts =
      (inferredCosts.internationalShippingCNY ?? 0) > 0 ||
      (inferredCosts.serviceFeeCNY ?? 0) > 0 ||
      (inferredCosts.insuranceCNY ?? 0) > 0 ||
      (inferredCosts.otherCostsCNY ?? 0) > 0;

    if (!hasItems && !hasUsefulCosts) {
      setSummaryError(t("parseErrorNoItemsOrCosts"));
      return;
    }

    setParsedPreview({ items: parsedItems, inferredCosts });
    setIsPreviewOpen(true);
  };

  const handleConfirmPreview = (
    previewItems: PackageItem[],
    previewCosts: Partial<PackageCosts>
  ) => {
    setItems(previewItems);

    setInternationalShippingCNY(
      (prev) => prev || previewCosts.internationalShippingCNY || 0
    );
    setServiceFeeCNY((prev) => prev || previewCosts.serviceFeeCNY || 0);
    setInsuranceCNY((prev) => prev || previewCosts.insuranceCNY || 0);
    setOtherCostsCNY((prev) => prev || previewCosts.otherCostsCNY || 0);

    setIsPreviewOpen(false);
    setRawSummary("");
    setSummaryError(null);
  };

  if (!mounted) return null;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 space-y-2">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              {t("appName")}
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              {t("tagline")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <section className="rounded-xl border border-border bg-card p-6 space-y-4">
                <h2 className="text-lg font-semibold">
                  {t("sectionPackageInfo")}
                </h2>

                <FormField label={t("packageNameLabel")} htmlFor="packageName">
                  <Input
                    id="packageName"
                    type="text"
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                  />
                </FormField>

                <FormField
                  label={t("shippingLineLabel")}
                  htmlFor="shippingLine"
                >
                  <Input
                    id="shippingLine"
                    type="text"
                    placeholder={t("shippingLinePlaceholder")}
                    value={shippingLine}
                    onChange={(e) => setShippingLine(e.target.value)}
                  />
                </FormField>

                <FormField
                  label={t("cnyToBrlRateLabel")}
                  htmlFor="cnyToBrlRate"
                  error={errors.cnyToBrlRate}
                >
                  <Input
                    id="cnyToBrlRate"
                    type="number"
                    step="0.0001"
                    placeholder={t("cnyToBrlRatePlaceholder")}
                    value={cnyToBrlRate}
                    onChange={(e) =>
                      setCnyToBrlRate(Number.parseFloat(e.target.value) || 0)
                    }
                    onFocus={handleNumberFocus}
                  />
                </FormField>

                <FormField
                  label={t("usdToBrlRateLabel")}
                  htmlFor="usdToBrlRate"
                >
                  <Input
                    id="usdToBrlRate"
                    type="number"
                    step="0.01"
                    value={usdToBrlRate}
                    onChange={(e) =>
                      setUsdToBrlRate(Number.parseFloat(e.target.value) || 0)
                    }
                    onFocus={handleNumberFocus}
                  />
                </FormField>
              </section>

              <section className="rounded-xl border border-border bg-card p-6 space-y-4">
                <h2 className="text-lg font-semibold">
                  {t("sectionPasteSummary")}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t("pasteSummaryHelp")}
                </p>

                <textarea
                  value={rawSummary}
                  onChange={(e) => {
                    setRawSummary(e.target.value);
                    if (summaryError) setSummaryError(null);
                  }}
                  placeholder={t("pasteSummaryTextareaPlaceholder")}
                  className={`w-full rounded-md border bg-background p-3 text-sm h-32 font-mono ${
                    summaryError ? "border-destructive" : "border-border"
                  }`}
                />
                {summaryError && (
                  <p className="text-xs text-destructive mt-1">
                    {summaryError}
                  </p>
                )}

                <Button
                  onClick={handlePasteCssbuySummary}
                  disabled={!rawSummary.trim()}
                  className="w-full"
                >
                  {t("pasteSummaryButton")}
                </Button>

                <p className="text-xs text-muted-foreground">
                  {t("pasteSummaryNote")}
                </p>
              </section>

              <section className="rounded-xl border border-border bg-card p-6 space-y-4">
                <h2 className="text-lg font-semibold">{t("sectionItems")}</h2>

                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="border border-border rounded-lg p-4 space-y-3 bg-muted/30"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField
                          label={t("itemsTableHeaderDescription")}
                          htmlFor={`item-desc-${item.id}`}
                        >
                          <Input
                            id={`item-desc-${item.id}`}
                            type="text"
                            placeholder={t("itemsDescriptionPlaceholder")}
                            value={item.description}
                            onChange={(e) =>
                              updateItem(item.id, "description", e.target.value)
                            }
                          />
                        </FormField>

                        <FormField
                          label={t("itemsTableHeaderStore")}
                          htmlFor={`item-store-${item.id}`}
                        >
                          <Input
                            id={`item-store-${item.id}`}
                            type="text"
                            placeholder={t("itemsStorePlaceholder")}
                            value={item.storeName}
                            onChange={(e) =>
                              updateItem(item.id, "storeName", e.target.value)
                            }
                          />
                        </FormField>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <FormField
                          label={t("itemsTableHeaderUnitPriceCny")}
                          htmlFor={`item-price-${item.id}`}
                        >
                          <Input
                            id={`item-price-${item.id}`}
                            type="number"
                            step="0.01"
                            value={item.unitPriceCNY}
                            onChange={(e) =>
                              updateItem(
                                item.id,
                                "unitPriceCNY",
                                Number.parseFloat(e.target.value) || 0
                              )
                            }
                            onFocus={handleNumberFocus}
                          />
                        </FormField>

                        <FormField
                          label={t("itemsTableHeaderQuantity")}
                          htmlFor={`item-qty-${item.id}`}
                        >
                          <Input
                            id={`item-qty-${item.id}`}
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(
                                item.id,
                                "quantity",
                                Number.parseInt(e.target.value, 10) || 1
                              )
                            }
                            onFocus={handleNumberFocus}
                          />
                        </FormField>

                        <FormField
                          label={t("itemsTableHeaderWeight")}
                          htmlFor={`item-weight-${item.id}`}
                        >
                          <Input
                            id={`item-weight-${item.id}`}
                            type="number"
                            step="0.1"
                            value={item.weightGrams ?? ""}
                            onChange={(e) =>
                              updateItem(
                                item.id,
                                "weightGrams",
                                Number.parseFloat(e.target.value) || 0
                              )
                            }
                            onFocus={handleNumberFocus}
                          />
                        </FormField>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="inline-flex items-center gap-1 text-sm text-destructive hover:underline font-medium"
                      >
                        <X className="h-3 w-3" />
                        {t("removeItemButton")}
                      </button>
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  onClick={addItem}
                  variant="outline"
                  className="w-full"
                >
                  {t("addItemButton")}
                </Button>
                {errors.items && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.items}
                  </p>
                )}
              </section>

              <section className="rounded-xl border border-border bg-card p-6 space-y-4">
                <h2 className="text-lg font-semibold">{t("sectionCosts")}</h2>

                <FormField
                  label={t("costsInternationalShippingLabel")}
                  htmlFor="internationalShipping"
                  error={errors.internationalShippingCNY}
                >
                  <Input
                    id="internationalShipping"
                    type="number"
                    step="0.01"
                    value={internationalShippingCNY}
                    onChange={(e) =>
                      setInternationalShippingCNY(
                        Number.parseFloat(e.target.value) || 0
                      )
                    }
                    onFocus={handleNumberFocus}
                  />
                </FormField>

                <FormField
                  label={t("costsDomesticShippingLabel")}
                  htmlFor="domesticShipping"
                >
                  <Input
                    id="domesticShipping"
                    type="number"
                    step="0.01"
                    value={domesticShippingCNY}
                    onChange={(e) =>
                      setDomesticShippingCNY(
                        Number.parseFloat(e.target.value) || 0
                      )
                    }
                    onFocus={handleNumberFocus}
                  />
                </FormField>

                <FormField
                  label={t("costsServiceFeeLabel")}
                  htmlFor="serviceFee"
                >
                  <Input
                    id="serviceFee"
                    type="number"
                    step="0.01"
                    value={serviceFeeCNY}
                    onChange={(e) =>
                      setServiceFeeCNY(Number.parseFloat(e.target.value) || 0)
                    }
                    onFocus={handleNumberFocus}
                  />
                </FormField>

                <FormField label={t("costsInsuranceLabel")} htmlFor="insurance">
                  <Input
                    id="insurance"
                    type="number"
                    step="0.01"
                    value={insuranceCNY}
                    onChange={(e) =>
                      setInsuranceCNY(Number.parseFloat(e.target.value) || 0)
                    }
                    onFocus={handleNumberFocus}
                  />
                </FormField>

                <FormField label={t("costsOtherLabel")} htmlFor="otherCosts">
                  <Input
                    id="otherCosts"
                    type="number"
                    step="0.01"
                    value={otherCostsCNY}
                    onChange={(e) =>
                      setOtherCostsCNY(Number.parseFloat(e.target.value) || 0)
                    }
                    onFocus={handleNumberFocus}
                  />
                </FormField>
              </section>

              <section className="rounded-xl border border-border bg-card p-6 space-y-4">
                <h2 className="text-lg font-semibold">
                  {t("sectionDeclaration")}
                </h2>

                <FormField
                  label={t("declarationTotalUsdLabel")}
                  htmlFor="declarationTotal"
                  error={errors.declarationTotalUSD}
                >
                  <Input
                    id="declarationTotal"
                    type="number"
                    step="0.01"
                    value={declarationTotalUSD}
                    onChange={(e) =>
                      setDeclarationTotalUSD(
                        Number.parseFloat(e.target.value) || 0
                      )
                    }
                    onFocus={handleNumberFocus}
                  />
                </FormField>

                <FormField
                  label={t("importTaxRateLabel")}
                  htmlFor="importTax"
                  error={errors.importTaxRate}
                >
                  <Input
                    id="importTax"
                    type="number"
                    step="1"
                    value={importTaxRate}
                    onChange={(e) =>
                      setImportTaxRate(Number.parseInt(e.target.value, 10) || 0)
                    }
                    onFocus={handleNumberFocus}
                  />
                </FormField>

                <FormField
                  label={t("icmsRateLabel")}
                  htmlFor="icmsRate"
                  error={errors.icmsRate}
                >
                  <Input
                    id="icmsRate"
                    type="number"
                    step="1"
                    value={icmsRate}
                    onChange={(e) =>
                      setIcmsRate(Number.parseInt(e.target.value, 10) || 0)
                    }
                    onFocus={handleNumberFocus}
                  />
                </FormField>

                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium">
                    {t("taxBaseModeLabel")}
                  </span>
                  <RadioGroup
                    value={taxBaseMode}
                    onValueChange={(v) => setTaxBaseMode(v as TaxBaseMode)}
                    className="mt-1 space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="declared_only"
                        id="declared_only"
                      />
                      <Label
                        htmlFor="declared_only"
                        className="text-sm cursor-pointer"
                      >
                        {t("taxBaseDeclaredOnly")}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="declared_plus_freight"
                        id="declared_plus_freight"
                      />
                      <Label
                        htmlFor="declared_plus_freight"
                        className="text-sm cursor-pointer"
                      >
                        {t("taxBaseDeclaredPlusFreight")}
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="h-px bg-border my-2" />

                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium">
                      {t("rateioModeLabel")}
                    </span>
                    <RadioGroup
                      value={rateioMode}
                      onValueChange={(v) => setRateioMode(v as RateioMode)}
                      className="mt-1 space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="by_value" id="by_value" />
                        <Label
                          htmlFor="by_value"
                          className="text-sm cursor-pointer"
                        >
                          {t("rateioByValue")}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="by_weight" id="by_weight" />
                        <Label
                          htmlFor="by_weight"
                          className="text-sm cursor-pointer"
                        >
                          {t("rateioByWeight")}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="by_quantity" id="by_quantity" />
                        <Label
                          htmlFor="by_quantity"
                          className="text-sm cursor-pointer"
                        >
                          {t("rateioByQuantity")}
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <FormField
                    label={t("mainMarginLabel")}
                    htmlFor="mainMargin"
                    error={errors.mainMarginPercent}
                  >
                    <Input
                      id="mainMargin"
                      type="number"
                      step="1"
                      value={mainMarginPercent}
                      onChange={(e) =>
                        setMainMarginPercent(
                          Number.parseInt(e.target.value, 10) || 0
                        )
                      }
                      onFocus={handleNumberFocus}
                    />
                  </FormField>
                </div>
              </section>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  onClick={handleCalculate}
                  className="flex-1"
                >
                  {t("calculateButton")}
                </Button>
                <Button
                  type="button"
                  onClick={handleReset}
                  variant="outline"
                  className="flex-1"
                >
                  {t("resetButton")}
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              {result ? (
                <section className="rounded-xl border border-border bg-card p-6 space-y-6">
                  <h2 className="text-lg font-semibold">{t("resultsTitle")}</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-lg border border-border bg-muted/10 p-4">
                      <p className="text-sm text-muted-foreground">
                        {t("summaryTotalCost")}
                      </p>
                      <p className="mt-1 text-xl font-bold text-primary">
                        {formatCurrency(result.totalCostBRL)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/10 p-4">
                      <p className="text-sm text-muted-foreground">
                        {t("summaryTotalTaxes")}
                      </p>
                      <p className="mt-1 text-xl font-bold text-destructive">
                        {formatCurrency(result.totalTaxesBRL)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/10 p-4">
                      <p className="text-sm text-muted-foreground">
                        {t("summaryCostPerKg")}
                      </p>
                      <p className="mt-1 text-xl font-bold text-emerald-400">
                        {result.costPerKgBRL
                          ? formatCurrency(result.costPerKgBRL)
                          : t("costPerKgNotAvailable")}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/10 p-4">
                      <p className="text-sm text-muted-foreground">
                        {t("summaryItemsCount")}
                      </p>
                      <p className="mt-1 text-xl font-bold">
                        {result.totalItemsCount}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold">{t("itemsResultTitle")}</h3>
                    <div className="rounded-lg border border-border overflow-hidden">
                      <Table>
                        <TableHeader className="bg-muted/40">
                          <TableRow>
                            <TableHead className="text-xs">
                              {t("itemsResultHeaderDescription")}
                            </TableHead>
                            <TableHead className="text-xs">
                              {t("itemsResultHeaderQuantity")}
                            </TableHead>
                            <TableHead className="text-xs">
                              {t("itemsResultHeaderUnitCost")}
                            </TableHead>
                            <TableHead className="text-xs">
                              {t("itemsResultHeaderSuggestedPrice")}
                            </TableHead>
                            <TableHead className="text-xs">
                              {t("itemsResultHeaderTotalProfit")}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {result.itemResults.map((ir) => (
                            <TableRow key={ir.item.id}>
                              <TableCell className="text-xs">
                                {ir.item.description}
                              </TableCell>
                              <TableCell className="text-xs">
                                {ir.item.quantity}
                              </TableCell>
                              <TableCell className="text-xs font-semibold">
                                {formatCurrency(ir.unitCostBRL)}
                              </TableCell>
                              <TableCell className="text-xs font-semibold text-primary">
                                {formatCurrency(ir.suggestedPriceBRL)}
                              </TableCell>
                              <TableCell className="text-xs font-semibold text-emerald-400">
                                {formatCurrency(ir.totalProfitBRL)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {t("disclaimer")}
                  </p>
                </section>
              ) : (
                <section className="rounded-xl border border-border bg-card p-6 text-center space-y-3">
                  <h3 className="text-lg font-semibold">
                    {t("resultsEmptyTitle")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("resultsEmptyDescription")}
                  </p>
                </section>
              )}
            </div>
          </div>
        </div>

        {isPreviewOpen && parsedPreview && (
          <PreviewModal
            preview={parsedPreview}
            onConfirm={handleConfirmPreview}
            onCancel={() => setIsPreviewOpen(false)}
          />
        )}
      </main>
    </>
  );
}

function PreviewModal({
  preview,
  onConfirm,
  onCancel,
}: {
  preview: ParsedPreview;
  onConfirm: (items: PackageItem[], costs: Partial<PackageCosts>) => void;
  onCancel: () => void;
}) {
  const [previewItems, setPreviewItems] = useState(preview.items);
  const [previewCosts, setPreviewCosts] = useState<Partial<PackageCosts>>(
    preview.inferredCosts
  );

  const updatePreviewItem = (
    id: string,
    field: keyof PackageItem,
    value: any
  ) => {
    setPreviewItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const removePreviewItem = (id: string) => {
    setPreviewItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-4xl rounded-xl border border-border bg-card p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">{t("previewModalTitle")}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {t("previewModalDescription")}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-md hover:bg-muted/60"
          >
            <X size={18} />
          </button>
        </div>

        <section className="mb-6 p-4 rounded-lg border border-border bg-muted/10">
          <h3 className="font-semibold mb-4">
            {t("previewModalCostsSection")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label={t("costsInternationalShippingLabel")}
              htmlFor="previewInternationalShipping"
            >
              <Input
                id="previewInternationalShipping"
                type="number"
                step="0.01"
                value={previewCosts.internationalShippingCNY || 0}
                onChange={(e) =>
                  setPreviewCosts((prev) => ({
                    ...prev,
                    internationalShippingCNY:
                      Number.parseFloat(e.target.value) || 0,
                  }))
                }
                onFocus={handleNumberFocus}
              />
            </FormField>

            <FormField
              label={t("costsServiceFeeLabel")}
              htmlFor="previewServiceFee"
            >
              <Input
                id="previewServiceFee"
                type="number"
                step="0.01"
                value={previewCosts.serviceFeeCNY || 0}
                onChange={(e) =>
                  setPreviewCosts((prev) => ({
                    ...prev,
                    serviceFeeCNY: Number.parseFloat(e.target.value) || 0,
                  }))
                }
                onFocus={handleNumberFocus}
              />
            </FormField>

            <FormField
              label={t("costsInsuranceLabel")}
              htmlFor="previewInsurance"
            >
              <Input
                id="previewInsurance"
                type="number"
                step="0.01"
                value={previewCosts.insuranceCNY || 0}
                onChange={(e) =>
                  setPreviewCosts((prev) => ({
                    ...prev,
                    insuranceCNY: Number.parseFloat(e.target.value) || 0,
                  }))
                }
                onFocus={handleNumberFocus}
              />
            </FormField>

            <FormField label={t("costsOtherLabel")} htmlFor="previewOther">
              <Input
                id="previewOther"
                type="number"
                step="0.01"
                value={previewCosts.otherCostsCNY || 0}
                onChange={(e) =>
                  setPreviewCosts((prev) => ({
                    ...prev,
                    otherCostsCNY: Number.parseFloat(e.target.value) || 0,
                  }))
                }
                onFocus={handleNumberFocus}
              />
            </FormField>
          </div>
        </section>

        <section className="mb-6 p-4 rounded-lg border border-border bg-muted/10">
          <h3 className="font-semibold mb-4">
            {t("previewModalItemsSection")}
          </h3>
          <div className="space-y-3">
            {previewItems.map((item) => (
              <div
                key={item.id}
                className="border border-border rounded-lg p-4 bg-background/60 space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField
                    label={t("itemsTableHeaderDescription")}
                    htmlFor={`preview-desc-${item.id}`}
                  >
                    <Input
                      id={`preview-desc-${item.id}`}
                      type="text"
                      value={item.description}
                      onChange={(e) =>
                        updatePreviewItem(
                          item.id,
                          "description",
                          e.target.value
                        )
                      }
                    />
                  </FormField>

                  <FormField
                    label={t("itemsTableHeaderStore")}
                    htmlFor={`preview-store-${item.id}`}
                  >
                    <Input
                      id={`preview-store-${item.id}`}
                      type="text"
                      value={item.storeName}
                      onChange={(e) =>
                        updatePreviewItem(item.id, "storeName", e.target.value)
                      }
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <FormField
                    label={t("itemsTableHeaderUnitPriceCny")}
                    htmlFor={`preview-price-${item.id}`}
                  >
                    <Input
                      id={`preview-price-${item.id}`}
                      type="number"
                      step="0.01"
                      value={item.unitPriceCNY}
                      onChange={(e) =>
                        updatePreviewItem(
                          item.id,
                          "unitPriceCNY",
                          Number.parseFloat(e.target.value) || 0
                        )
                      }
                      onFocus={handleNumberFocus}
                    />
                  </FormField>

                  <FormField
                    label={t("itemsTableHeaderQuantity")}
                    htmlFor={`preview-qty-${item.id}`}
                  >
                    <Input
                      id={`preview-qty-${item.id}`}
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        updatePreviewItem(
                          item.id,
                          "quantity",
                          Number.parseInt(e.target.value, 10) || 1
                        )
                      }
                      onFocus={handleNumberFocus}
                    />
                  </FormField>

                  <FormField
                    label={t("itemsTableHeaderWeight")}
                    htmlFor={`preview-weight-${item.id}`}
                  >
                    <Input
                      id={`preview-weight-${item.id}`}
                      type="number"
                      step="0.1"
                      value={item.weightGrams ?? ""}
                      onChange={(e) =>
                        updatePreviewItem(
                          item.id,
                          "weightGrams",
                          Number.parseFloat(e.target.value) || 0
                        )
                      }
                      onFocus={handleNumberFocus}
                    />
                  </FormField>
                </div>

                <button
                  type="button"
                  onClick={() => removePreviewItem(item.id)}
                  className="text-xs text-destructive hover:underline font-medium inline-flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  {t("removeItemButton")}
                </button>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <Button
            type="button"
            onClick={() => onConfirm(previewItems, previewCosts)}
            className="flex-1"
          >
            {t("previewModalConfirmButton")}
          </Button>
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            className="flex-1"
          >
            {t("previewModalCancelButton")}
          </Button>
        </div>
      </div>
    </div>
  );
}
