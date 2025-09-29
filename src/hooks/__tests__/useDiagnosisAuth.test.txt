// Tests for useDiagnosisAuth hook

import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { useDiagnosisAuth } from '../useDiagnosisAuth';

// Mock dependencies
const mockNavigate = vi.fn();
const mockLocation = { pathname: '/diagnosis', search: '' };

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
  };
});

vi.mock('../useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
    loading: false,
    isAuthenticated: true,
  }),
}));

vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Wrapper component for React Router
const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('useDiagnosisAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useDiagnosisAuth(), {
      wrapper: RouterWrapper,
    });

    expect(result.current.state.isAuthenticated).toBe(true);
    expect(result.current.state.canAccessDiagnosis).toBe(true);
    expect(result.current.state.hasActiveSession).toBe(false);
    expect(result.current.state.lastDiagnosisAccess).toBeNull();
  });

  it('should detect active session from localStorage', () => {
    localStorage.setItem('diagnosis_session_id', 'test-session-id');
    localStorage.setItem('diagnosis_last_access', '2025-08-31T10:00:00.000Z');

    const { result } = renderHook(() => useDiagnosisAuth(), {
      wrapper: RouterWrapper,
    });

    expect(result.current.state.hasActiveSession).toBe(true);
    expect(result.current.state.lastDiagnosisAccess).toBeInstanceOf(Date);
  });

  it('should require authentication successfully for authenticated user', () => {
    const { result } = renderHook(() => useDiagnosisAuth(), {
      wrapper: RouterWrapper,
    });

    const hasAccess = result.current.actions.requireAuth();
    expect(hasAccess).toBe(true);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should redirect to dashboard', () => {
    const { result } = renderHook(() => useDiagnosisAuth(), {
      wrapper: RouterWrapper,
    });

    act(() => {
      result.current.actions.redirectToDashboard();
    });

    expect(mockNavigate).toHaveBeenCalledWith('/diagnosis');
  });

  it('should redirect to chat', () => {
    const { result } = renderHook(() => useDiagnosisAuth(), {
      wrapper: RouterWrapper,
    });

    act(() => {
      result.current.actions.redirectToChat();
    });

    expect(mockNavigate).toHaveBeenCalledWith('/diagnosis/chat');
  });

  it('should redirect to chat with session ID', () => {
    const { result } = renderHook(() => useDiagnosisAuth(), {
      wrapper: RouterWrapper,
    });

    act(() => {
      result.current.actions.redirectToChat('test-session-123');
    });

    expect(mockNavigate).toHaveBeenCalledWith('/diagnosis/chat?session=test-session-123');
  });

  it('should redirect to reports', () => {
    const { result } = renderHook(() => useDiagnosisAuth(), {
      wrapper: RouterWrapper,
    });

    act(() => {
      result.current.actions.redirectToReports();
    });

    expect(mockNavigate).toHaveBeenCalledWith('/diagnosis/reports');
  });

  it('should clear diagnosis session', () => {
    localStorage.setItem('diagnosis_session_id', 'test-session-id');
    localStorage.setItem('diagnosis_last_access', '2025-08-31T10:00:00.000Z');

    const { result } = renderHook(() => useDiagnosisAuth(), {
      wrapper: RouterWrapper,
    });

    expect(result.current.state.hasActiveSession).toBe(true);

    act(() => {
      result.current.actions.clearDiagnosisSession();
    });

    expect(result.current.state.hasActiveSession).toBe(false);
    expect(localStorage.getItem('diagnosis_session_id')).toBeNull();
    expect(localStorage.getItem('diagnosis_last_access')).toBeNull();
  });

  it('should update last access timestamp', () => {
    const { result } = renderHook(() => useDiagnosisAuth(), {
      wrapper: RouterWrapper,
    });

    act(() => {
      result.current.actions.updateLastAccess();
    });

    expect(result.current.state.lastDiagnosisAccess).toBeInstanceOf(Date);
    expect(localStorage.getItem('diagnosis_last_access')).toBeTruthy();
  });

  it('should auto-clear old sessions after 24 hours', () => {
    // Set last access to 25 hours ago
    const oldDate = new Date(Date.now() - 25 * 60 * 60 * 1000);
    localStorage.setItem('diagnosis_session_id', 'test-session-id');
    localStorage.setItem('diagnosis_last_access', oldDate.toISOString());

    const { result } = renderHook(() => useDiagnosisAuth(), {
      wrapper: RouterWrapper,
    });

    // Wait for useEffect to run
    waitFor(() => {
      expect(result.current.state.hasActiveSession).toBe(false);
      expect(localStorage.getItem('diagnosis_session_id')).toBeNull();
    });
  });
});

describe('useDiagnosisAuth - Unauthenticated User', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should store return URL for post-login redirect', () => {
    const { result } = renderHook(() => useDiagnosisAuth(), {
      wrapper: RouterWrapper,
    });

    act(() => {
      result.current.actions.redirectToLogin('/diagnosis/reports');
    });

    expect(localStorage.getItem('diagnosis_return_url')).toBe('/diagnosis/reports');
    expect(mockNavigate).toHaveBeenCalledWith('/auth');
  });
});