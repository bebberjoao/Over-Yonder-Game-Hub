import { AgeGroup, WordEntry } from "./words";

export interface SheetsConfig {
  spreadsheetId?: string;
  csvUrl?: string;
  sheetName?: string; // Default: first sheet
}

interface SheetRow {
  KDEN?: string;
  KDPT?: string;
  KDDica?: string;
  KDEmoji?: string;
  TNEN?: string;
  TNPT?: string;
  TNDica?: string;
  TNEmoji?: string;
  ADEN?: string;
  ADPT?: string;
  ADDica?: string;
  ADEmoji?: string;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

function csvToRecords(csv: string): SheetRow[] {
  const lines = csv.split("\n").filter((line) => line.trim());
  if (lines.length < 2) return [];

  const headerLine = lines[0];
  const headers = parseCsvLine(headerLine).map((h) => h.trim());

  const records: SheetRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const row: SheetRow = {};

    headers.forEach((header, index) => {
      if (header && values[index] !== undefined) {
        row[header as keyof SheetRow] = values[index] || "";
      }
    });

    // Only add row if it has at least one entry
    if (Object.keys(row).length > 0) {
      records.push(row);
    }
  }

  return records;
}

export async function fetchWordsFromSheets(config: SheetsConfig): Promise<Record<AgeGroup, WordEntry[]>> {
  const { spreadsheetId, csvUrl, sheetName = "0" } = config;

  if (!csvUrl && !spreadsheetId) {
    throw new Error("Missing Google Sheets CSV URL or spreadsheet ID.");
  }

  const url = csvUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${sheetName}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch sheets: ${response.status} ${response.statusText}`);
  }

  const csv = await response.text();
  const records = csvToRecords(csv);

  const result: Record<AgeGroup, WordEntry[]> = {
    kids: [],
    teens: [],
    adults: [],
  };

  records.forEach((row) => {
    // Kids
    const kden = row.KDEN?.trim() || "";
    const kdpt = row.KDPT?.trim() || "";
    if (kden && kdpt) {
      result.kids.push({
        word: kden.toLowerCase(),
        translation: kdpt,
        hint: row.KDDica?.trim() || kdpt,
        emoji: row.KDEmoji?.trim() || "✨",
        iconUrl: undefined,
      });
    }

    // Teens
    const tnen = row.TNEN?.trim() || "";
    const tnpt = row.TNPT?.trim() || "";
    if (tnen && tnpt) {
      result.teens.push({
        word: tnen.toLowerCase(),
        translation: tnpt,
        hint: row.TNDica?.trim() || tnpt,
        emoji: row.TNEmoji?.trim() || "✨",
        iconUrl: undefined,
      });
    }

    // Adults
    const aden = row.ADEN?.trim() || "";
    const adpt = row.ADPT?.trim() || "";
    if (aden && adpt) {
      result.adults.push({
        word: aden.toLowerCase(),
        translation: adpt,
        hint: row.ADDica?.trim() || adpt,
        emoji: row.ADEmoji?.trim() || "✨",
        iconUrl: undefined,
      });
    }
  });

  return result;
}
