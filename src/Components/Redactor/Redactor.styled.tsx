import styled from 'styled-components';

export const Box = styled.div`
    position: absolute;
    left: 0;
    top: 88px;
    width: 50%;
    height: calc(100% - 88px);
    overflow: hidden;
`;

export const G = styled.div`
    display: flex;
    flex-direction: column;
`;
export const G2 = styled.div`
    display: flex;
    flex-direction: row;
    & > * {
        margin-left: 8px;
    }
`;