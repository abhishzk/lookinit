'use client';

import { useState } from 'react';

export function useModelSelection() {
  const [selectedMentionTool, setSelectedMentionTool] = useState<string | null>(null);
  const [selectedMentionToolLogo, setSelectedMentionToolLogo] = useState<string | null>(null);
  const [showRAG, setShowRAG] = useState(false);

  const handleModelSelect = (toolId: string, toolLogo: string, enableRAG: boolean) => {
    setSelectedMentionTool(toolId);
    setSelectedMentionToolLogo(toolLogo);
    if (enableRAG) {
      setShowRAG(true);
    }
  };

  const clearSelection = () => {
    setSelectedMentionTool(null);
    setSelectedMentionToolLogo(null);
    setShowRAG(false);
  };

  return {
    selectedMentionTool,
    selectedMentionToolLogo,
    showRAG,
    handleModelSelect,
    clearSelection,
    setShowRAG
  };
}