
import React from 'react';
import { MemoryRouter, Route } from 'react-router-dom';
import { Body } from 'vienna-ui';
import { Frame, LoginModal, Redactor } from '..';
import { GlobalStyle } from './App.styled';

export const App = () => {
    return (
        <Body>
            <GlobalStyle />
            <MemoryRouter>
                <Route exact path="/" component={LoginModal} />
                <Route exact path="/:roomId" component={Redactor} />
                <Route exact path="/:roomId" component={Frame} />
            </MemoryRouter>
        </Body>
    )
}
