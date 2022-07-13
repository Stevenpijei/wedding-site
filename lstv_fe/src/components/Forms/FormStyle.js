import styled, {css} from "styled-components";
import * as LSTVGlobals from "../../global/globals";

export const FormLabel = styled.label`
    display: block;
    width: 90%;
    text-align: left;
    color: ${LSTVGlobals.TEXT_AND_SVG_LIGHTER_BLACK};
    margin-bottom: 1px;
    font-size: 0.9rem;
    font-weight: ${LSTVGlobals.FONT_WEIGHT_SEMIBOLD};
   
`;


export const FormRowSpacer = styled.div`
    display: block;
    width: 10px;
    height: 1px;
`;

export const FormInput = styled.input`
    width: 100%;
    display: block;
    outline: none;
    border: none;
    height: 2rem;
    line-height: 2rem;
    font-size: 1rem;
    padding: 2px 5px 2px 5px;
    background: ${LSTVGlobals.DEFAULT_FORM_FIELD_BG};
    
    &:focus {
       box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 0 1px ${LSTVGlobals.CARD_BACKGROUND_DARKEST};
    }
   
    &:disabled {
       color: #bbbbbb;
    }
    
  
    ${props => props.type === 'date' && css`
    
        -webkit-inner-spin-button {
            -webkit-appearance: none;
            display: none;
        }

    
        @media ${LSTVGlobals.UserDevice.isTablet} {
            min-width: calc(98%);
            height: 2.2rem;
        }
        
         @media ${LSTVGlobals.UserDevice.isMobile} {
            min-width: calc(96%);
            height: 2.2rem;
        }
    `};
    
      
`;

export const TextAreaInput = styled.textarea`
    width: 100%;
    display: block;
    outline: none;
    border: none;
    height: 100px;
    line-height: 1.2rem;
    font-size: 1rem;
    padding: 2px 5px 2px 5px;
    background: ${LSTVGlobals.DEFAULT_FORM_FIELD_BG};
    resize: vertical;
    padding: 5px;
    
    &:focus {
       box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 0 1px ${LSTVGlobals.CARD_BACKGROUND_DARKEST};
    }
      
`;


export const InputErrors = styled.div`
    margin-top: 2px;
    width: auto;
    height: auto;
    font-size: 1rem;
    color: ${LSTVGlobals.HEART_RED};
    display: inline-block;
    text-align: left;
`;

export const FormFooter = styled.div`
    text-align: center;
    padding-bottom: 15px;
`;

export const FormErrorMessage = styled.div`
    padding:5px;
    margin: 0;
    background: ${LSTVGlobals.HEART_RED};
    
    p {
        color: ${LSTVGlobals.WHITE};
        line-height: 1.5rem;
    }
    
`;
