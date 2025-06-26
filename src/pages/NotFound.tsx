import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next'; 
import CollapsibleDataGrid from '@components/shared/CollapseGrid';

function NotFound() {
    const { t } = useTranslation();
    
    return (
        <div>
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" sx={{ height: "100vh" }}>
                <Typography variant="h4" sx={{ fontSize: { xs: 18, md: 27 } }}>{t('pageNotExist')}</Typography>
                <img src="/img/bg404.jpg" alt="404 page" style={{ maxHeight: "80vh", maxWidth: "80vw" }} />
            </Box>

            <CollapsibleDataGrid />
        </div>
    );
}

export default NotFound;
