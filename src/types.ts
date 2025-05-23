export interface RiskRecord {
  "Entity Name": string;
  "Risk Score": number;
  "Country": string;
  "Sector": string;
  "Compliance Status": string;
  "Last Updated": string;
  [key: string]: string | number;
}