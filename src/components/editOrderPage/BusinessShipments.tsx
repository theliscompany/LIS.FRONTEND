import { ExpandMore } from '@mui/icons-material';
import { Accordion, AccordionSummary, AccordionDetails, Grid, InputLabel, Typography, Divider, NativeSelect, Autocomplete, TextField, Skeleton } from '@mui/material';
import { t } from 'i18next';
import React from 'react';
import { CategoryEnum, incotermValues, incotermDestinationValues } from '../../utils/constants';
import { inputLabelStyles, BootstrapInput } from '../../utils/misc/styles';
import CompanySearch from '../shared/CompanySearch';

const BusinessShipments = (props: any) => {
    const { 
        customer, setCustomer, referenceCustomer, setReferenceCustomer, seller, setSeller, referenceSeller, setReferenceSeller, 
        buyer, setBuyer, referenceBuyer, setReferenceBuyer, incotermFrom, setIncotermFrom, incotermTo, setIncotermTo, 
        incotermFromCity, setIncotermFromCity, incotermToCity, setIncotermToCity, cities
    } = props;

    return (
        <Accordion expanded sx={{ width: "100%" }}>
            <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel1-content" id="panel1-header">
                Business Parties
            </AccordionSummary>
            <AccordionDetails>
                <Grid container spacing={0.75}>
                    <Grid item xs={8}>
                        <InputLabel htmlFor="customer" sx={inputLabelStyles}>{t('Principal / Customer')} *</InputLabel>
                        <CompanySearch id="customer" value={customer} onChange={setCustomer} category={CategoryEnum.CUSTOMERS} fullWidth />
                    </Grid>
                    <Grid item xs={4}>
                        <InputLabel htmlFor="reference1" sx={inputLabelStyles}>{t('Reference')}</InputLabel>
                        <BootstrapInput id="reference1" type="text" value={referenceCustomer} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReferenceCustomer(e.target.value)} fullWidth sx={{ mb: 1 }} />
                    </Grid>
                    <Grid item xs={8}>
                        <InputLabel htmlFor="seller" sx={inputLabelStyles}>{t('Seller / Shipper')}</InputLabel>
                        <CompanySearch id="seller" value={seller} onChange={setSeller} category={CategoryEnum.CUSTOMERS} fullWidth />
                    </Grid>
                    <Grid item xs={4}>
                        <InputLabel htmlFor="reference2" sx={inputLabelStyles}>{t('Reference')}</InputLabel>
                        <BootstrapInput id="reference2" type="text" value={referenceSeller} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReferenceSeller(e.target.value)} fullWidth sx={{ mb: 1 }} />
                    </Grid>
                    <Grid item xs={8}>
                        <InputLabel htmlFor="buyer" sx={inputLabelStyles}>{t('Buyer / Consignee')}</InputLabel>
                        <CompanySearch id="buyer" value={buyer} onChange={setBuyer} category={CategoryEnum.CUSTOMERS} fullWidth />
                    </Grid>
                    <Grid item xs={4}>
                        <InputLabel htmlFor="reference3" sx={inputLabelStyles}>{t('Reference')}</InputLabel>
                        <BootstrapInput id="reference3" type="text" value={referenceBuyer} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReferenceBuyer(e.target.value)} fullWidth sx={{ mb: 1 }} />
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="h6">Incoterm</Typography>
                        <Divider />
                    </Grid>
                    <Grid item xs={2} sx={{ mt: 0.875 }}>From</Grid>
                    <Grid item xs={4} sx={{ mt: 0.875 }}>
                        <NativeSelect
                            id="incotermFrom"
                            value={incotermFrom}
                            onChange={(e: any) => { setIncotermFrom(e.target.value); }}
                            input={<BootstrapInput />}
                            fullWidth
                        >
                            <option></option>
                            {
                                incotermValues.map((row: any, i: number) => (
                                    <option key={"incoId1-"+i} value={String(row)}>{row}</option>
                                ))
                            }
                        </NativeSelect>
                    </Grid>
                    <Grid item xs={6}>
                        {
                            cities !== null ?
                            <Autocomplete
                                disablePortal
                                id="incotermFromCity"
                                options={cities}
                                renderOption={(props, option, i) => {
                                    return (
                                        <li {...props} key={option.id}>
                                            {option.name+", "+option.country}
                                        </li>
                                    );
                                }}
                                getOptionLabel={(option: any) => { 
                                    if (option !== null && option !== undefined) {
                                        return option.name+', '+option.country;
                                    }
                                    return ""; 
                                }}
                                value={incotermFromCity}
                                sx={{ mt: 1 }}
                                renderInput={(params: any) => <TextField {...params} />}
                                onChange={(e: any, value: any) => { 
                                    setIncotermFromCity(value);
                                }}
                                fullWidth
                            /> : <Skeleton />
                        }
                    </Grid>

                    <Grid item xs={2} sx={{ mt: 0.875 }}>To</Grid>
                    <Grid item xs={4} sx={{ mt: 0.875 }}>
                        <NativeSelect
                            id="incotermTo"
                            value={incotermTo}
                            onChange={(e: any) => { setIncotermTo(e.target.value); }}
                            input={<BootstrapInput />}
                            fullWidth
                        >
                            <option></option>
                            {
                                incotermDestinationValues.map((row: any, i: number) => (
                                    <option key={"incoId2-"+i} value={String(row)}>{row}</option>
                                ))
                            }
                        </NativeSelect>
                    </Grid>
                    <Grid item xs={6}>
                        {
                            cities !== null ?
                            <Autocomplete
                                disablePortal
                                id="incotermToCity"
                                options={cities}
                                renderOption={(props, option, i) => {
                                    return (
                                        <li {...props} key={option.id}>
                                            {option.name+", "+option.country}
                                        </li>
                                    );
                                }}
                                getOptionLabel={(option: any) => { 
                                    if (option !== null && option !== undefined) {
                                        return option.name+', '+option.country;
                                    }
                                    return ""; 
                                }}
                                value={incotermToCity}
                                sx={{ mt: 1 }}
                                renderInput={(params: any) => <TextField {...params} />}
                                onChange={(e: any, value: any) => { 
                                    setIncotermToCity(value);
                                }}
                                fullWidth
                            /> : <Skeleton />
                        }
                    </Grid>
                </Grid>
            </AccordionDetails>
        </Accordion>
    );
};

export default BusinessShipments;
