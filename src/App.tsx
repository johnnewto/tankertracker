import { useEffect, useMemo, useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Line,
  Marker,
} from 'react-simple-maps';
import { feature } from 'topojson-client';
import worldData from 'world-atlas/countries-110m.json';
import tankerTrafficSampleText from '../tankertraffic2021-2023.txt?raw';

const worldFeatures = feature(
  worldData as unknown as Parameters<typeof feature>[0],
  (worldData as { objects: { countries: unknown } }).objects.countries,
) as unknown;

const COUNTRY_CENTROIDS: Record<string, [number, number]> = {
  AE: [54.37, 24.45],
  AR: [-64.19, -34.61],
  AU: [133.78, -25.27],
  BE: [4.47, 50.5],
  BH: [50.56, 26.07],
  BR: [-51.93, -14.24],
  CA: [-106.35, 56.13],
  CD: [21.76, -4.04],
  CN: [104.2, 35.86],
  CU: [-77.78, 21.52],
  DE: [10.45, 51.17],
  DK: [9.5, 56.26],
  DZ: [1.66, 28.03],
  EC: [-78.18, -1.83],
  EG: [30.8, 26.82],
  ES: [-3.75, 40.46],
  FR: [2.21, 46.23],
  GA: [11.61, -0.8],
  GB: [-3.44, 55.38],
  GR: [21.82, 39.07],
  GY: [-58.93, 4.86],
  ID: [113.92, -0.79],
  IN: [78.96, 20.59],
  IL: [34.85, 31.05],
  IQ: [43.68, 33.22],
  IR: [53.69, 32.43],
  IT: [12.57, 41.87],
  JP: [138.25, 36.2],
  KR: [127.77, 35.91],
  KZ: [66.92, 48.02],
  KW: [47.48, 29.31],
  LY: [17.23, 26.34],
  MX: [-102.55, 23.63],
  MY: [101.98, 4.21],
  NG: [8.68, 9.08],
  NL: [5.29, 52.13],
  OM: [55.98, 21.51],
  PK: [69.35, 30.38],
  PL: [19.15, 51.92],
  PT: [-8.22, 39.4],
  QA: [51.18, 25.35],
  RU: [105.32, 61.52],
  SA: [45.08, 23.89],
  SD: [30.22, 12.86],
  SE: [18.64, 60.13],
  SG: [103.82, 1.35],
  TH: [100.99, 15.87],
  TR: [35.24, 38.96],
  SY: [38.99, 34.8],
  TW: [120.96, 23.7],
  US: [-95.71, 37.09],
  VE: [-66.59, 6.42],
  VN: [108.28, 14.06],
  YE: [48.52, 15.55],
  ZA: [22.94, -30.56],
};

const COUNTRY_NAMES: Record<string, string> = {
  AE: 'United Arab Emirates',
  AR: 'Argentina',
  AU: 'Australia',
  BE: 'Belgium',
  BH: 'Bahrain',
  BR: 'Brazil',
  CA: 'Canada',
  CD: 'Democratic Republic of the Congo',
  CN: 'China',
  CU: 'Cuba',
  DE: 'Germany',
  DK: 'Denmark',
  DZ: 'Algeria',
  EC: 'Ecuador',
  EG: 'Egypt',
  ES: 'Spain',
  FR: 'France',
  GA: 'Gabon',
  GB: 'United Kingdom',
  GR: 'Greece',
  GY: 'Guyana',
  ID: 'Indonesia',
  IN: 'India',
  IL: 'Israel',
  IQ: 'Iraq',
  IR: 'Iran',
  IT: 'Italy',
  JP: 'Japan',
  KR: 'South Korea',
  KZ: 'Kazakhstan',
  KW: 'Kuwait',
  LY: 'Libya',
  MX: 'Mexico',
  MY: 'Malaysia',
  NG: 'Nigeria',
  NL: 'Netherlands',
  OM: 'Oman',
  PK: 'Pakistan',
  PL: 'Poland',
  PT: 'Portugal',
  QA: 'Qatar',
  RU: 'Russia',
  SA: 'Saudi Arabia',
  SD: 'Sudan',
  SE: 'Sweden',
  SG: 'Singapore',
  TH: 'Thailand',
  TR: 'Turkey',
  SY: 'Syria',
  TW: 'Taiwan',
  US: 'United States',
  VE: 'Venezuela',
  VN: 'Vietnam',
  YE: 'Yemen',
  ZA: 'South Africa',
};

