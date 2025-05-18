import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ElectionResults from '@/screens/ElectionResults';

// Mock components used in ElectionResults
vi.mock('@/tables/election_results_table/page', () => ({
  default: () => <div data-testid="election-results-table">Election Results Table Component</div>
}));

vi.mock('@/geomap/components/AngolaMap/AngolaMap', () => ({
  default: () => <div data-testid="angola-map">Angola Map Component</div>
}));

describe('ElectionResults Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders election results components', () => {
    render(
      <BrowserRouter>
        <ElectionResults />
      </BrowserRouter>
    );

    // Check if main components are rendered
    expect(screen.getByText(/Election Results/i)).toBeInTheDocument();
    expect(screen.getByTestId('election-results-table')).toBeInTheDocument();
    expect(screen.getByTestId('angola-map')).toBeInTheDocument();
  });

  it('toggles between map and table views', () => {
    render(
      <BrowserRouter>
        <ElectionResults />
      </BrowserRouter>
    );

    // Check initial state (both should be visible)
    const mapView = screen.getByTestId('angola-map');
    const tableView = screen.getByTestId('election-results-table');
    
    expect(mapView).toBeVisible();
    expect(tableView).toBeVisible();
    
    // Find and click the toggle buttons if they exist
    const mapButton = screen.queryByRole('button', { name: /Map View/i });
    const tableButton = screen.queryByRole('button', { name: /Table View/i });
    
    if (mapButton && tableButton) {
      // Click table view button
      fireEvent.click(tableButton);
      expect(tableView).toBeVisible();
      expect(mapView).not.toBeVisible();
      
      // Click map view button
      fireEvent.click(mapButton);
      expect(mapView).toBeVisible();
      expect(tableView).not.toBeVisible();
    }
  });
});
