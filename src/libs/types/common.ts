export interface T {
  [key: string]: any;
}

export enum Direction {
  ASC = 1,
  DESC = -1,
}
export interface OrdinaryInquiry {
  page: number;
  limit: number;
}

export interface PaginatedResult<G> {
  list: G[];
  metaCounter: { total: number }[];
}