type FlowRecord = {
  year: number;
  month: number;
  origin_code: string;
  origin_name: string;
  destination_code: string;
  destination_name: string;
  barrels: number;
  cargo_type: string;
  source_file?: string;
};

const DESTINATION_GROUPS: Record<string, { label: string; codes: string[] }> = {
  india: { label: 'India', codes: ['IN'] },
  southeast_asia: {
    label: 'Southeast Asia',
    codes: ['ID', 'MY', 'SG', 'TH', 'VN'],
  },
};

const COUNTRY_ALIASES: Record<string, { code: string; name: string }> = {
  Algeria: { code: 'DZ', name: 'Algeria' },
  Bahrain: { code: 'BH', name: 'Bahrain' },
  Brazil: { code: 'BR', name: 'Brazil' },
  Canada: { code: 'CA', name: 'Canada' },
  China: { code: 'CN', name: 'China' },
  Cuba: { code: 'CU', name: 'Cuba' },
  DRC: { code: 'CD', name: 'Democratic Republic of the Congo' },
  Ecuador: { code: 'EC', name: 'Ecuador' },
  France: { code: 'FR', name: 'France' },
  Gabon: { code: 'GA', name: 'Gabon' },
  Greece: { code: 'GR', name: 'Greece' },
  Guyana: { code: 'GY', name: 'Guyana' },
  India: { code: 'IN', name: 'India' },
  Iran: { code: 'IR', name: 'Iran' },
  Iraq: { code: 'IQ', name: 'Iraq' },
  'Iraq (N)': { code: 'IQ', name: 'Iraq' },
  'Iraq (S)': { code: 'IQ', name: 'Iraq' },
  Israel: { code: 'IL', name: 'Israel' },
  Italy: { code: 'IT', name: 'Italy' },
  Japan: { code: 'JP', name: 'Japan' },
  Kazakhstan: { code: 'KZ', name: 'Kazakhstan' },
  Kuwait: { code: 'KW', name: 'Kuwait' },
  Libya: { code: 'LY', name: 'Libya' },
  Malaysia: { code: 'MY', name: 'Malaysia' },
  Netherlands: { code: 'NL', name: 'Netherlands' },
  Nigeria: { code: 'NG', name: 'Nigeria' },
  Oman: { code: 'OM', name: 'Oman' },
  Russia: { code: 'RU', name: 'Russia' },
  'Saudi Arabia': { code: 'SA', name: 'Saudi Arabia' },
  Singapore: { code: 'SG', name: 'Singapore' },
  'South Korea': { code: 'KR', name: 'South Korea' },
  Spain: { code: 'ES', name: 'Spain' },
  Sudan: { code: 'SD', name: 'Sudan' },
  Syria: { code: 'SY', name: 'Syria' },
  Taiwan: { code: 'TW', name: 'Taiwan' },
  Thailand: { code: 'TH', name: 'Thailand' },
  Turkey: { code: 'TR', name: 'Turkey' },
  UAE: { code: 'AE', name: 'United Arab Emirates' },
  'United Kingdom': { code: 'GB', name: 'United Kingdom' },
  USA: { code: 'US', name: 'United States' },
  Venezuela: { code: 'VE', name: 'Venezuela' },
};

function normalizeCode(value: unknown) {
  return String(value ?? '').trim().toUpperCase();
}

