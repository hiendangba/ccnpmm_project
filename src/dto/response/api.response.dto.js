class ApiResponse {
  constructor(data, options = {}) {
    this.success = true;

    const { page, limit, totalItems, DTOClass } = options;

    // Nếu là mảng, có thể map DTO
    if (Array.isArray(data)) {
      this.data = DTOClass ? data.map(item => new DTOClass(item)) : data;
    } else {
      // Nếu là object, giữ nguyên
      this.data = data;
    }

    // Nếu có phân trang, thêm các thông tin liên quan
    if (page !== undefined && limit !== undefined && totalItems !== undefined) {
      this.page = page;
      this.limit = limit;
      this.totalItems = totalItems;
    }
  }
}

module.exports = ApiResponse;