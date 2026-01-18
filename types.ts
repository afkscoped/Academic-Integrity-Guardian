
export type UserRole = 'STUDENT' | 'FACULTY' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  institution: string;
}

export interface Submission {
  id: string;
  title: string;
  content: string;
  hash: string;
  timestamp: string;
  status: 'DRAFT' | 'FINAL';
  authorId: string;
  similarityScore: number;
  aiExplanation?: string;
  version: number;
}

export interface LedgerEntry {
  hash: string;
  submissionId: string;
  timestamp: string;
  actor: string;
  action: string;
}

export interface SimilarityAnalysis {
  score: number;
  segments: {
    text: string;
    similarity: number; // 0 to 1
    source?: string;
    explanation?: string;
  }[];
  summary: string;
  references?: {
    title: string;
    url: string;
  }[];
}

export interface AccessLog {
  id: string;
  timestamp: string;
  entity: string;
  purpose: string;
  resourceId: string;
}

export interface DeletionRequest {
  id: string;
  submissionId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestDate: string;
}
