import {render, screen} from '@testing-library/react';
import Login from '../Login/Login';
import { BrowserRouter } from "react-router-dom"; 

describe('Login Component', () => {
    test("renders login form with login button, forgot password and sign up ", () => {
        render( 
        <BrowserRouter >
        { <Login /> }
        </BrowserRouter>
    );
        const loginButton = screen.getByTestId("login-button");
        expect(loginButton).toBeInTheDocument();
 })

});