import { Box, Grid } from '@mui/material';
import '../../App.css';
import { useTranslation } from 'react-i18next';

function Privacy() {
    const { t } = useTranslation();
    
    return (
        <Box sx={{ maxWidth: "lg", margin: "0 auto" }}>
            <Grid container my={5}>
                <Grid item xs={12} fontSize={17} mx={5}>
                <h2 className="my-3">{t('privacyPolicy')}</h2>
                <h4 className="my-3">{t('introduction')}</h4>
                {t('dataPersonal')}
                &nbsp;
                <h4 className="my-3">{t('dataUsage')}</h4>
                {t('dataDirectlyProvided')}
                &nbsp;
                <h4 className="my-3">{t('legalBasis')}</h4>
                {t('dataCollectedConsent')}
                &nbsp;
                <h4 className="my-3">{t('retentionPeriod')}</h4>
                {t('dataStoredMaxPeriod')}
                &nbsp;
                <h4 className="my-3">{t('cookies')}</h4>
                {t('cookiesList')}
                <ul className="pl-3">
                    <li>{t('googleAnalyticsCookies')}</li>
                    <li>{t('otherCookies')}</li>
                </ul>
                <h4 className="my-3">{t('rightsPersonalData')}</h4>
                {t('accessModificationDeletion')}
                &nbsp;
                <h4 className="my-3">{t('dataProtectionContact')}</h4>
                {t('emailContact')}
                &nbsp;
                </Grid>
            </Grid>
        </Box>
    );
}

export default Privacy;
