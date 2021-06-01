import React from 'react';
import { Button } from 'vienna-ui';
import { Box, Btn } from './Frame.styled';
import ESService from '../../Services/ESbuilder';
import { Monaco } from '../../Services/Monaco';

export const Frame = () => {
    return (
        <>
            <Box src={'/playground.html'} />
            <Btn><Button onClick={() => ESService.build(Monaco.model?.getValue())}>Собрать</Button></Btn>
        </>
    );
}