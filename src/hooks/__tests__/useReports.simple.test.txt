// Simple test for useReports hook

import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useReports } from '../useReports';

// Mock all dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
    })),
  },
}));

vi.mock('@/services/storage.service', () => ({
  storageService: {
    uploadFile: vi.fn(),
    deleteFile: vi.fn(),
    getSignedUrl: vi.fn(),
  },
}));

vi.mock('@/services/pdf.service', () => ({
  pdfService: {
    generatePDF: vi.fn(),
  },
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'test-user', email: 'test@example.com' },
    loading: false,
    signOut: vi.fn(),
  })),
}));

vi.mock('@/components/ui/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
  })),
}));

describe('useReports - Simple Tests', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useReports());

    expect(result.current.state.reports).toEqual([]);
    expect(result.current.state.isCreating).toBe(false);
    expect(result.current.state.isDeleting).toBe(false);
    expect(result.current.state.totalCount).toBe(0);
    expect(result.current.state.hasMore).toBe(false);
    // Note: isLoading might be true initially due to auto-fetch on mount
  });

  it('should provide required actions', () => {
    const { result } = renderHook(() => useReports());

    expect(typeof result.current.actions.fetchReports).toBe('function');
    expect(typeof result.current.actions.createReport).toBe('function');
    expect(typeof result.current.actions.deleteReport).toBe('function');
  });
});