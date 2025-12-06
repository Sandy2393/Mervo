// Stub: AI Hook
export const useAI = () => {
  return {
    isLoading: false,
    analyze: async (text: string) => text,
    generateSummary: async (text: string) => text,
  };
};
