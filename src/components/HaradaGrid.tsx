import React from 'react';
import { GridCell } from './GridCell';
import type { HaradaGrid as HaradaGridType } from '../types';

interface HaradaGridProps {
  gridData: HaradaGridType;
  onCellUpdate?: (pillarIndex: number, taskIndex: number | null, newContent: string) => void;
}

export function HaradaGrid({ gridData, onCellUpdate }: HaradaGridProps) {
  const { goal, pillars } = gridData;

  // Calculate animation delays for ripple effect
  const getPillarDelay = (pillarIndex: number) => 0.2 + pillarIndex * 0.15;
  const getTaskDelay = (pillarIndex: number, taskIndex: number) =>
    getPillarDelay(pillarIndex) + 0.3 + taskIndex * 0.1;

  // Map pillar indices to grid positions (surrounding the center)
  const pillarPositions = [
    { row: 0, col: 3 }, // Top
    { row: 1, col: 5 }, // Top-right
    { row: 3, col: 7 }, // Right
    { row: 5, col: 6 }, // Bottom-right
    { row: 7, col: 4 }, // Bottom
    { row: 6, col: 2 }, // Bottom-left
    { row: 4, col: 0 }, // Left
    { row: 2, col: 1 }, // Top-left
  ];

  // Map tasks to grid positions (8 tasks per pillar, radiating outward)
  const getTaskPositions = (pillarIndex: number) => {
    const taskMaps = [
      // Pillar 0 (Top) tasks
      [
        { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 },
        { row: 0, col: 4 }, { row: 0, col: 5 }, { row: 0, col: 6 },
        { row: 0, col: 7 }, { row: 1, col: 3 },
      ],
      // Pillar 1 (Top-right) tasks
      [
        { row: 1, col: 6 }, { row: 1, col: 7 }, { row: 2, col: 7 },
        { row: 1, col: 4 }, { row: 2, col: 5 }, { row: 2, col: 6 },
        { row: 1, col: 2 }, { row: 2, col: 3 },
      ],
      // Pillar 2 (Right) tasks
      [
        { row: 3, col: 6 }, { row: 4, col: 7 }, { row: 5, col: 7 },
        { row: 2, col: 4 }, { row: 3, col: 5 }, { row: 4, col: 6 },
        { row: 3, col: 3 }, { row: 3, col: 4 },
      ],
      // Pillar 3 (Bottom-right) tasks
      [
        { row: 6, col: 7 }, { row: 7, col: 7 }, { row: 7, col: 6 },
        { row: 5, col: 5 }, { row: 6, col: 6 }, { row: 6, col: 5 },
        { row: 5, col: 3 }, { row: 5, col: 4 },
      ],
      // Pillar 4 (Bottom) tasks
      [
        { row: 7, col: 0 }, { row: 7, col: 1 }, { row: 7, col: 2 },
        { row: 7, col: 3 }, { row: 7, col: 5 }, { row: 6, col: 4 },
        { row: 6, col: 3 }, { row: 6, col: 1 },
      ],
      // Pillar 5 (Bottom-left) tasks
      [
        { row: 6, col: 0 }, { row: 5, col: 0 }, { row: 5, col: 1 },
        { row: 6, col: 3 }, { row: 5, col: 2 }, { row: 4, col: 1 },
        { row: 4, col: 3 }, { row: 4, col: 2 },
      ],
      // Pillar 6 (Left) tasks
      [
        { row: 4, col: 0 }, { row: 3, col: 0 }, { row: 2, col: 0 },
        { row: 4, col: 1 }, { row: 3, col: 1 }, { row: 3, col: 2 },
        { row: 2, col: 2 }, { row: 2, col: 3 },
      ],
      // Pillar 7 (Top-left) tasks
      [
        { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 2, col: 2 },
        { row: 2, col: 4 }, { row: 1, col: 2 }, { row: 1, col: 3 },
        { row: 1, col: 4 }, { row: 2, col: 3 },
      ],
    ];
    return taskMaps[pillarIndex] || [];
  };

  // Build the 8x8 grid
  const renderGrid = () => {
    const grid: (React.ReactElement | null)[][] = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));

    // Place center goal (roughly center position, spanning conceptually)
    // For visual purposes, center is at row 3-4, col 3-4
    // We'll use position row 3, col 3 as the "center"
    grid[3][3] = (
      <GridCell
        key="center"
        content={goal}
        type="center"
        delay={0}
        isEditable={false}
      />
    );

    // Place pillars
    pillars.forEach((pillar, pillarIndex) => {
      const pos = pillarPositions[pillarIndex];
      grid[pos.row][pos.col] = (
        <GridCell
          key={`pillar-${pillarIndex}`}
          content={pillar.title}
          type="pillar"
          delay={getPillarDelay(pillarIndex)}
          isEditable={true}
          onContentChange={(newContent) => onCellUpdate?.(pillarIndex, null, newContent)}
        />
      );

      // Place tasks for this pillar
      const taskPositions = getTaskPositions(pillarIndex);
      pillar.tasks.forEach((task, taskIndex) => {
        const taskPos = taskPositions[taskIndex];
        if (taskPos && !grid[taskPos.row][taskPos.col]) {
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
        }
      });
    });

    // Fill empty cells with placeholders
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
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

  const gridCells = renderGrid();

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="grid grid-cols-8 gap-0 border border-gray-500 bg-white shadow-2xl">
        {gridCells.flat().map((cell, index) => (
          <div key={index} className="aspect-square">
            {cell}
          </div>
        ))}
      </div>
    </div>
  );
}
