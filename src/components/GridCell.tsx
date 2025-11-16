import { motion } from 'framer-motion';
import { useState } from 'react';

interface GridCellProps {
  content: string;
  type: 'center' | 'pillar' | 'task';
  isHighlighted?: boolean;
  isEditable?: boolean;
  delay?: number;
  onClick?: () => void;
  onContentChange?: (newContent: string) => void;
}

export function GridCell({
  content,
  type,
  isHighlighted = false,
  isEditable = false,
  delay = 0,
  onClick,
  onContentChange,
}: GridCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(content);

  const cellStyles = `grid-cell ${
    type === 'center'
      ? 'grid-cell-center'
      : type === 'pillar'
      ? 'grid-cell-pillar'
      : 'grid-cell-task'
  } ${isHighlighted ? 'grid-cell-highlighted' : ''}`;

  const handleDoubleClick = () => {
    if (isEditable && onContentChange) {
      setIsEditing(true);
      setEditValue(content);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (onContentChange && editValue.trim()) {
      onContentChange(editValue.trim());
    } else {
      setEditValue(content);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(content);
    }
  };

  return (
    <motion.div
      className={cellStyles}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.4,
        delay,
        ease: 'easeOut',
      }}
      onClick={onClick}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent text-center outline-none border-b-2 border-blue-500"
          autoFocus
        />
      ) : (
        <span className="break-words leading-tight">{content || '\u00A0'}</span>
      )}
    </motion.div>
  );
}
