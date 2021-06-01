import styled from 'styled-components';

export const Box = styled.iframe`    
    height: calc(100% - 88px);
    width: 50%;
    border: none;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    display: block;
    border: 1px solid gray;
    left: 50%;
    top: 88px;
    position: absolute;
    border: 8px dashed gray;
`;
export const Btn = styled.div`    
   position: fixed;
   right: 16px;
   bottom: 16px;
`;