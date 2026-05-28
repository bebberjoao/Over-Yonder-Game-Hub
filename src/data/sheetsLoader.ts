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
    if (row.KDEN && row.KDPT) {
      result.kids.push({
        word: row.KDEN.trim().toLowerCase(),
        translation: row.KDPT.trim(),
        hint: row.KDDica?.trim() || row.KDPT.trim(),
        emoji: row.KDEmoji?.trim() || "✨",
        iconUrl: undefined,
      });
    }

    // Teens
    if (row.TNEN && row.TNPT) {
      result.teens.push({
        word: row.TNEN.trim().toLowerCase(),
        translation: row.TNPT.trim(),
        hint: row.TNDica?.trim() || row.TNPT.trim(),
        emoji: row.TNEmoji?.trim() || "✨",
        iconUrl: undefined,
      });
    }

    // Adults
    if (row.ADEN && row.ADPT) {
      result.adults.push({
        word: row.ADEN.trim().toLowerCase(),
        translation: row.ADPT.trim(),
        hint: row.ADDica?.trim() || row.ADPT.trim(),
        emoji: row.ADEmoji?.trim() || "✨",
        iconUrl: undefined,
      });
    }
  });

  return result;
}
