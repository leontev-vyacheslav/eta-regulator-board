import React from 'react'
import { render, act, screen } from '@testing-library/react';
import Loader from '../../components/loader/loader';


it('loader', async () => {

    await act(async () => {
        render(<Loader />);
    });

    // console.log(container.querySelector('svg'))
    // container.querySelector('span')
    const spanElement = screen.getByTestId('testId');
    expect(spanElement).toBeInTheDocument();
});
