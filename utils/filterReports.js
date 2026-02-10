// utils/filterReports.js
export const applyFilters = (items, filters, calculateFiscalYear) => {
  return items.filter((item) =>
    filters.every((filter) => {
      if (!filter.value) return true;
      if (filter.field === "fiscalYear") {
        const fiscalYear = calculateFiscalYear(item.submitTime);
        return fiscalYear.toString().includes(filter.value);
      }
      const fieldValue = item[filter.field]?.toString().toLowerCase();
      return fieldValue?.includes(filter.value.toLowerCase());
    })
  );
};
