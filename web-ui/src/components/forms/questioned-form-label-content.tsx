import { Button } from 'devextreme-react/button';
import { BsQuestionCircle } from 'react-icons/bs';

export const FormQuestionedLabelContent = ({ text }: {text: string}) => {
    return (
        <div style={ { display: 'flex', justifyContent: 'center', alignItems: 'center' } } onClick={ (e) =>  e.stopPropagation() }>
            <span style={ { flex: 1 } }>{text}</span>
            <Button style={ {  borderRadius: '50%', boxShadow: 'none' } } >
                <BsQuestionCircle size={ 18 } style={ { justifySelf: 'flex-end', margin: 1 }  } />
            </Button>
        </div>
    );
}