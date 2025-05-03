import { render, screen } from '@testing-library/react';
import Home from './components/Home/Home';

test('renders home component with header', () => {
  render(<Home />);
  const linkElement = screen.getByText(/Welcome to Smart Secretary System/i);
  expect(linkElement).toBeInTheDocument();
});
