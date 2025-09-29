export interface User {
  id: string;
  _id?:string;
  email: string;
  password: string;
  role: "admin" | "member" | "branch_lead";
  firstName: string;
  lastName: string;
  branch: "blue" | "yellow" | "red" | "purple";
  totalContributions: number;
  contributionDate?: string;
  activeLoan?: Loan;
  contributions: Contribution[];
  penalties: number;
  totalPenalties?:number;//to be cleaned
  isActive?: boolean;
  interestReceived: number;
  status?:string;
}

export interface Loan {
  _id?:string;
  id?: string;
  memberId?: string;
  amount: number;
  requestDate: Date;
  approvedDate?: Date;
  status: "pending" | "approved" | "rejected" | "active" | "repaid";
  approvedBy?: string;
  repaymentAmount: number;
  totalAmount?:number;//to be corrected after
  paidAmount?: number;
  interestRate?:number;
  dueDate: Date;
  createdAt?: Date;
  riskAssessment?:number;

member?: User;
  appliedDate?:Date
  duration: number;
}

export interface Contribution {
  id: string;
  userId: string;
  memberId: string | { _id: string };
  amount: number;
  contributionDate: string;
  month: string;
  type: "regular" | "penalty" | "interest"| "adjustment";
}

export interface GroupRules {
  maxLoanMultiplier: number;
  maxLoanAmount: number;
  interestRate: number;
  penaltyFee: number;
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  loans: Loan[];
  contributions: Contribution[];
  groupRules: Record<string, GroupRules>;
  bankBalance: number;
  paidPenalties: string[];
}
