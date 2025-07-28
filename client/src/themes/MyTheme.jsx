// https://mui.com/material-ui/customization/color/
import { createTheme } from '@mui/material/styles';
const theme = createTheme({
    palette: {
        primary: {
            main: '#6B9080',
        },
        secondary: {
            main: '#f4511e',
        }
    },
    typography: {
        fontFamily: 'Lexend', // add
    }
});
export default theme;