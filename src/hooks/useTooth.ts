// src/hooks/useTooth.ts
import { useState } from 'react';

export const useTooth = (initialNumber: number) => {
  const [toothNumber, setToothNumber] = useState(initialNumber);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  const showTooltip = () => setIsTooltipVisible(true);
  const hideTooltip = () => setIsTooltipVisible(false);
  const toggleTooltip = () => setIsTooltipVisible(prev => !prev);

  return {
    toothNumber,
    isTooltipVisible,
    showTooltip,
    hideTooltip,
    toggleTooltip,
    setToothNumber,
  };
};