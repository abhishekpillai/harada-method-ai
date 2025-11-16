import React, { useRef } from 'react';
import { GridCell } from './GridCell';
import type { HaradaGrid as HaradaGridType } from '../types';

interface HaradaGridProps {
  gridData: HaradaGridType;
  onCellUpdate?: (pillarIndex: number, taskIndex: number | null, newContent: string) => void;
}

export function HaradaGrid({ gridData, onCellUpdate }: HaradaGridProps) {
  const { goal, pillars } = gridData;
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Calculate animation delays for ripple effect
  const getPillarDelay = (pillarIndex: number) => 0.2 + pillarIndex * 0.15;
  const getTaskDelay = (pillarIndex: number, taskIndex: number) =>
    getPillarDelay(pillarIndex) + 0.3 + taskIndex * 0.1;

  // Map pillar indices to their positions in the center 3x3 section
  const centerPillarPositions = [
    { row: 3, col: 3 }, // Pillar 0 - top-left of center
    { row: 3, col: 4 }, // Pillar 1 - top-center of center
    { row: 3, col: 5 }, // Pillar 2 - top-right of center
    { row: 4, col: 3 }, // Pillar 3 - middle-left of center
    { row: 4, col: 5 }, // Pillar 4 - middle-right of center
    { row: 5, col: 3 }, // Pillar 5 - bottom-left of center
    { row: 5, col: 4 }, // Pillar 6 - bottom-center of center
    { row: 5, col: 5 }, // Pillar 7 - bottom-right of center
  ];

  // Map pillar indices to their section centers (where pillar name appears with 8 tasks around it)
  const sectionCenters = [
    { row: 1, col: 1, sectionRow: 0, sectionCol: 0 },   // Pillar 0 - top-left section
    { row: 1, col: 4, sectionRow: 0, sectionCol: 1 },   // Pillar 1 - top-center section
    { row: 1, col: 7, sectionRow: 0, sectionCol: 2 },   // Pillar 2 - top-right section
    { row: 4, col: 1, sectionRow: 1, sectionCol: 0 },   // Pillar 3 - middle-left section
    { row: 4, col: 7, sectionRow: 1, sectionCol: 2 },   // Pillar 4 - middle-right section
    { row: 7, col: 1, sectionRow: 2, sectionCol: 0 },   // Pillar 5 - bottom-left section
    { row: 7, col: 4, sectionRow: 2, sectionCol: 1 },   // Pillar 6 - bottom-center section
    { row: 7, col: 7, sectionRow: 2, sectionCol: 2 },   // Pillar 7 - bottom-right section
  ];

  // Get the 8 positions around a center point
  const getSurroundingPositions = (centerRow: number, centerCol: number) => [
    { row: centerRow - 1, col: centerCol - 1 }, // top-left
    { row: centerRow - 1, col: centerCol },     // top
    { row: centerRow - 1, col: centerCol + 1 }, // top-right
    { row: centerRow, col: centerCol - 1 },     // left
    { row: centerRow, col: centerCol + 1 },     // right
    { row: centerRow + 1, col: centerCol - 1 }, // bottom-left
    { row: centerRow + 1, col: centerCol },     // bottom
    { row: centerRow + 1, col: centerCol + 1 }, // bottom-right
  ];

  // Handle clicking a pillar name in the center section
  const handlePillarClick = (pillarIndex: number) => {
    const section = sectionRefs.current[pillarIndex];
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add temporary highlight
      section.classList.add('section-highlight');
      setTimeout(() => section.classList.remove('section-highlight'), 2000);
    }
  };

  // Build the 9x9 grid
  const renderGrid = () => {
    const grid: (React.ReactElement | null)[][] = Array(9)
      .fill(null)
      .map(() => Array(9).fill(null));

    // Place center goal at (4,4)
    grid[4][4] = (
      <GridCell
        key="center-goal"
        content={goal}
        type="center"
        delay={0}
        isEditable={false}
      />
    );

    // Place pillar names in the center 3x3 section (around the goal)
    pillars.forEach((pillar, pillarIndex) => {
      const centerPos = centerPillarPositions[pillarIndex];
      grid[centerPos.row][centerPos.col] = (
        <GridCell
          key={`center-pillar-${pillarIndex}`}
          content={pillar.title}
          type="pillar"
          delay={getPillarDelay(pillarIndex)}
          isEditable={true}
          onContentChange={(newContent) => onCellUpdate?.(pillarIndex, null, newContent)}
          onClick={() => handlePillarClick(pillarIndex)}
          className="cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all"
        />
      );

      // Place pillar name at its section center with tasks around it
      const sectionCenter = sectionCenters[pillarIndex];
      grid[sectionCenter.row][sectionCenter.col] = (
        <GridCell
          key={`section-pillar-${pillarIndex}`}
          content={pillar.title}
          type="pillar"
          delay={getPillarDelay(pillarIndex)}
          isEditable={false}
        />
      );

      // Place 8 tasks around the pillar in its section
      const taskPositions = getSurroundingPositions(sectionCenter.row, sectionCenter.col);
      pillar.tasks.slice(0, 8).forEach((task, taskIndex) => {
        const taskPos = taskPositions[taskIndex];
        grid[taskPos.row][taskPos.col] = (
          <GridCell
            key={`task-${pillarIndex}-${taskIndex}`}
            content={task}
            type="task"
            delay={getTaskDelay(pillarIndex, taskIndex)}
            isEditable={true}
            onContentChange={(newContent) =>
              onCellUpdate?.(pillarIndex, taskIndex, newContent)
            }
          />
        );
      });
    });

    // Fill any remaining empty cells (shouldn't be any in proper structure)
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (!grid[row][col]) {
          grid[row][col] = (
            <GridCell
              key={`empty-${row}-${col}`}
              content=""
              type="task"
              delay={0}
              isEditable={false}
            />
          );
        }
      }
    }

    return grid;
  };

  // Helper to determine if a cell is on a section boundary
  const getSectionBorderClasses = (row: number, col: number) => {
    const classes = [];
    // Right border at col 2, 5 (between sections)
    if (col === 2 || col === 5) classes.push('border-r-4 border-r-gray-700');
    // Bottom border at row 2, 5 (between sections)
    if (row === 2 || row === 5) classes.push('border-b-4 border-b-gray-700');
    return classes.join(' ');
  };

  // Helper to add section ref
  const getSectionRef = (row: number, col: number) => {
    const sectionRow = Math.floor(row / 3);
    const sectionCol = Math.floor(col / 3);

    // Skip center section (1,1)
    if (sectionRow === 1 && sectionCol === 1) return null;

    // Map section to pillar index
    const sectionToPillar: { [key: string]: number } = {
      '0-0': 0, '0-1': 1, '0-2': 2,
      '1-0': 3,           '1-2': 4,
      '2-0': 5, '2-1': 6, '2-2': 7,
    };
    const key = `${sectionRow}-${sectionCol}`;
    const pillarIndex = sectionToPillar[key];

    // Only set ref at section center
    const sectionCenter = sectionCenters[pillarIndex];
    if (sectionCenter && row === sectionCenter.row && col === sectionCenter.col) {
      return (el: HTMLDivElement | null) => {
        sectionRefs.current[pillarIndex] = el;
      };
    }

    return null;
  };

  const gridCells = renderGrid();

  return (
    <div className="w-full max-w-7xl mx-auto p-2 sm:p-4">
      {/* Mobile: Horizontal scroll container */}
      <div className="overflow-x-auto overflow-y-auto -mx-2 sm:mx-0">
        <div className="inline-block min-w-full sm:min-w-0">
          {/* Grid with minimum size for mobile */}
          <div
            className="grid grid-cols-9 gap-0 border-4 border-gray-700 bg-white shadow-2xl mx-auto"
            style={{ minWidth: '640px', maxWidth: '100%' }}
          >
            {gridCells.flat().map((cell, index) => {
              const row = Math.floor(index / 9);
              const col = index % 9;
              const borderClasses = getSectionBorderClasses(row, col);
              const sectionRef = getSectionRef(row, col);

              return (
                <div
                  key={index}
                  ref={sectionRef}
                  className={`aspect-square ${borderClasses}`}
                >
                  {cell}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile scroll hint */}
      <div className="text-center mt-2 text-xs text-gray-500 sm:hidden">
        ← Swipe to explore the grid →
      </div>
    </div>
  );
}
