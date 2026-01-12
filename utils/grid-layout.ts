/**
 * Grid Layout Utilities
 * Dynamic dot sizing algorithm for the Stoic Grid
 *
 * Core Principle: 1 dot = 1 day, always
 * The grid must ALWAYS fit its container without scrolling
 */

import { Layout } from '@/constants/theme';

export interface GridLayout {
  /**
   * Number of columns in the grid
   */
  columns: number;

  /**
   * Number of rows in the grid
   */
  rows: number;

  /**
   * Size of each dot (diameter in pixels)
   */
  dotSize: number;

  /**
   * Horizontal spacing between dots (in pixels)
   */
  spacingHorizontal: number;

  /**
   * Vertical spacing between dots (in pixels)
   */
  spacingVertical: number;

  /**
   * Total width required for the grid
   */
  gridWidth: number;

  /**
   * Total height required for the grid
   */
  gridHeight: number;
}

/**
 * Calculate optimal grid layout for a given number of dots and container size
 *
 * Algorithm:
 * 1. Determine optimal number of columns (prefer 15-20 for readability)
 * 2. Calculate number of rows based on total dots
 * 3. Calculate maximum dot size that fits both width and height
 * 4. Apply spacing (10-15% of dot size)
 * 5. Ensure grid fits perfectly in container
 *
 * @param totalDots - Total number of dots to display (365 for year, 7 for week, etc.)
 * @param containerWidth - Available width in pixels
 * @param containerHeight - Available height in pixels
 * @returns Grid layout configuration
 */
export function calculateGridLayout(
  totalDots: number,
  containerWidth: number,
  containerHeight: number
): GridLayout {
  if (totalDots <= 0 || containerWidth <= 0 || containerHeight <= 0) {
    return {
      columns: 0,
      rows: 0,
      dotSize: 0,
      spacingHorizontal: 0,
      spacingVertical: 0,
      gridWidth: 0,
      gridHeight: 0,
    };
  }

  // Step 1: Determine optimal columns
  // Optimized for Manus.ai MVP style (16 columns)
  // Reference: Wide horizontal spacing, tight vertical spacing
  let optimalColumns: number;

  if (totalDots <= 7) {
    // Week: single row
    optimalColumns = totalDots;
  } else if (totalDots <= 49) {
    // Small grids: 7 columns (week-like layout)
    optimalColumns = 7;
  } else if (totalDots <= 100) {
    // Medium grids: 10 columns
    optimalColumns = 10;
  } else {
    // Large grids (e.g., 365 days): 16 columns (Manus.ai MVP style)
    // 365 days ÷ 16 columns ≈ 23 rows
    const aspectRatio = containerWidth / containerHeight;
    if (aspectRatio > 1.5) {
      // Wide container (landscape): more columns
      optimalColumns = 18;
    } else {
      // Portrait mode (default): 16 columns
      optimalColumns = 16;
    }
  }

  // Step 2: Calculate rows
  const rows = Math.ceil(totalDots / optimalColumns);

  // Step 3: Calculate maximum dot size with asymmetric spacing
  // Horizontal spacing: wider gaps (25%)
  // Vertical spacing: tighter gaps (8%)
  // Formula: (columns * dotSize) + ((columns - 1) * horizontalSpacing) = containerWidth
  //          (rows * dotSize) + ((rows - 1) * verticalSpacing) = containerHeight

  const horizontalSpacingRatio = Layout.dotSpacingRatioHorizontal;
  const verticalSpacingRatio = Layout.dotSpacingRatioVertical;

  const maxDotSizeFromWidth =
    containerWidth / (optimalColumns + (optimalColumns - 1) * horizontalSpacingRatio);

  const maxDotSizeFromHeight =
    containerHeight / (rows + (rows - 1) * verticalSpacingRatio);

  // Use the smaller of the two to ensure fit in both dimensions
  let dotSize = Math.min(maxDotSizeFromWidth, maxDotSizeFromHeight);

  // Step 4: Clamp dot size to reasonable bounds
  dotSize = Math.max(Layout.minDotSize, Math.min(Layout.maxDotSize, dotSize));

  // Step 5: Calculate asymmetric spacing
  const spacingHorizontal = dotSize * horizontalSpacingRatio;
  const spacingVertical = dotSize * verticalSpacingRatio;

  // Step 6: Calculate actual grid dimensions
  const gridWidth = optimalColumns * dotSize + (optimalColumns - 1) * spacingHorizontal;
  const gridHeight = rows * dotSize + (rows - 1) * spacingVertical;

  return {
    columns: optimalColumns,
    rows,
    dotSize: Math.floor(dotSize), // Round down for crisp pixels
    spacingHorizontal: Math.floor(spacingHorizontal),
    spacingVertical: Math.floor(spacingVertical),
    gridWidth: Math.floor(gridWidth),
    gridHeight: Math.floor(gridHeight),
  };
}

/**
 * Calculate the position (x, y) of a dot in the grid
 *
 * @param index - Dot index (0-based)
 * @param layout - Grid layout configuration
 * @returns { x, y } position in pixels from top-left of grid
 */
export function getDotPosition(
  index: number,
  layout: GridLayout
): { x: number; y: number } {
  const row = Math.floor(index / layout.columns);
  const col = index % layout.columns;

  const x = col * (layout.dotSize + layout.spacingHorizontal);
  const y = row * (layout.dotSize + layout.spacingVertical);

  return { x, y };
}

/**
 * Calculate grid centering offset to center the grid in its container
 *
 * @param gridWidth - Actual grid width
 * @param gridHeight - Actual grid height
 * @param containerWidth - Container width
 * @param containerHeight - Container height
 * @returns { offsetX, offsetY } to center the grid
 */
export function calculateGridCenterOffset(
  gridWidth: number,
  gridHeight: number,
  containerWidth: number,
  containerHeight: number
): { offsetX: number; offsetY: number } {
  const offsetX = Math.max(0, (containerWidth - gridWidth) / 2);
  const offsetY = Math.max(0, (containerHeight - gridHeight) / 2);

  return {
    offsetX: Math.floor(offsetX),
    offsetY: Math.floor(offsetY),
  };
}

/**
 * Generate an array of dot positions for rendering
 * Useful for rendering large grids efficiently
 *
 * @param totalDots - Total number of dots
 * @param layout - Grid layout configuration
 * @returns Array of { x, y, index } positions
 */
export function generateDotPositions(
  totalDots: number,
  layout: GridLayout
): Array<{ x: number; y: number; index: number }> {
  const positions: Array<{ x: number; y: number; index: number }> = [];

  for (let i = 0; i < totalDots; i++) {
    const { x, y } = getDotPosition(i, layout);
    positions.push({ x, y, index: i });
  }

  return positions;
}

/**
 * Calculate optimal container height for a grid given a fixed width
 * Useful for determining how much space a grid needs
 *
 * @param totalDots - Total number of dots
 * @param containerWidth - Fixed container width
 * @returns Recommended container height
 */
export function calculateOptimalHeight(
  totalDots: number,
  containerWidth: number
): number {
  // Use a temporary large height to get the layout
  const tempLayout = calculateGridLayout(totalDots, containerWidth, 10000);
  return tempLayout.gridHeight;
}
