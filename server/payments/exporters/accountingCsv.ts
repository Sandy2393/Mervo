import { Parser } from "json2csv";

type AccountingRow = {
  date: string;
  account: string;
  amount_cents: number;
  currency: string;
  description: string;
  reference?: string;
};

export function buildAccountingCsv(rows: AccountingRow[]) {
  const parser = new Parser({
    fields: ["date", "account", "amount_cents", "currency", "description", "reference"],
  });
  return parser.parse(rows);
}
