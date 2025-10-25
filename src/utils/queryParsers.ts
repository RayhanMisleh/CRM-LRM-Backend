export interface PaginationParams {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
}

export type SortOrder = 'asc' | 'desc';

export interface SortParams {
  sortBy?: string;
  sortOrder: SortOrder;
}

export interface DateFilterParams {
  startDate?: Date;
  endDate?: Date;
}

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export const parsePagination = (pageParam?: string, pageSizeParam?: string): PaginationParams => {
  const page = Math.max(Number(pageParam) || 1, 1);
  const parsedPageSize = Number(pageSizeParam) || DEFAULT_PAGE_SIZE;
  const pageSize = Math.min(Math.max(parsedPageSize, 1), MAX_PAGE_SIZE);

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
};

export const parseSort = (sortBy?: string, sortOrder?: string): SortParams => {
  const normalizedOrder = sortOrder?.toLowerCase() === 'asc' ? 'asc' : 'desc';

  return {
    sortBy,
    sortOrder: normalizedOrder,
  };
};

export const parseDateFilters = (startDate?: string, endDate?: string): DateFilterParams => {
  const parsedStartDate = startDate ? new Date(startDate) : undefined;
  const parsedEndDate = endDate ? new Date(endDate) : undefined;

  return {
    startDate: Number.isNaN(parsedStartDate?.getTime()) ? undefined : parsedStartDate,
    endDate: Number.isNaN(parsedEndDate?.getTime()) ? undefined : parsedEndDate,
  };
};
