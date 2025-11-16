import { useState, useCallback } from 'react';
import { createOpenAIClient, generatePillars, generateTasks } from '../lib/openai';
import type { Pillar, GenerationState } from '../types';

export function useOpenAI() {
  const [generationState, setGenerationState] = useState<GenerationState>({
    status: 'idle',
    currentPillarIndex: -1,
    currentTaskIndex: -1,
  });

  const generateHaradaGrid = useCallback(
    async (
      goal: string,
      apiKey: string,
      onPillarUpdate: (pillarTitle: string, pillarIndex: number) => void,
      onTaskUpdate: (task: string, pillarIndex: number, taskIndex: number) => void,
      onComplete: () => void
    ) => {
      try {
        setGenerationState({
          status: 'generating-pillars',
          currentPillarIndex: -1,
          currentTaskIndex: -1,
        });

        const client = createOpenAIClient(apiKey);
        const pillars: Pillar[] = [];

        // Step 1: Generate all 8 pillar titles
        await generatePillars(client, {
          goal,
          onPillarGenerated: (pillarTitle, pillarIndex) => {
            setGenerationState(prev => ({
              ...prev,
              currentPillarIndex: pillarIndex,
            }));
            onPillarUpdate(pillarTitle, pillarIndex);
            pillars.push({
              id: `pillar-${pillarIndex}`,
              title: pillarTitle,
              tasks: [],
            });
          },
          onComplete: async (pillarTitles) => {
            // Step 2: Generate tasks for each pillar
            setGenerationState({
              status: 'generating-tasks',
              currentPillarIndex: 0,
              currentTaskIndex: -1,
            });

            for (let i = 0; i < pillarTitles.length; i++) {
              await generateTasks(client, {
                goal,
                pillarTitle: pillarTitles[i],
                pillarIndex: i,
                onTaskGenerated: (task, pillarIdx, taskIdx) => {
                  setGenerationState({
                    status: 'generating-tasks',
                    currentPillarIndex: pillarIdx,
                    currentTaskIndex: taskIdx,
                  });
                  onTaskUpdate(task, pillarIdx, taskIdx);
                  pillars[pillarIdx].tasks.push(task);
                },
                onComplete: () => {
                  // Continue to next pillar
                },
                onError: (error) => {
                  console.error(`Error generating tasks for pillar ${i}:`, error);
                  setGenerationState({
                    status: 'error',
                    currentPillarIndex: i,
                    currentTaskIndex: -1,
                    error: error.message,
                  });
                },
              });
            }

            // All done!
            setGenerationState({
              status: 'completed',
              currentPillarIndex: -1,
              currentTaskIndex: -1,
            });

            onComplete();
          },
          onError: (error) => {
            console.error('Error generating pillars:', error);
            setGenerationState({
              status: 'error',
              currentPillarIndex: -1,
              currentTaskIndex: -1,
              error: error.message,
            });
          },
        });
      } catch (error) {
        console.error('Error in generateHaradaGrid:', error);
        setGenerationState({
          status: 'error',
          currentPillarIndex: -1,
          currentTaskIndex: -1,
          error: (error as Error).message,
        });
      }
    },
    []
  );

  return {
    generationState,
    generateHaradaGrid,
  };
}
