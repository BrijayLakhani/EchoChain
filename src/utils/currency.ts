// Country-wise price display.
//
// In a REAL build, react-native-iap returns each product's price already
// localised by Google Play / App Store for the user's account region — you'd
// show `product.localizedPrice` directly. This util mirrors that behaviour for
// the simulated catalog: detect the device locale, pick a currency, convert a
// base USD amount, and format it natively.
//
// TODO(real IAP): replace formatPrice() usage with the store's localizedPrice.

// Device locale via Intl (Hermes ships Intl on RN 0.85). Falls back to en-US.
function deviceLocale(): string {
  try {
    const loc = Intl.NumberFormat().resolvedOptions().locale;
    if (loc) return loc;
  } catch {}
  return 'en-US';
}

// Region (e.g. "IN") from a BCP-47 locale ("en-IN", "hi-IN").
function regionOf(locale: string): string {
  const parts = locale.split('-');
  const maybe = parts.find(p => p.length === 2 && p === p.toUpperCase());
  return maybe ?? 'US';
}

// Region → ISO currency code (common markets; default USD).
const REGION_CCY: Record<string, string> = {
  US: 'USD', IN: 'INR', GB: 'GBP', CA: 'CAD', AU: 'AUD', NZ: 'NZD',
  JP: 'JPY', CN: 'CNY', KR: 'KRW', BR: 'BRL', MX: 'MXN', RU: 'RUB',
  ZA: 'ZAR', SG: 'SGD', AE: 'AED', SA: 'SAR', TR: 'TRY', ID: 'IDR',
  PH: 'PHP', TH: 'THB', VN: 'VND', MY: 'MYR', CH: 'CHF', SE: 'SEK',
  NO: 'NOK', DK: 'DKK', PL: 'PLN',
  DE: 'EUR', FR: 'EUR', ES: 'EUR', IT: 'EUR', NL: 'EUR', IE: 'EUR',
  PT: 'EUR', AT: 'EUR', BE: 'EUR', FI: 'EUR', GR: 'EUR',
};

// Approx USD→local conversion (offline table; the store does the real FX).
const RATES: Record<string, number> = {
  USD: 1, INR: 83, GBP: 0.79, CAD: 1.36, AUD: 1.52, NZD: 1.64,
  JPY: 157, CNY: 7.2, KRW: 1350, BRL: 5.1, MXN: 17.5, RUB: 92,
  ZAR: 18.5, SGD: 1.34, AED: 3.67, SAR: 3.75, TRY: 32, IDR: 15800,
  PHP: 58, THB: 36, VND: 25000, MYR: 4.7, CHF: 0.9, SEK: 10.6,
  NOK: 10.8, DKK: 6.9, PLN: 4.0, EUR: 0.92,
};

// Currencies with no minor unit (show whole numbers).
const ZERO_DECIMAL = new Set(['JPY', 'KRW', 'VND', 'IDR']);

const locale   = deviceLocale();
const currency = REGION_CCY[regionOf(locale)] ?? 'USD';

export function userCurrency(): string { return currency; }

// Format a base USD price into the user's local currency string.
export function formatPrice(usd: number): string {
  const rate = RATES[currency] ?? 1;
  let amount = usd * rate;
  // Keep psychological .99 pricing for decimal currencies.
  if (!ZERO_DECIMAL.has(currency)) amount = Math.round(amount) - 0.01;
  else amount = Math.round(amount);
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency', currency,
      maximumFractionDigits: ZERO_DECIMAL.has(currency) ? 0 : 2,
    }).format(amount);
  } catch {
    return `$${usd.toFixed(2)}`;
  }
}
