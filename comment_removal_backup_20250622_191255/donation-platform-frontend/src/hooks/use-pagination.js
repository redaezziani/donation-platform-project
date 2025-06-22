import { useMemo } from 'react';

/**
 * A hook for generating pagination data
 */
export function usePagination({
  currentPage,
  totalPages,
  paginationItemsToDisplay = 5,
}) {
  const pages = useMemo(() => {
    // Handle invalid inputs
    if (totalPages <= 0 || currentPage <= 0) {
      return [];
    }
    
    // Ensure current page is valid
    const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
    
    // Special case: if total pages is less than or equal to items to display, show all pages
    if (totalPages <= paginationItemsToDisplay) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // Calculate the midpoint
    const midPoint = Math.floor(paginationItemsToDisplay / 2);
    
    // Calculate the start page
    let startPage = validCurrentPage - midPoint;
    
    // Adjust the start page if it's less than 1
    if (startPage < 1) {
      startPage = 1;
    }
    
    // Calculate the end page
    let endPage = startPage + paginationItemsToDisplay - 1;
    
    // Adjust the end page if it's greater than the total pages
    if (endPage > totalPages) {
      endPage = totalPages;
      // Readjust the start page if we have enough pages to display
      startPage = Math.max(1, endPage - paginationItemsToDisplay + 1);
    }
    
    // Generate the array of page numbers
    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
  }, [currentPage, totalPages, paginationItemsToDisplay]);
  
  // Determine if we should show the ellipsis
  const showLeftEllipsis = useMemo(
    () => pages.length > 0 && pages[0] > 1,
    [pages]
  );
  
  const showRightEllipsis = useMemo(
    () => pages.length > 0 && pages[pages.length - 1] < totalPages,
    [pages, totalPages]
  );
  
  return {
    pages,
    showLeftEllipsis,
    showRightEllipsis,
  };
}