function toNumber(value: unknown) {
  const n = Number(String(value ?? '').replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : 0;
}

function parseMonthLabel(year: number, month: number) {
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleString('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function monthNumberFromName(name: string) {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return months.findIndex((month) => month === name) + 1;
}

function normalizeCountryLabel(label: string) {
  return label.replace(/\s+/g, ' ').trim();
}

function resolveCountry(label: string) {
  const normalized = normalizeCountryLabel(label);
  const alias = COUNTRY_ALIASES[normalized];
  if (alias) return alias;

  const directCode = normalizeCode(normalized);
  if (COUNTRY_NAMES[directCode]) {
    return { code: directCode, name: COUNTRY_NAMES[directCode] };
  }

  return null;
}

function parseCsvLine(line: string) {
  const cols: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      cols.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  cols.push(current.trim());
  return cols;
}

function parseCsv(text: string, filename: string): FlowRecord[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map((s) => s.toLowerCase());
  const idx = (names: string[]) =>
    names.map((n) => headers.indexOf(n)).find((i) => i >= 0) ?? -1;

  const iYear = idx(['year']);
  const iMonth = idx(['month']);
  const iOriginCode = idx(['origin_code', 'country_code', 'export_country_code']);
  const iOriginName = idx([
    'origin_name',
    'origin_country',
    'country',
    'export_country',
  ]);
  const iDestCode = idx(['destination_code']);
  const iDestName = idx(['destination_name', 'destination_country']);
  const iBarrels = idx(['barrels']);
  const iCargo = idx(['cargo_type', 'product', 'cargo']);

  if ([iYear, iMonth, iOriginCode, iDestCode, iBarrels].some((i) => i < 0)) {
    return [];
  }

  return lines
    .slice(1)
    .map((line) => {
      const cols = parseCsvLine(line);
      const originCode = normalizeCode(cols[iOriginCode]);
      const destinationCode = normalizeCode(cols[iDestCode]);

      return {
        year: Number(cols[iYear]),
        month: Number(cols[iMonth]),
        origin_code: originCode,
        origin_name: cols[iOriginName] || COUNTRY_NAMES[originCode] || originCode,
        destination_code: destinationCode,
        destination_name:
          cols[iDestName] ||
          COUNTRY_NAMES[destinationCode] ||
          destinationCode,
        barrels: toNumber(cols[iBarrels]),
        cargo_type: cols[iCargo] || 'Unknown',
        source_file: filename,
      };
    })
    .filter(
      (row) =>
        row.year > 0 &&
        row.month > 0 &&
        row.origin_code &&
        row.destination_code &&
        row.barrels > 0,
    );
}

function parseTankerTrafficMatrix(text: string, filename: string): FlowRecord[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.trim().length > 0);

  const rows: FlowRecord[] = [];
  let index = 0;

  while (index < lines.length) {
    const header = lines[index].trim();
    const monthMatch = header.match(
      /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})$/,
    );

    if (!monthMatch) {
      index += 1;
      continue;
    }

    const month = monthNumberFromName(monthMatch[1]);
    const year = Number(monthMatch[2]);
    index += 1;
    if (index >= lines.length) break;

    const originHeaders = lines[index]
      .split('\t')
      .map((cell) => cell.trim())
      .filter((cell) => cell.length > 0);
    index += 1;

    const origins = originHeaders
      .filter((headerLabel) => headerLabel !== 'Totals')
      .map((headerLabel) => resolveCountry(headerLabel));

    while (index < lines.length) {
      const line = lines[index];
      const nextMonth = line.match(
        /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})$/,
      );
      if (nextMonth) break;

      const cells = line.split('\t').map((cell) => cell.trim());
      const destinationLabel = cells[0];
      if (!destinationLabel || destinationLabel === 'Total') {
        index += 1;
        continue;
      }

      const destination = resolveCountry(destinationLabel);
      if (!destination) {
        index += 1;
        continue;
      }

      origins.forEach((origin, originIndex) => {
        const barrels = toNumber(cells[originIndex + 1]);
        if (!origin || barrels <= 0) return;

        rows.push({
          year,
          month,
          origin_code: origin.code,
          origin_name: origin.name,
          destination_code: destination.code,
          destination_name: destination.name,
          barrels,
          cargo_type: 'Crude Oil',
          source_file: filename,
        });
      });

      index += 1;
    }
  }

  return rows;
}

const SAMPLE_ROWS = parseTankerTrafficMatrix(
  tankerTrafficSampleText,
  'tankertraffic2021-2023.txt',
);

