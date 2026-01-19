/**
 * useTimelineExport Hook
 * Manages timeline export state and orchestrates export flow
 */

import { useState, useRef, useCallback, RefObject } from 'react';
import { View } from 'react-native';
import { Timeline } from '@/types/timeline';
import { exportAndShareTimeline, ExportOptions } from '@/services/export-service';

/**
 * Hook return type
 */
export interface UseTimelineExportReturn {
  /**
   * Whether an export is currently in progress
   */
  isExporting: boolean;

  /**
   * Error message if export failed
   */
  error: string | null;

  /**
   * Ref to attach to the export canvas component
   */
  exportCanvasRef: RefObject<View>;

  /**
   * Trigger export and share for a timeline
   */
  exportAndShare: (timeline: Timeline, options?: ExportOptions) => Promise<void>;

  /**
   * Clear error state
   */
  clearError: () => void;
}

/**
 * Custom hook for timeline export functionality
 *
 * Usage:
 * ```tsx
 * const { exportAndShare, isExporting, exportCanvasRef } = useTimelineExport();
 *
 * // Render hidden export canvas
 * <ExportCanvas ref={exportCanvasRef} timeline={timeline} />
 *
 * // Trigger export
 * <Button onPress={() => exportAndShare(timeline)} />
 * ```
 */
export function useTimelineExport(): UseTimelineExportReturn {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const exportCanvasRef = useRef<View>(null);

  const exportAndShare = useCallback(
    async (timeline: Timeline, options: ExportOptions = {}) => {
      // Clear previous errors
      setError(null);

      // Set loading state
      setIsExporting(true);

      try {
        // Small delay to ensure canvas is fully rendered
        // This is especially important if the canvas is dynamically shown
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Execute export and share
        const success = await exportAndShareTimeline(
          exportCanvasRef,
          timeline,
          options
        );

        if (!success) {
          // Note: User cancellation is not an error
          // exportAndShareTimeline already handles error alerts
        }
      } catch (err) {
        console.error('Export hook error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isExporting,
    error,
    exportCanvasRef,
    exportAndShare,
    clearError,
  };
}
