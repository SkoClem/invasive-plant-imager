import { render, screen } from '@testing-library/react';
import App from './App';

test('renders home hero title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Identify Invasive Plants Instantly/i);
  expect(titleElement).toBeInTheDocument();
});
