// Data types for the application
export enum Role {
  ADMIN = "ADMIN",
  USER = "USER"
}

export interface Candidate {
  id?: string;
  name?: string;
  party?: string;
  image?: string;
  speech?: string;
  votes?: number;
}

export interface Citizen {
  id?: string;
  name?: string;
  address?: string;
  birthdate?: string;
  gender?: string;
  phone?: string;
  email?: string;
}

export interface Voter {
  id?: string;
  name?: string;
  address?: string;
  voted?: boolean;
  votedFor?: string;
  verificationCode?: string;
}

export interface CandidateResults {
  id?: string;
  name?: string;
  party?: string;
  votes?: number;
  percentage?: number;
}

export interface DateRange {
  from?: Date;
  to?: Date;
}

export interface Announcement {
  id?: string;
  title?: string;
  description?: string;
  startTimeVoting?: string;
  endTimeVoting?: string;
  candidates?: Candidate[];
}

export interface User {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  photoURL?: string;
}

export interface Transaction {
  id?: string;
  from?: string;
  to?: string;
  amount?: number;
  timestamp?: string;
  status?: string;
  blockId?: string;
}

export interface Block {
  id?: string;
  hash?: string;
  previousHash?: string;
  timestamp?: string;
  transactions?: Transaction[];
  nonce?: number;
}
