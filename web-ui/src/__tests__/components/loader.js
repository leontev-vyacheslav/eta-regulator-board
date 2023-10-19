import React from 'react'
import { render, act, screen } from '@testing-library/react';
import Loader from '../../components/loader/loader';


it('loader', async () => {

    await act(async () => {
        render(<Loader />);
    });

    const spanElement = screen.getByTestId('testId');
    expect(spanElement).toBeInTheDocument();
});
