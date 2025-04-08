import { useState } from 'react';
import { BootstrapDialogTitle, BootstrapInput, actionButtonStyles, buttonCloseStyles, inputLabelStyles } from '../../utils/misc/styles';
import { Button, DialogActions, DialogContent, InputLabel, MenuItem, Select } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useTranslation } from 'react-i18next';
import { enqueueSnackbar } from 'notistack';
import { CreatedServiceViewModel, postService } from '../../api/client/transport';

function NewService(props: any) {
    const [testName, setTestName] = useState<string>("");
    const [testDescription, setTestDescription] = useState<string>("");
    const [selectedServiceTypes, setSelectedServiceTypes] = useState<any>([]);
    
    const { t } = useTranslation();
    
    var serviceTypes: any = [
        { value: 1, label: t('seafreight') },
        { value: 2, label: t('haulage') },
        { value: 5, label: t('miscellaneous') },
    ];
    
    const handleChange = (event: any) => {
        const { target: { value },} = event;
        setSelectedServiceTypes(typeof value === 'string' ? value.split(',') : value);
    };

    const createNewService = async () => {
        if (testName !== "" && selectedServiceTypes.length !== 0) {
            var dataSent: CreatedServiceViewModel = {
                "serviceName": testName,
                "serviceDescription": testDescription,
                "servicesTypeId": selectedServiceTypes
            };
            
            try {
                const response = await postService({body: dataSent});
                if (response !== null) {
                    enqueueSnackbar(t('serviceAddedSuccess'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                    
                    if (props.callBack !== undefined && props.callBack !== null) {
                        props.callBack();
                    }
                    props.closeModal();
                }
                else {
                    enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
            }
            catch (err: any) {
                console.log(err);
                enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
        else {
            enqueueSnackbar(t('verifyMessage'), { variant: "warning", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }
    
    return (
        <>
            <BootstrapDialogTitle id="custom-dialog-title7" onClose={props.closeModal}>
                <b>{t('createNewService')}</b>
            </BootstrapDialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                        <InputLabel htmlFor="test-name" sx={inputLabelStyles}>
                            {t('serviceName')}
                        </InputLabel>
                        <BootstrapInput id="test-name" type="text" value={testName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTestName(e.target.value)} fullWidth />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <InputLabel htmlFor="test-description" sx={inputLabelStyles}>Description</InputLabel>
                        <BootstrapInput id="test-description" type="text" multiline rows={3} value={testDescription} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTestDescription(e.target.value)} fullWidth />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <InputLabel htmlFor="test-services-types" sx={inputLabelStyles}>{t('servicesTypesId')}</InputLabel>
                        <Select
                            labelId="test-services-types"
                            id="test-selected-services"
                            multiple
                            value={selectedServiceTypes}
                            onChange={handleChange}
                            fullWidth
                            input={<BootstrapInput />}
                            renderValue={(selected: any) => selected.map((value: any) => serviceTypes.find((type: any) => type.value === value).label).join(', ')}
                        >
                            {serviceTypes.map((serviceType: any) => (
                                <MenuItem key={serviceType.value} value={serviceType.value}>
                                    {serviceType.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={() => { createNewService(); }} sx={actionButtonStyles}>{t('validate')}</Button>
                <Button variant="contained" onClick={props.closeModal} sx={buttonCloseStyles}>{t('close')}</Button>
            </DialogActions>
        </>
    );
}

export default NewService;
