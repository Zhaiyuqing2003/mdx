/* @refresh reload */
import { render } from 'solid-js/web';

// CssBaseLine
import './index.css';
import './font.css';
import App from './App';

// render when document is ready
document.onreadystatechange = () => {
    document.fonts.load('italic 16px Latex Math').then(() => {
        // render app
        render(() => <App />, document.getElementById('root')!);
    })
}


