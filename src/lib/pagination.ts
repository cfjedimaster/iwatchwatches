import { ITEMS_PER_PAGE } from "../config";

export function parsePageParam(value: string | null): number {
  const parsed = Number.parseInt(value ?? "1", 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return parsed;
}

export function getPagination(totalItems: number, page: number, pageSize = ITEMS_PER_PAGE) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);
  const offset = (currentPage - 1) * pageSize;
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return {
    pageSize,
    totalItems,
    totalPages,
    currentPage,
    offset,
    hasPrev,
    hasNext,
  };
}

export function pageHref(page: number): string {
  return page <= 1 ? "/" : `/?page=${page}`;
}

export function pageNumbers(currentPage: number, totalPages: number): number[] {
  const windowSize = 5;
  let start = Math.max(1, currentPage - Math.floor(windowSize / 2));
  let end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);

  const pages: number[] = [];
  for (let page = start; page <= end; page += 1) pages.push(page);
  return pages;
}
