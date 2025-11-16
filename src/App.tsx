import { useState, useEffect, useRef } from 'react';
import { HaradaGrid } from './components/HaradaGrid';
import { GoalInput } from './components/GoalInput';
import { APIKeyModal } from './components/APIKeyModal';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useOpenAI } from './hooks/useOpenAI';
import type { HaradaGrid as HaradaGridType } from './types';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const OHTANI_TEMPLATE: HaradaGridType = {
  goal: "Get drafted 1st overall by 8 NPB teams",
  pillars: [
    {
      id: "pillar-0",
      title: "Body Care",
      tasks: [
        "Take Supplements",
        "Improve Body Flexibility",
        "Increase Stamina",
        "Set Clear Goals",
        "Thrive on Adversity",
        "Don't Make Waves",
        "Control Emotions",
        "Show Consideration"
      ]
    },
    {
      id: "pillar-1",
      title: "Control",
      tasks: [
        "Consistent Release Point",
        "Remove Insecurities",
        "Control Mental State",
        "Maintain Focus",
        "Stay Composed",
        "Trust the Process",
        "Execute Fundamentals",
        "Adapt to Situations"
      ]
    },
    {
      id: "pillar-2",
      title: "Sharpness",
      tasks: [
        "Don't Overpower",
        "Lead with Lower Body",
        "Increase Ball Spin Rate",
        "Perfect Mechanics",
        "Develop Touch",
        "Fine-tune Delivery",
        "Quick Release",
        "Deceptive Motion"
      ]
    },
    {
      id: "pillar-3",
      title: "Speed 100mph",
      tasks: [
        "Core Strength Training",
        "Lower Body Power",
        "Shoulder Development",
        "Explosive Movements",
        "Flexibility Work",
        "Proper Mechanics",
        "Rest and Recovery",
        "Track Velocity"
      ]
    },
    {
      id: "pillar-4",
      title: "Pitch Variance",
      tasks: [
        "Range of Motion",
        "Practice Changeup",
        "Slow Curveball",
        "Develop Slider",
        "Command All Pitches",
        "Deception Drills",
        "Study Hitters",
        "Mix Effectively"
      ]
    },
    {
      id: "pillar-5",
      title: "Personality",
      tasks: [
        "Be Considerate to Teammates",
        "Show Likability",
        "Display Leadership",
        "Stay Humble",
        "Be Positive Energy",
        "Respect Everyone",
        "Build Relationships",
        "Communicate Well"
      ]
    },
    {
      id: "pillar-6",
      title: "Karma",
      tasks: [
        "Pick Up Trash",
        "Show Respect to Umpires",
        "Be Positive",
        "Help Teammates",
        "Give Back",
        "Show Gratitude",
        "Stay Humble",
        "Support Others"
      ]
    },
    {
      id: "pillar-7",
      title: "Mental Toughness",
      tasks: [
        "Don't Get Caught Up in the Flow",
        "Stay Calm Under Pressure",
        "Focus on Process",
        "Overcome Adversity",
        "Maintain Confidence",
        "Control Emotions",
        "Visualize Success",
        "Learn from Failure"
      ]
    }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function App() {
  const [gridData, setGridData] = useLocalStorage<HaradaGridType | null>('harada-grid', null);
  const [apiKey, setApiKey] = useLocalStorage('openai-api-key', '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);


  const { generationState, generateHaradaGrid } = useOpenAI();
  const isGenerating = generationState.status === 'generating-pillars' ||
                       generationState.status === 'generating-tasks';

  // Check if we have an API key on mount
  useEffect(() => {
    const envKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey && !envKey) {
      setIsModalOpen(true);
    }
  }, [apiKey]);

  // Show grid when we have data
  useEffect(() => {
    if (gridData) {
      setShowGrid(true);
    }
  }, [gridData]);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showExportMenu && !(e.target as Element).closest('.relative')) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showExportMenu]);

  const handleGoalSubmit = async (goal: string) => {
    const effectiveApiKey = apiKey || import.meta.env.VITE_OPENAI_API_KEY;

    if (!effectiveApiKey) {
      setIsModalOpen(true);
      return;
    }

    // Initialize grid with goal and 8 placeholder pillars (each with 8 empty tasks)
    const newGrid: HaradaGridType = {
      goal,
      pillars: Array(8).fill(null).map((_, index) => ({
        id: `pillar-${index}`,
        title: '', // Will be filled by AI
        tasks: Array(8).fill(''), // 8 empty task slots
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setGridData(newGrid);
    setShowGrid(true);

    // Generate pillars and tasks
    await generateHaradaGrid(
      goal,
      effectiveApiKey,
      (pillarTitle, pillarIndex) => {
        // Update grid as pillars are generated
        setGridData((prev) => {
          if (!prev) return prev;
          const updatedPillars = [...prev.pillars];
          // Preserve the existing tasks array (8 empty strings)
          updatedPillars[pillarIndex] = {
            ...updatedPillars[pillarIndex],
            title: pillarTitle,
          };
          return { ...prev, pillars: updatedPillars, updatedAt: new Date().toISOString() };
        });
      },
      (task, pillarIndex, taskIndex) => {
        // Update grid as tasks are generated
        setGridData((prev) => {
          if (!prev) return prev;
          const updatedPillars = [...prev.pillars];
          if (!updatedPillars[pillarIndex]) return prev;
          if (!updatedPillars[pillarIndex].tasks) {
            updatedPillars[pillarIndex].tasks = [];
          }
          updatedPillars[pillarIndex].tasks[taskIndex] = task;
          return { ...prev, pillars: updatedPillars, updatedAt: new Date().toISOString() };
        });
      },
      () => {
        // Generation complete - grid is already fully updated from streaming callbacks
      }
    );
  };

  const handleCellUpdate = (pillarIndex: number, taskIndex: number | null, newContent: string) => {
    setGridData((prev) => {
      if (!prev) return prev;
      const updatedPillars = [...prev.pillars];

      if (taskIndex === null) {
        // Update pillar title
        updatedPillars[pillarIndex] = {
          ...updatedPillars[pillarIndex],
          title: newContent,
        };
      } else {
        // Update task
        const updatedTasks = [...updatedPillars[pillarIndex].tasks];
        updatedTasks[taskIndex] = newContent;
        updatedPillars[pillarIndex] = {
          ...updatedPillars[pillarIndex],
          tasks: updatedTasks,
        };
      }

      return { ...prev, pillars: updatedPillars, updatedAt: new Date().toISOString() };
    });
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to start over? This will clear your current grid.')) {
      setGridData(null);
      setShowGrid(false);
    }
  };

  const handleLoadTemplate = () => {
    setGridData(OHTANI_TEMPLATE);
    setShowGrid(true);
  };

  const handleExportPNG = async () => {
    console.log('Export PNG clicked', { hasRef: !!gridRef.current, hasData: !!gridData });

    if (!gridRef.current || !gridData) {
      console.error('Missing ref or data', { ref: !!gridRef.current, data: !!gridData });
      alert('Cannot export: Grid not ready. Please try again.');
      return;
    }

    try {
      setIsExporting(true);
      setShowExportMenu(false);

      // Wait for watermark to render
      await new Promise(resolve => setTimeout(resolve, 100));

      // Add temporary style to override oklch colors with standard RGB
      const styleEl = document.createElement('style');
      styleEl.id = 'export-color-override';
      styleEl.textContent = `
        * {
          color: rgb(17, 24, 39) !important;
        }
        .bg-gradient-to-br { background: rgb(249, 250, 251) !important; }
        .bg-white { background: rgb(255, 255, 255) !important; }
        .bg-gray-50 { background: rgb(249, 250, 251) !important; }
        .bg-gray-100 { background: rgb(243, 244, 246) !important; }
        .bg-gray-200 { background: rgb(229, 231, 235) !important; }
        .bg-gray-300 { background: rgb(209, 213, 219) !important; }
        .bg-gray-400 { background: rgb(156, 163, 175) !important; }
        .bg-gray-500 { background: rgb(107, 114, 128) !important; }
        .bg-gray-700 { background: rgb(55, 65, 81) !important; }
        .bg-blue-50 { background: rgb(239, 246, 255) !important; }
        .text-gray-400 { color: rgb(156, 163, 175) !important; }
        .text-gray-500 { color: rgb(107, 114, 128) !important; }
        .text-gray-600 { color: rgb(75, 85, 99) !important; }
        .text-gray-700 { color: rgb(55, 65, 81) !important; }
        .text-gray-900 { color: rgb(17, 24, 39) !important; }
        .text-blue-800 { color: rgb(30, 64, 175) !important; }
        .text-blue-900 { color: rgb(30, 58, 138) !important; }
        .border-gray-200 { border-color: rgb(229, 231, 235) !important; }
        .border-gray-300 { border-color: rgb(209, 213, 219) !important; }
        .border-gray-500 { border-color: rgb(107, 114, 128) !important; }
        .border-gray-700 { border-color: rgb(55, 65, 81) !important; }
        .border-blue-200 { border-color: rgb(191, 219, 254) !important; }
        .grid-cell-center { background-color: #FFEB3B !important; }
        .grid-cell-pillar { background-color: rgb(209, 213, 219) !important; }
        .grid-cell-task { background-color: rgb(255, 255, 255) !important; }
      `;
      document.head.appendChild(styleEl);

      console.log('Starting html2canvas...');
      const canvas = await html2canvas(gridRef.current, {
        scale: 2,
        backgroundColor: '#f9fafb',
        logging: false,
        useCORS: true,
        allowTaint: true,
      });

      // Remove temporary style
      styleEl.remove();

      console.log('Canvas created, downloading...');
      const link = document.createElement('a');
      link.download = `harada-method-${gridData.goal.slice(0, 30).replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      console.log('PNG export complete!');
    } catch (error) {
      console.error('Error exporting PNG:', error);
      // Clean up style if error occurs
      document.getElementById('export-color-override')?.remove();
      alert(`Failed to export as PNG: ${(error as Error).message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    console.log('Export PDF clicked', { hasRef: !!gridRef.current, hasData: !!gridData });

    if (!gridRef.current || !gridData) {
      console.error('Missing ref or data', { ref: !!gridRef.current, data: !!gridData });
      alert('Cannot export: Grid not ready. Please try again.');
      return;
    }

    try {
      setIsExporting(true);
      setShowExportMenu(false);

      // Wait for watermark to render
      await new Promise(resolve => setTimeout(resolve, 100));

      // Add temporary style to override oklch colors with standard RGB
      const styleEl = document.createElement('style');
      styleEl.id = 'export-color-override';
      styleEl.textContent = `
        * {
          color: rgb(17, 24, 39) !important;
        }
        .bg-gradient-to-br { background: rgb(249, 250, 251) !important; }
        .bg-white { background: rgb(255, 255, 255) !important; }
        .bg-gray-50 { background: rgb(249, 250, 251) !important; }
        .bg-gray-100 { background: rgb(243, 244, 246) !important; }
        .bg-gray-200 { background: rgb(229, 231, 235) !important; }
        .bg-gray-300 { background: rgb(209, 213, 219) !important; }
        .bg-gray-400 { background: rgb(156, 163, 175) !important; }
        .bg-gray-500 { background: rgb(107, 114, 128) !important; }
        .bg-gray-700 { background: rgb(55, 65, 81) !important; }
        .bg-blue-50 { background: rgb(239, 246, 255) !important; }
        .text-gray-400 { color: rgb(156, 163, 175) !important; }
        .text-gray-500 { color: rgb(107, 114, 128) !important; }
        .text-gray-600 { color: rgb(75, 85, 99) !important; }
        .text-gray-700 { color: rgb(55, 65, 81) !important; }
        .text-gray-900 { color: rgb(17, 24, 39) !important; }
        .text-blue-800 { color: rgb(30, 64, 175) !important; }
        .text-blue-900 { color: rgb(30, 58, 138) !important; }
        .border-gray-200 { border-color: rgb(229, 231, 235) !important; }
        .border-gray-300 { border-color: rgb(209, 213, 219) !important; }
        .border-gray-500 { border-color: rgb(107, 114, 128) !important; }
        .border-gray-700 { border-color: rgb(55, 65, 81) !important; }
        .border-blue-200 { border-color: rgb(191, 219, 254) !important; }
        .grid-cell-center { background-color: #FFEB3B !important; }
        .grid-cell-pillar { background-color: rgb(209, 213, 219) !important; }
        .grid-cell-task { background-color: rgb(255, 255, 255) !important; }
      `;
      document.head.appendChild(styleEl);

      console.log('Starting html2canvas...');
      const canvas = await html2canvas(gridRef.current, {
        scale: 2,
        backgroundColor: '#f9fafb',
        logging: false,
        useCORS: true,
        allowTaint: true,
      });

      // Remove temporary style
      styleEl.remove();

      console.log('Canvas created, generating PDF...');
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF({
        orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

      const finalWidth = imgWidth * ratio;
      const finalHeight = imgHeight * ratio;
      const x = (pdfWidth - finalWidth) / 2;
      const y = (pdfHeight - finalHeight) / 2;

      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', x, y, finalWidth, finalHeight);
      pdf.save(`harada-method-${gridData.goal.slice(0, 30).replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${Date.now()}.pdf`);
      console.log('PDF export complete!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      // Clean up style if error occurs
      document.getElementById('export-color-override')?.remove();
      alert(`Failed to export as PDF: ${(error as Error).message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Harada Method AI
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            Transform your dreams into actionable daily habits with the same framework
            Shohei Ohtani used to become a baseball superstar.
          </p>

          {/* Action buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              ⚙️ API Settings
            </button>
            {gridData && (
              <>
                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-1"
                  >
                    📥 Export Grid
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showExportMenu && (
                    <div className="absolute top-full mt-1 left-0 bg-white border border-gray-300 rounded-md shadow-lg z-10 min-w-[150px]">
                      <button
                        onClick={handleExportPNG}
                        className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <span>🖼️</span> Export as PNG
                      </button>
                      <button
                        onClick={handleExportPDF}
                        className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-t border-gray-200"
                      >
                        <span>📄</span> Export as PDF
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-md hover:bg-red-50 transition-colors"
                >
                  🔄 Start Over
                </button>
              </>
            )}
            {!gridData && (
              <button
                onClick={handleLoadTemplate}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
              >
                ⭐ Load Ohtani's Example
              </button>
            )}
          </div>
        </motion.header>

        {/* Goal Input */}
        {!showGrid && (
          <GoalInput onSubmit={handleGoalSubmit} isGenerating={isGenerating} />
        )}

        {/* Generation Status */}
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mb-8"
          >
            <p className="text-lg text-gray-600">
              {generationState.status === 'generating-pillars' && '🎯 Generating your 8 supporting pillars...'}
              {generationState.status === 'generating-tasks' &&
                `✨ Creating actionable tasks for pillar ${generationState.currentPillarIndex + 1}/8...`}
            </p>
          </motion.div>
        )}

        {/* Grid Display */}
        {showGrid && gridData && (
          <motion.div
            ref={gridRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <HaradaGrid gridData={gridData} onCellUpdate={handleCellUpdate} />

            {/* Watermark (only visible during export) */}
            {isExporting && (
              <div className="mt-4 text-center text-xs text-gray-400 border-t border-gray-200 pt-4">
                <p>Generated with Harada Method AI • {new Date().toLocaleDateString()}</p>
                <p className="mt-1">x.com/abhiondemand</p>
              </div>
            )}

            {/* Instructions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-8 max-w-3xl mx-auto bg-blue-50 border border-blue-200 rounded-lg p-6"
            >
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                💡 How to use your Harada Method grid:
              </h3>
              <ul className="space-y-2 text-blue-800">
                <li>• <strong>Double-click</strong> any pillar or task to edit it</li>
                <li>• <strong>Click pillar names</strong> in the center to jump to their section</li>
                <li>• The center shows your main goal surrounded by 8 pillars</li>
                <li>• Each outer section shows a pillar with its 8 daily tasks</li>
                <li>• Export as PDF or PNG to print or share your grid</li>
              </ul>
            </motion.div>
          </motion.div>
        )}

        {/* API Key Modal */}
        <APIKeyModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={(key, useDefault) => {
            if (!useDefault) {
              setApiKey(key);
            }
          }}
          currentKey={apiKey}
        />
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-16 pb-8 text-sm text-gray-500"
      >
        <p>Inspired by Shohei Ohtani's success with the Harada Method</p>
        <p className="mt-2">Built with ❤️ using React, Tailwind CSS, and OpenAI</p>
        <p className="mt-2 text-xs text-gray-400">
          Created by{' '}
          <a
            href="https://x.com/abhiondemand"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-600 transition-colors underline decoration-dotted"
          >
            @abhiondemand
          </a>
        </p>
      </motion.footer>
    </div>
  );
}

export default App;