function parseTankerTrackersApi(text: string, filename: string): FlowRecord[] {
  const obj = JSON.parse(text) as {
    request?: {
      parameters?: Record<string, string | number>;
    };
    data?: Array<Record<string, string | number>>;
  };

  const params = obj.request?.parameters ?? {};
  const year = Number(params.Year ?? params.year);
  const month = Number(params.Month ?? params.month);
  const originCode = normalizeCode(
    params['Country Code'] ??
      params.country_code ??
      params.countryCode ??
      params.country,
  );
  const originName = COUNTRY_NAMES[originCode] || originCode;
  const rows = Array.isArray(obj.data) ? obj.data : [];

  return rows
    .map((item) => {
      const destinationCode = normalizeCode(item.destination_code);
      return {
        year,
        month,
        origin_code: originCode,
        origin_name: originName,
        destination_code: destinationCode,
        destination_name:
          String(item.destination_country ?? '').trim() ||
          COUNTRY_NAMES[destinationCode] ||
          destinationCode,
        barrels: toNumber(item.barrels),
        cargo_type: String(item.cargo_type ?? 'Unknown'),
        source_file: filename,
      };
    })
    .filter(
      (row) =>
        row.year > 0 &&
        row.month > 0 &&
        row.origin_code &&
        row.destination_code &&
        row.barrels > 0,
    );
}

