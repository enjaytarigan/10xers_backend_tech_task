export class PaginationService {
  static getPagination(page = 1, size = 5): { limit: number; offset: number } {
    const limit = size;
    const offset = (page - 1) * limit;

    return { limit, offset };
  }

  static getPaginationMetadata({
    totalData,
    page = 1, // default page is 1
    limit,
  }: {
    totalData: number;
    page: number;
    limit: number;
  }) {
    const currentPage = page;
    const totalPages = Math.ceil(totalData / limit) || 1;

    return { currentPage, totalPages };
  }
}
