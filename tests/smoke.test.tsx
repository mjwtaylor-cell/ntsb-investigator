import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from '../src/App';

describe('Docket placeholder', () => {
  it('renders the shell chrome', () => {
    render(<App />);
    expect(screen.getByText('NTSB Investigator')).toBeTruthy();
    expect(screen.getByLabelText('Docket navigator')).toBeTruthy();
    expect(screen.getByLabelText('Findings board')).toBeTruthy();
    expect(screen.getByLabelText('FDR strip chart placeholder')).toBeTruthy();
  });
});