function downloadCsv(rows: FlowRecord[]) {
  const header = [
    'year',
    'month',
    'origin_code',
    'origin_name',
    'destination_code',
    'destination_name',
    'barrels',
    'cargo_type',
  ];
  const lines = [header.join(',')].concat(
    rows.map((row) =>
      [
        row.year,
        row.month,
        row.origin_code,
        JSON.stringify(row.origin_name),
        row.destination_code,
        JSON.stringify(row.destination_name),
        row.barrels,
        JSON.stringify(row.cargo_type),
      ].join(','),
    ),
  );

  const blob = new Blob([lines.join('\n')], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'tankertrackers_aggregated_flows.csv';
  link.click();
  URL.revokeObjectURL(url);
}

function flowKey(row: FlowRecord) {
  return `${row.year}-${row.month}-${row.origin_code}-${row.destination_code}-${row.cargo_type}`;
}

function aggregate(rows: FlowRecord[]) {
  const map = new Map<string, FlowRecord>();

  for (const row of rows) {
    const key = flowKey(row);
    const prev = map.get(key);
    if (prev) {
      prev.barrels += row.barrels;
      continue;
    }
    map.set(key, { ...row });
  }

  return [...map.values()];
}

function formatYearRange(years: number[]) {
  if (years.length === 0) return 'Sample';
  if (years.length === 1) return String(years[0]);
  return `${years[0]}-${years[years.length - 1]}`;
}

function formatPeriodLabel(period: { year: number; month: number }) {
  return parseMonthLabel(period.year, period.month);
}

export default function App() {
  const [rows, setRows] = useState<FlowRecord[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedCargo, setSelectedCargo] = useState<string>('all');
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
  const [showMarkers, setShowMarkers] = useState(true);
  const [minBarrels, setMinBarrels] = useState(0);
  const [useTimeline, setUseTimeline] = useState(true);
  const [isTimelinePlaying, setIsTimelinePlaying] = useState(false);
  const [timelineIndex, setTimelineIndex] = useState(0);

  const dataset = useMemo(
    () => (rows.length > 0 ? aggregate(rows) : SAMPLE_ROWS),
    [rows],
  );
  const years = useMemo(
    () => [...new Set(dataset.map((row) => row.year))].sort((a, b) => a - b),
    [dataset],
  );
  const visibleYears = years.length > 0 ? years : [2022, 2023];
  const cargos = useMemo(
    () => [...new Set(dataset.map((row) => row.cargo_type))].sort(),
    [dataset],
  );
  const destinationOptions = useMemo(() => {
    const destinationCodes = [
      ...new Set(dataset.map((row) => row.destination_code).filter(Boolean)),
    ].sort((a, b) =>
      (COUNTRY_NAMES[a] || a).localeCompare(COUNTRY_NAMES[b] || b),
    );

    return destinationCodes.map((code) => ({
      value: `country:${code}`,
      label: COUNTRY_NAMES[code] || code,
    }));
  }, [dataset]);
  const selectedDestinationCodes = useMemo(() => {
    const codes = new Set<string>();

    selectedDestinations.forEach((value) => {
      if (value.startsWith('country:')) {
        codes.add(value.slice('country:'.length));
        return;
      }

      DESTINATION_GROUPS[value]?.codes.forEach((code) => codes.add(code));
    });

    return codes;
  }, [selectedDestinations]);
  const baseFiltered = useMemo(() => {
    return dataset.filter((row) => {
      if (!visibleYears.includes(row.year)) return false;
      if (selectedYear !== 'all' && row.year !== Number(selectedYear)) {
        return false;
      }
      if (selectedMonth !== 'all' && row.month !== Number(selectedMonth)) {
        return false;
      }
      if (selectedCargo !== 'all' && row.cargo_type !== selectedCargo) {
        return false;
      }
      if (
        selectedDestinationCodes.size > 0 &&
        !selectedDestinationCodes.has(row.destination_code)
      ) {
        return false;
      }
      if (row.barrels < minBarrels) {
        return false;
      }
      return Boolean(
        COUNTRY_CENTROIDS[row.origin_code] &&
          COUNTRY_CENTROIDS[row.destination_code],
      );
    });
  }, [
    dataset,
    minBarrels,
    selectedCargo,
    selectedDestinationCodes,
    selectedMonth,
    selectedYear,
    visibleYears,
  ]);
  const timelinePeriods = useMemo(() => {
    const periodMap = new Map<string, { year: number; month: number }>();

    for (const row of baseFiltered) {
      const key = `${row.year}-${row.month}`;
      if (!periodMap.has(key)) {
        periodMap.set(key, { year: row.year, month: row.month });
      }
    }

    return [...periodMap.values()].sort((a, b) =>
      a.year === b.year ? a.month - b.month : a.year - b.year,
    );
  }, [baseFiltered]);
  const activeTimelinePeriod = useMemo(() => {
    if (timelinePeriods.length === 0) return null;
    const safeIndex = Math.min(timelineIndex, timelinePeriods.length - 1);
    return timelinePeriods[safeIndex];
  }, [timelineIndex, timelinePeriods]);
  const filtered = useMemo(() => {
    if (!useTimeline || !activeTimelinePeriod) {
      return baseFiltered;
    }

    return baseFiltered.filter(
      (row) =>
        row.year === activeTimelinePeriod.year &&
        row.month === activeTimelinePeriod.month,
    );
  }, [activeTimelinePeriod, baseFiltered, useTimeline]);

  useEffect(() => {
    if (timelinePeriods.length === 0) {
      setTimelineIndex(0);
      setIsTimelinePlaying(false);
      return;
    }

    setTimelineIndex((current) => Math.min(current, timelinePeriods.length - 1));
  }, [timelinePeriods]);

  useEffect(() => {
    if (!useTimeline || !isTimelinePlaying || timelinePeriods.length <= 1) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setTimelineIndex((current) => (current + 1) % timelinePeriods.length);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isTimelinePlaying, timelinePeriods.length, useTimeline]);

  useEffect(() => {
    if (!useTimeline) {
      setIsTimelinePlaying(false);
    }
  }, [useTimeline]);

  const ranked = useMemo(
    () => [...filtered].sort((a, b) => b.barrels - a.barrels),
    [filtered],
  );
  const totalBarrels = useMemo(
    () => filtered.reduce((sum, row) => sum + row.barrels, 0),
    [filtered],
  );
  const maxBarrels = ranked[0]?.barrels || 1;

  const sourceMarkerTotals = useMemo(() => {
    const totals = new Map<string, number>();

    for (const row of filtered) {
      totals.set(row.origin_code, (totals.get(row.origin_code) || 0) + row.barrels);
    }

    return [...totals.entries()].map(([code, barrels]) => ({
      code,
      barrels,
      coords: COUNTRY_CENTROIDS[code],
      name: COUNTRY_NAMES[code] || code,
    }));
  }, [filtered]);
  const destinationMarkerTotals = useMemo(() => {
    const totals = new Map<string, number>();

    for (const row of filtered) {
      totals.set(
        row.destination_code,
        (totals.get(row.destination_code) || 0) + row.barrels,
      );
    }

    return [...totals.entries()].map(([code, barrels]) => ({
      code,
      barrels,
      coords: COUNTRY_CENTROIDS[code],
      name: COUNTRY_NAMES[code] || code,
    }));
  }, [filtered]);
  const maxMarkerBarrels = useMemo(() => {
    const sourceMax = sourceMarkerTotals.reduce(
      (max, marker) => Math.max(max, marker.barrels),
      0,
    );
    const destinationMax = destinationMarkerTotals.reduce(
      (max, marker) => Math.max(max, marker.barrels),
      0,
    );

    return Math.max(sourceMax, destinationMax, 1);
  }, [destinationMarkerTotals, sourceMarkerTotals]);

  function toggleDestination(value: string) {
    setSelectedDestinations((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  async function onUpload(files: FileList | null) {
    if (!files?.length) return;

    const next: FlowRecord[] = [];

    for (const file of Array.from(files)) {
      const text = await file.text();
      try {
        if (file.name.toLowerCase().endsWith('.json')) {
          next.push(...parseTankerTrackersApi(text, file.name));
          continue;
        }
        if (file.name.toLowerCase().endsWith('.csv')) {
          next.push(...parseCsv(text, file.name));
          continue;
        }
        if (file.name.toLowerCase().endsWith('.txt')) {
          next.push(...parseTankerTrafficMatrix(text, file.name));
        }
      } catch (error) {
        console.error(`Failed to parse ${file.name}`, error);
      }
    }

    if (next.length === 0) return;

    setRows(next);
    setSelectedYear('all');
    setSelectedMonth('all');
    setSelectedCargo('all');
    setSelectedDestinations([]);
    setMinBarrels(0);
    setUseTimeline(true);
    setIsTimelinePlaying(false);
    setTimelineIndex(0);
  }

  return (
    <div className="shell">
      <main className="layout">
        <section className="panel controls">
          <label className="field">
            <span>JSON, CSV, or TXT files</span>
            <input
              type="file"
              multiple
              accept=".json,.csv,.txt"
              onChange={(event) => onUpload(event.target.files)}
            />
          </label>

          <div className="button-row">
            <button type="button" onClick={() => downloadCsv(dataset)}>
              Export current table
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => {
                setRows([]);
                setSelectedYear('all');
                setSelectedMonth('all');
                setSelectedCargo('all');
                setSelectedDestinations([]);
                setMinBarrels(0);
                setShowMarkers(true);
                setUseTimeline(true);
                setIsTimelinePlaying(false);
                setTimelineIndex(0);
              }}
            >
              Reset to bundled sample
            </button>
          </div>

          <div className="filter-grid">
            <label className="field">
              <span>Year</span>
              <select
                value={selectedYear}
                onChange={(event) => setSelectedYear(event.target.value)}
              >
                <option value="all">All loaded years</option>
                {visibleYears.map((year) => (
                  <option key={year} value={String(year)}>
                    {year}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Month</span>
              <select
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
              >
                <option value="all">All months</option>
                {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
                  <option key={month} value={String(month)}>
                    {new Date(Date.UTC(2024, month - 1, 1)).toLocaleString(
                      'en-US',
                      { month: 'long', timeZone: 'UTC' },
                    )}
                  </option>
                ))}
              </select>
            </label>

            <label className="field field-wide">
              <span>Cargo type</span>
              <select
                value={selectedCargo}
                onChange={(event) => setSelectedCargo(event.target.value)}
              >
                <option value="all">All cargoes</option>
                {cargos.map((cargo) => (
                  <option key={cargo} value={cargo}>
                    {cargo}
                  </option>
                ))}
              </select>
            </label>

            <div className="field field-wide">
              <div className="filter-header">
                <span>Destinations</span>
                {selectedDestinations.length > 0 && (
                  <button
                    type="button"
                    className="clear-button"
                    onClick={() => setSelectedDestinations([])}
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="destination-picker">
                {Object.entries(DESTINATION_GROUPS).map(([value, group]) => (
                  <label key={value} className="destination-option">
                    <input
                      type="checkbox"
                      checked={selectedDestinations.includes(value)}
                      onChange={() => toggleDestination(value)}
                    />
                    <span>{group.label}</span>
                  </label>
                ))}
                {destinationOptions.map((option) => (
                  <label key={option.value} className="destination-option">
                    <input
                      type="checkbox"
                      checked={selectedDestinations.includes(option.value)}
                      onChange={() => toggleDestination(option.value)}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <label className="field field-wide">
              <span>Minimum barrels: {minBarrels.toLocaleString()}</span>
              <input
                type="range"
                min="0"
                max={Math.max(
                  1000000,
                  Math.ceil(maxBarrels / 1000000) * 1000000,
                )}
                step="500000"
                value={minBarrels}
                onChange={(event) => setMinBarrels(Number(event.target.value))}
              />
            </label>

            <label className="checkbox">
              <input
                type="checkbox"
                checked={showMarkers}
                onChange={(event) => setShowMarkers(event.target.checked)}
              />
              <span>Show country markers</span>
            </label>
          </div>
        </section>

        <section className="workspace">
          <section className="panel map-panel">
            <div className="map-header">
              <div className="panel-header map-title">
                <h2>World flow map</h2>
                <p>Arc thickness scales with barrels.</p>
              </div>
              <div className="map-legend">
                <span className="legend-item">
                  <span className="legend-dot legend-source" />
                  Sources
                </span>
                <span className="legend-item">
                  <span className="legend-dot legend-destination" />
                  Destinations
                </span>
                {useTimeline && activeTimelinePeriod && (
                  <span className="legend-period">
                    Showing {formatPeriodLabel(activeTimelinePeriod)}
                  </span>
                )}
              </div>
            </div>

            <div className="map-frame">
              <ComposableMap projectionConfig={{ scale: 150 }}>
                <Geographies geography={worldFeatures}>
                  {({ geographies }: { geographies: Array<{ rsmKey: string }> }) =>
                    geographies.map((geo: { rsmKey: string }) => (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill="#d9e3ef"
                        stroke="#8ba0b5"
                        strokeWidth={0.45}
                      />
                    ))
                  }
                </Geographies>

                {ranked.map((row, index) => {
                  const from = COUNTRY_CENTROIDS[row.origin_code];
                  const to = COUNTRY_CENTROIDS[row.destination_code];
                  if (!from || !to) return null;

                  return (
                    <Line
                      key={`${flowKey(row)}-${index}`}
                      from={from}
                      to={to}
                      stroke="rgba(0, 120, 145, 0.44)"
                      strokeWidth={0.8 + 6 * (row.barrels / maxBarrels)}
                      strokeLinecap="round"
                    />
                  );
                })}

                {showMarkers &&
                  sourceMarkerTotals.map((marker) => (
                    <Marker key={`source-${marker.code}`} coordinates={marker.coords}>
                      <title>{`Source: ${marker.name}: ${marker.barrels.toLocaleString()} barrels`}</title>
                      <circle
                        r={4 + Math.sqrt(marker.barrels / maxMarkerBarrels) * 11}
                        fill="rgba(10, 114, 133, 0.5)"
                        stroke="#ecfeff"
                        strokeWidth={1.2}
                      />
                    </Marker>
                  ))}

                {showMarkers &&
                  destinationMarkerTotals.map((marker) => (
                    <Marker key={marker.code} coordinates={marker.coords}>
                      <title>{`Destination: ${marker.name}: ${marker.barrels.toLocaleString()} barrels`}</title>
                      <circle
                        r={2.5 + Math.sqrt(marker.barrels / maxMarkerBarrels) * 7}
                        fill="rgba(205, 81, 39, 0.72)"
                        stroke="#fff7ed"
                        strokeWidth={1}
                      />
                    </Marker>
                  ))}
              </ComposableMap>
            </div>

            <div className="timeline-panel">
              <div className="filter-header">
                <span>Month timeline</span>
                {activeTimelinePeriod && (
                  <span className="timeline-label">
                    {useTimeline
                      ? formatPeriodLabel(activeTimelinePeriod)
                      : 'All months'}
                  </span>
                )}
              </div>
              <div className="timeline-controls">
                <button
                  type="button"
                  className="timeline-button secondary"
                  onClick={() => {
                    setUseTimeline(false);
                    setIsTimelinePlaying(false);
                  }}
                >
                  All months
                </button>
                <button
                  type="button"
                  className="timeline-button secondary"
                  onClick={() => {
                    setUseTimeline(true);
                    setIsTimelinePlaying(false);
                    setTimelineIndex((current) =>
                      Math.max(current - 1, 0),
                    );
                  }}
                  disabled={timelinePeriods.length <= 1}
                >
                  Prev
                </button>
                <button
                  type="button"
                  className="timeline-button secondary"
                  onClick={() => {
                    setUseTimeline(true);
                    setIsTimelinePlaying(false);
                    setTimelineIndex((current) =>
                      Math.min(current + 1, timelinePeriods.length - 1),
                    );
                  }}
                  disabled={timelinePeriods.length <= 1}
                >
                  Next
                </button>
                <button
                  type="button"
                  className="timeline-button"
                  onClick={() => setIsTimelinePlaying((current) => !current)}
                  disabled={timelinePeriods.length <= 1}
                >
                  {isTimelinePlaying ? 'Pause' : 'Play'}
                </button>
              </div>
              <input
                className="timeline-slider"
                type="range"
                min="0"
                max={Math.max(timelinePeriods.length - 1, 0)}
                step="1"
                value={Math.min(
                  timelineIndex,
                  Math.max(timelinePeriods.length - 1, 0),
                )}
                disabled={timelinePeriods.length === 0}
                onInput={(event) => {
                  const value = Number(
                    (event.target as HTMLInputElement).value,
                  );
                  setUseTimeline(true);
                  setIsTimelinePlaying(false);
                  setTimelineIndex(value);
                }}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  setUseTimeline(true);
                  setIsTimelinePlaying(false);
                  setTimelineIndex(value);
                }}
              />
              <div className="timeline-endpoints">
                <span>
                  {timelinePeriods[0]
                    ? formatPeriodLabel(timelinePeriods[0])
                    : 'No data'}
                </span>
                <span>
                  {timelinePeriods.length > 0
                    ? `${timelineIndex + 1} / ${timelinePeriods.length}`
                    : '0 / 0'}
                </span>
                <span>
                  {timelinePeriods[timelinePeriods.length - 1]
                    ? formatPeriodLabel(
                        timelinePeriods[timelinePeriods.length - 1],
                      )
                    : 'No data'}
                </span>
              </div>
            </div>

            <div className="stats map-stats">
              <article className="stat-card">
                <span>Flow rows</span>
                <strong>{filtered.length}</strong>
              </article>
              <article className="stat-card">
                <span>Total barrels</span>
                <strong>{totalBarrels.toLocaleString()}</strong>
              </article>
              <article className="stat-card">
                <span>Years loaded</span>
                <strong>{formatYearRange(years)}</strong>
              </article>
              <article className="stat-card">
                <span>Active window</span>
                <strong>{formatYearRange(visibleYears)}</strong>
              </article>
            </div>
          </section>

          <section className="panel flows-panel">
            <div className="panel-header">
              <h2>Largest flows</h2>
              <p>Top routes in the currently loaded year window.</p>
            </div>

            <div className="flow-list">
              {ranked.slice(0, 50).map((row, index) => (
                <article key={`${flowKey(row)}-${index}`} className="flow-card">
                  <div className="flow-badges">
                    <span>{parseMonthLabel(row.year, row.month)}</span>
                    <span>{row.cargo_type}</span>
                  </div>
                  <h3>
                    {row.origin_name} to {row.destination_name}
                  </h3>
                  <p>{row.barrels.toLocaleString()} barrels</p>
                  <small>
                    {row.origin_code} to {row.destination_code}
                    {row.source_file ? ` • ${row.source_file}` : ''}
                  </small>
                </article>
              ))}

              {ranked.length === 0 && (
                <div className="empty-state">
                  No flows match the current filters.
                </div>
              )}
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}
