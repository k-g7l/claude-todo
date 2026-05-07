import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FilterTabs from '@/components/FilterTabs';

describe('FilterTabs', () => {
  it('renders All, Active, Completed tabs', () => {
    render(<FilterTabs current="all" onChange={() => {}} />);
    expect(screen.getByRole('tab', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Active' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Completed' })).toBeInTheDocument();
  });

  it('marks the current tab as selected', () => {
    render(<FilterTabs current="active" onChange={() => {}} />);
    expect(screen.getByRole('tab', { name: 'Active' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'All' })).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onChange with the correct filter when a tab is clicked', () => {
    const onChange = jest.fn();
    render(<FilterTabs current="all" onChange={onChange} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Completed' }));
    expect(onChange).toHaveBeenCalledWith('completed');
  });
});
