window.APP_CONFIG = {
  appName:         "students",
  apiBaseUrl:      "http://127.0.0.1:8000/api/v1",
  environment:     "development",            // "development" | "production"

  // Locale
  defaultLocale: "en",
  locales: {
    en: { label: "English",  dir: "ltr" },
    ar: { label: "العربية", dir: "rtl" },
  },

  // Currency — rate base is JOD (rate: 1). All other rates = units per 1 JOD.
  defaultCurrency: 'JOD',
  currencies: {
    JOD: { symbol: 'JD', symbolAfter: true,  decimals: 3, rate: 1    },
    USD: { symbol: '$',  symbolAfter: false, decimals: 2, rate: 1.41 },
  },
};
