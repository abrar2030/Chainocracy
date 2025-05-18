/**
 * Tests for CandidateItem component
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CandidateItem from 'src/components/CandidateItem';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
  return {
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
      navigate: mockNavigate,
    }),
  };
});

describe('CandidateItem Component', () => {
  const mockCandidate = {
    id: '1',
    name: 'John Doe',
    party: 'Democratic Party',
    acronym: 'DP',
    code: 123,
    status: 'active',
    image: require('src/assets/candidates_logo/can_1.png')
  };

  beforeEach(() => {
    mockNavigate.mockClear();
  });

  test('renders candidate information correctly', () => {
    const { getByText } = render(
      <CandidateItem candidate={mockCandidate} />
    );

    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('Democratic Party')).toBeTruthy();
    expect(getByText('DP')).toBeTruthy();
  });

  test('navigates to candidate details when pressed', () => {
    const { getByTestId } = render(
      <CandidateItem candidate={mockCandidate} />
    );

    const candidateItem = getByTestId('candidate-item');
    fireEvent.press(candidateItem);

    expect(mockNavigate).toHaveBeenCalledWith('CandidateDetails', { candidate: mockCandidate });
  });

  test('displays candidate status correctly', () => {
    const { getByText } = render(
      <CandidateItem candidate={mockCandidate} />
    );

    expect(getByText('active')).toBeTruthy();
  });

  test('handles candidate without image', () => {
    const candidateWithoutImage = {
      ...mockCandidate,
      image: null
    };

    const { getByTestId } = render(
      <CandidateItem candidate={candidateWithoutImage} />
    );

    // Should still render without crashing
    expect(getByTestId('candidate-item')).toBeTruthy();
  });

  test('handles candidate with minimal information', () => {
    const minimalCandidate = {
      id: '2',
      name: 'Jane Smith',
      code: 456
    };

    const { getByText, queryByText } = render(
      <CandidateItem candidate={minimalCandidate} />
    );

    expect(getByText('Jane Smith')).toBeTruthy();
    expect(queryByText('Democratic Party')).toBeNull();
    expect(queryByText('DP')).toBeNull();
  });
});
