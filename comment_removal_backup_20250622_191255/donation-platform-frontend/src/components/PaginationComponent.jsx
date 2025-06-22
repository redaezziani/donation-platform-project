import { useId } from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { useTranslation } from 'react-i18next'

import { usePagination } from "@/hooks/use-pagination"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination"

/**
 * Pagination component
 * @param {Object} props - Component props
 * @param {number} props.currentPage - Current active page
 * @param {number} props.totalPages - Total number of pages
 * @param {number} props.paginationItemsToDisplay - Number of pagination items to display (default: 5)
 * @param {Function} props.onPageChange - Callback function when page changes
 * @returns {JSX.Element} - Pagination component
 */
export default function PaginationComponent({
  currentPage,
  totalPages,
  paginationItemsToDisplay = 5,
  onPageChange
}) {
  const id = useId()
  const { t, i18n } = useTranslation()

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage,
    totalPages,
    paginationItemsToDisplay,
  })

  // RTL languages
  const rtlLanguages = ['ar', 'he', 'fa', 'ur']
  const isRTL = rtlLanguages.includes(i18n.language)

  // Get appropriate icons based on language direction
  const PreviousIcon = isRTL ? ChevronRightIcon : ChevronLeftIcon
  const NextIcon = isRTL ? ChevronLeftIcon : ChevronRightIcon

  const handlePageInputChange = (e) => {
    const pageNumber = parseInt(e.target.value, 10);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages && e.key === 'Enter') {
      onPageChange(pageNumber);
    }
  }

  return (
    <div className="flex w-full md:flex-row items-center justify-between gap-4 py-4">
      {/* Pagination */}
      <div>
        <Pagination>
          <PaginationContent>
            {/* Previous page button */}
            <PaginationItem>
              <PaginationLink
                className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
                onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                aria-label={t('pagination.previousPage')}
                aria-disabled={currentPage === 1 ? true : undefined}
                role="button"
              >
                <PreviousIcon size={16} aria-hidden="true" />
              </PaginationLink>
            </PaginationItem>

            {/* Left ellipsis (...) */}
            {showLeftEllipsis && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {/* Page number links */}
            {pages.map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => onPageChange(page)}
                  isActive={page === currentPage}
                  role="button"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            {/* Right ellipsis (...) */}
            {showRightEllipsis && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {/* Next page button */}
            <PaginationItem>
              <PaginationLink
                className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
                onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                aria-label={t('pagination.nextPage')}
                aria-disabled={currentPage === totalPages ? true : undefined}
                role="button"
              >
                <NextIcon size={16} aria-hidden="true" />
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {/* Go to page input */}
      <div className="flex items-center gap-3">
        <Label htmlFor={id} className="whitespace-nowrap">
          {t('pagination.goToPage')}
        </Label>
        <Input
          id={id}
          type="text"
          className="w-14"
          defaultValue={String(currentPage)}
          onKeyDown={handlePageInputChange}
        />
      </div>
    </div>
  )
}