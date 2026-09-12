export interface CollegeOption {
  id: string;
  name: string;
  prefix: string;
}

export const COLLEGE_OPTIONS: readonly CollegeOption[] = [
  { id: "lnct-main", name: "LNCT Main, Bhopal (0103)", prefix: "0103" },
  { id: "lnct-e", name: "LNCT Excellence - LNCTE, Bhopal (0176)", prefix: "0176" },
  { id: "lnct-s", name: "LNCT Science - LNCTS, Bhopal (0157)", prefix: "0157" },
  { id: "lnctu", name: "LNCT University (LNCTU), Bhopal", prefix: "LNCTU" },
  { id: "lncp", name: "LNCP (Pharmacy), Bhopal", prefix: "LNCP" },
  { id: "lnct-mca-mba", name: "LNCT MCA / MBA Department", prefix: "LNCT-PG" },
  { id: "other", name: "Other College / External Institution", prefix: "" },
] as const;
