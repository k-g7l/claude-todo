import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TodoForm from '@/components/TodoForm';

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

describe('TodoForm', () => {
  it('renders title input, date input, priority select, and submit button', () => {
    render(<TodoForm onAdded={() => {}} />);
    expect(screen.getByLabelText(/todo title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
  });

  it('calls POST /api/todos on submit and invokes onAdded', async () => {
    const onAdded = jest.fn();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, title: 'Test', priority: 'medium', completed: false }),
    });

    render(<TodoForm onAdded={onAdded} />);
    fireEvent.change(screen.getByLabelText(/todo title/i), { target: { value: 'Test task' } });
    fireEvent.click(screen.getByRole('button', { name: /add/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/todos',
        expect.objectContaining({ method: 'POST' })
      );
      expect(onAdded).toHaveBeenCalled();
    });
  });

  it('disables submit button when title is empty', () => {
    render(<TodoForm onAdded={() => {}} />);
    expect(screen.getByRole('button', { name: /add/i })).toBeDisabled();
  });

  it('shows error when POST fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'title is required' }),
    });

    render(<TodoForm onAdded={() => {}} />);
    fireEvent.change(screen.getByLabelText(/todo title/i), { target: { value: 'x' } });
    fireEvent.click(screen.getByRole('button', { name: /add/i }));

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    });
  });
});
