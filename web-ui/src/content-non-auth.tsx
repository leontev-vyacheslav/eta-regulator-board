import { Route, Routes, Navigate } from 'react-router-dom';
import { SingleCard } from './layouts';
import { SinginForm } from './components';

const ContentNonAuth = () => {
    return (
        <Routes>
            <Route path="/sign-in" element={
                <SingleCard title="Вход">
                    <SinginForm />
                </SingleCard>
            } />

            <Route path='*' element={ <Navigate to='/sign-in' replace /> }
            />
        </Routes>
    );
}

export default ContentNonAuth;
