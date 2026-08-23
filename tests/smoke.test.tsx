import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { App } from '../src/App';
import { useCaseStore } from '../src/ui/store/caseStore';

describe('Docket UI', () => {
  beforeEach(() => {
    useCaseStore.setState({
      seed: null,
      bundle: null,
      state: null,
      selectedEvidenceId: null,
      selectedGroup: null,
      activeViewer: 'document',
      fdrCursorT: 0,
      rightRailOpen: false,
      drawerOpen: true,
      error: null,
      budgetTotal: 0,
    });
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders endless-mode seed entry', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Endless mode' })).toBeTruthy();
    expect(screen.getByLabelText('Seed')).toBeTruthy();
  });

  it('opens seed 1174 into the docket shell', () => {
    render(<App />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Play 1174' })[0]!);
    expect(useCaseStore.getState().seed).toBe('1174');
    expect(screen.getByLabelText('Docket navigator')).toBeTruthy();
    expect(screen.getByLabelText('Action drawer')).toBeTruthy();
    expect(screen.getByRole('tablist', { name: 'Viewers' })).toBeTruthy();
  });
});
