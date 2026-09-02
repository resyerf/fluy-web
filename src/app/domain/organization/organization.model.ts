export interface Company {
  id: string;
  name: string;
  legalIdentifier: string | null;
}

export interface Branch {
  id: string;
  name: string;
}

export interface Department {
  id: string;
  name: string;
}

export interface BranchWithCompany {
  id: string;
  name: string;
  companyName: string;
}
