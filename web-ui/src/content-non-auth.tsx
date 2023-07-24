import { Route, Routes } from 'react-router-dom';
import { SingleCard } from './layouts';
import { LoginForm } from './components';


const ContentNonAuth = () => {
    return (
        <Routes>
            <Route path="/login" element={
                <SingleCard title="Вход">
                    <LoginForm />
                </SingleCard>
            } />
        </Routes>
    );
}

export default ContentNonAuth;
