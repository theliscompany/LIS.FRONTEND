import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthenticationResult } from '@azure/msal-browser';
import { useAccount, useMsal } from '@azure/msal-react';
import { Typography, Box, Grid, TableCell, TableHead, Paper, Table, TableBody, TableContainer, TableRow, Chip, IconButton, Button, DialogContent, DialogActions } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import { useAuthorizedBackendApi } from '../../api/api';
import { pricingRequest, protectedResources, transportRequest } from '../../authConfig';
import { BackendService } from '../../services/fetch';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { BootstrapDialog, BootstrapDialogTitle, buttonCloseStyles } from '../../misc/styles';

function colors(value: string) {
    switch (value) {
        case "Pending": 
            return "warning";
            break;
        case "Accepted":
            return "success";
            break;
        case "Rejected": 
            return "secondary";
            break;
        case "No response": 
            return "default";
            break;
    }
}

function PriceOffers() {
    const [load, setLoad] = useState<boolean>(true);
    const [offers, setOffers] = useState<any>(null);
    const [ports, setPorts] = useState<any>(null);
    const [modal, setModal] = useState<boolean>(false);
    const [currentId, setCurrentId] = useState<string>("");

    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});
        
    const context = useAuthorizedBackendApi();
    
    useEffect(() => {
        getPorts();
    }, []);
    
    const getPriceOffers = async () => {
        if (context) {
            const response = await (context as BackendService<any>).getSingle(protectedResources.apiLisOffer.endPoint+"/QuoteOffer");
            if (response !== null && response.code !== undefined) {
                if (response.code === 200) {
                    console.log(response.data);
                    setOffers(response.data);
                    setLoad(false);
                }
                else {
                    setLoad(false);
                }
            }
        }
    }
    
    const getPorts = async () => {
        setLoad(true);
        if (context && account) {
            const token = await instance.acquireTokenSilent({
                scopes: transportRequest.scopes,
                account: account
            })
            .then((response: AuthenticationResult) => {
                return response.accessToken;
            })
            .catch(() => {
                return instance.acquireTokenPopup({
                    ...transportRequest,
                    account: account
                    }).then((response) => {
                        return response.accessToken;
                    });
                }
            );
            
            const response = await (context as BackendService<any>).getWithToken(protectedResources.apiLisTransport.endPoint+"/Port/Ports", token);
            console.log(response);
            if (response !== null && response !== undefined) {
                setPorts(response);
                
                // I check the offers after the ports
                getPriceOffers();
            }  
        }
    }
    
    const deleteOffer = async (id: string) => {
        if (context) {
            const response = await (context as any).delete(protectedResources.apiLisOffer.endPoint+"/QuoteOffer/"+id);
            if (response !== null && response.code !== undefined) {
                if (response.code === 200) {
                    enqueueSnackbar("The offer has been deleted with success.", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                    setModal(false);
                    getPriceOffers();
                }
                else {
                    enqueueSnackbar("An error happened during this operation.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
            }  
        }
    }

    return (
        <div style={{ background: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            <SnackbarProvider />
                <Box py={4}>
                    <Typography variant="h5" mt={3} mx={5}><b>Generated price offers</b></Typography>
                    <Box>
                        {
                            !load ? 
                            <Grid container spacing={2} mt={1} px={5}>
                                <Grid item xs={12}>
                                    {
                                        offers !== null && ports !== null ?
                                        <TableContainer component={Paper}>
                                            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell align="left" sx={{ fontSize: 16, fontWeight: "bolder" }}>Offer Id</TableCell>
                                                        <TableCell align="left" sx={{ fontSize: 16, fontWeight: "bolder" }}>Request Id</TableCell>
                                                        <TableCell align="left" sx={{ fontSize: 16, fontWeight: "bolder" }}>Created date</TableCell>
                                                        <TableCell align="left" sx={{ fontSize: 16, fontWeight: "bolder" }}>Departure</TableCell>
                                                        <TableCell align="left" sx={{ fontSize: 16, fontWeight: "bolder" }}>Arrival</TableCell>
                                                        {/* <TableCell align="left" sx={{ fontSize: 16, fontWeight: "bolder" }}>Haulage?</TableCell>
                                                        <TableCell align="left" sx={{ fontSize: 16, fontWeight: "bolder" }}>Misc?</TableCell> */}
                                                        <TableCell align="left" sx={{ fontSize: 16, fontWeight: "bolder" }}>Status</TableCell>
                                                        <TableCell align="left" sx={{ fontSize: 16, fontWeight: "bolder" }}>Client approval</TableCell>
                                                        <TableCell align="left" sx={{ fontSize: 16, fontWeight: "bolder" }}>Total price</TableCell>
                                                        <TableCell align="left"><b></b></TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {
                                                        offers.map((row: any, i: number) => (
                                                            <React.Fragment key={"offer-"+row.id}>
                                                                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                                    <TableCell align="left">{row.quoteOfferNumber}</TableCell>
                                                                    <TableCell align="left">
                                                                        <Link to={"/admin/request/"+row.requestQuoteId}>{row.requestQuoteId}</Link>
                                                                    </TableCell>
                                                                    <TableCell align="left">{(new Date(row.created)).toLocaleString()}</TableCell>
                                                                    <TableCell align="left">{ports.find((elm: any) => elm.portId === row.departurePortId).portName}</TableCell>
                                                                    <TableCell align="left">{ports.find((elm: any) => elm.portId === row.destinationPortId).portName}</TableCell>
                                                                    {/* <TableCell align="left">{row.haulage !== null ? <Chip label="Yes" color="success" /> : <Chip label="No" />}</TableCell>
                                                                    <TableCell align="left">{row.miscellaneousList !== null ? <Chip label="Yes" color="success" /> : <Chip label="No" />}</TableCell> */}
                                                                    <TableCell align="left"><Chip label={row.status} color={colors(row.status)} /></TableCell>
                                                                    <TableCell align="left">{row.status !== "Accepted" && row.clientApproval === "Pending" ? <Chip label={"No email"} /> : <Chip label={row.clientApproval} color={colors(row.clientApproval)} />}</TableCell>
                                                                    <TableCell align="left">{Number(row.totalPrice+row.totalPrice*row.margin/100-row.totalPrice*row.reduction/100+row.extraFee*1).toFixed(2)} {row.seaFreight.currency}</TableCell>
                                                                    <TableCell align="left">
                                                                        <IconButton href={"/admin/manage-offer/"+row.id} sx={{ mr: 1 }}>
                                                                            <EditIcon fontSize="small" />
                                                                        </IconButton>
                                                                        <IconButton onClick={() => { setCurrentId(row.id); setModal(true); }}>
                                                                            <DeleteIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </TableCell>
                                                                </TableRow>
                                                            </React.Fragment>
                                                        ))
                                                    }
                                                </TableBody>
                                            </Table>
                                        </TableContainer> : <Skeleton sx={{ mt: 3 }} />
                                    }
                                </Grid>
                            </Grid> : <Skeleton sx={{ mx: 5, mt: 3 }} />
                        }
                    </Box>
                </Box>
                <BootstrapDialog
                    onClose={() => setModal(false)}
                    aria-labelledby="custom-dialog-title"
                    open={modal}
                    maxWidth="sm"
                    fullWidth
                >
                    <BootstrapDialogTitle id="custom-dialog-title" onClose={() => setModal(false)}>
                        <b>Confirm the deletion</b>
                    </BootstrapDialogTitle>
                    <DialogContent dividers>
                        <Typography variant="subtitle1" gutterBottom px={2}>
                            Are you sure you want to delete this offer? This operation cant be cancelled.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="contained" color="secondary" className="mr-3" onClick={() => { deleteOffer(currentId); }} sx={{ textTransform: "none" }}>Delete</Button>
                        <Button variant="contained" onClick={() => setModal(false)} sx={buttonCloseStyles}>Close</Button>
                    </DialogActions>
                </BootstrapDialog>
        </div>
    );
}

export default PriceOffers;
