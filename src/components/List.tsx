import {
  Fragment,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
  memo
} from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Cat } from '@/types';
import { cn } from '@/lib/utils';

interface ListProps {
  items: Cat[];
  renderItem: (item: Cat) => ReactNode;
  className?: string;
  'aria-label'?: string;
}

const useResponsiveColumns = () => {
  const [columns, setColumns] = useState(() => {
    if (typeof window === 'undefined') return 4;
    return getColumnCount(window.innerWidth);
  });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    function updateColumns() {
      setColumns(getColumnCount(window.innerWidth));
    }

    function handleResize() {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateColumns, 100);
    }

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return columns;
};

const getColumnCount = (width: number): number => {
  if (width < 640) return 1; // mobile
  if (width < 1024) return 2; // tablet
  return 4; // desktop
};

const ROW_GAP = 16; // 1rem in pixels
const COL_GAP = 16;

const List = memo(
  ({ items, renderItem, className, 'aria-label': ariaLabel }: ListProps) => {
    const parentRef = useRef<HTMLDivElement>(null);
    const columns = useResponsiveColumns();
    const rowCount = Math.ceil(items.length / columns);

    const rowVirtualizer = useVirtualizer({
      count: rowCount,
      getScrollElement: () => parentRef.current?.parentElement || null,
      estimateSize: () => 320 + ROW_GAP,
      overscan: 4
    });

    const renderedRows = useMemo(() => {
      return rowVirtualizer.getVirtualItems().map((virtualRow) => {
        const rowIndex = virtualRow.index;
        const start = rowIndex * columns;
        const end = Math.min(start + columns, items.length);

        return (
          <Fragment key={virtualRow.key}>
            {Array.from({ length: columns }).map((_, colIdx) => {
              const itemIdx = start + colIdx;
              if (itemIdx >= end) return null;

              const item = items[itemIdx];
              if (!item) return null;

              return (
                <div
                  key={`${rowIndex}-${colIdx}`}
                  className="min-h-[320px] transform-gpu"
                  style={{
                    gridRowStart: rowIndex + 1,
                    position: 'absolute',
                    top: virtualRow.start + ROW_GAP * rowIndex,
                    left: `calc(${(100 / columns) * colIdx}% + ${COL_GAP / 2}px)`,
                    width: `calc(${100 / columns}% - ${COL_GAP}px)`
                  }}
                  role="gridcell"
                  aria-rowindex={rowIndex + 1}
                  aria-colindex={colIdx + 1}
                >
                  {renderItem(item)}
                </div>
              );
            })}
          </Fragment>
        );
      });
    }, [rowVirtualizer.getVirtualItems(), columns, items, renderItem]);

    if (!items.length) {
      return (
        <div
          className="flex items-center justify-center p-8 text-gray-500"
          role="alert"
        >
          No items to display
        </div>
      );
    }

    const totalHeight =
      rowVirtualizer.getTotalSize() + (rowCount - 1) * ROW_GAP;

    return (
      <div
        ref={parentRef}
        className={cn('w-full', className)}
        style={{
          position: 'relative',
          minHeight: totalHeight,
          containIntrinsicSize: `auto ${totalHeight}px`,
          contain: 'layout paint'
        }}
        role="grid"
        aria-label={ariaLabel ?? 'List of items'}
        aria-rowcount={rowCount}
        aria-colcount={columns}
      >
        <div
          style={{
            height: totalHeight,
            position: 'relative'
          }}
        >
          {renderedRows}
        </div>
      </div>
    );
  }
);

List.displayName = 'List';

export default List;
