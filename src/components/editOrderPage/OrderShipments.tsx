import { Grid, Button, Skeleton } from '@mui/material';
import { t } from 'i18next';
import { useEffect, useState } from 'react';
import { actionButtonStyles } from '../../utils/misc/styles';
import dayjs, { Dayjs } from 'dayjs';
import BusinessShipments from './BusinessShipments';
import InformationShipments from './InformationShipments';
import BudgetShipments from './BudgetShipments';
import { enqueueSnackbar } from 'notistack';
import { protectedResources } from '../../config/authConfig';
import { BackendService } from '../../utils/services/fetch';
import { useMsal, useAccount } from '@azure/msal-react';
import { useAuthorizedBackendApi } from '../../api/api';

const OrderShipments = (props: any) => {
    const [load, setLoad] = useState<boolean>(true);
    const [loadCreate, setLoadCreate] = useState<boolean>(false);
    const [orderData, setOrderData] = useState<any>(null);
    
    const [customer, setCustomer] = useState<any>(null);
    const [seller, setSeller] = useState<any>(null);
    const [buyer, setBuyer] = useState<any>(null);
    const [ship, setShip] = useState<any>(null);
    const [referenceCustomer, setReferenceCustomer] = useState<string>("");
    const [referenceSeller, setReferenceSeller] = useState<string>("");
    const [referenceBuyer, setReferenceBuyer] = useState<string>("");
    const [incotermFrom, setIncotermFrom] = useState<string>("");
    const [incotermTo, setIncotermTo] = useState<string>("");
    const [incotermFromCity, setIncotermFromCity] = useState<any>(null);
    const [incotermToCity, setIncotermToCity] = useState<any>(null);
    
    const [carrier, setCarrier] = useState<any>(null);
    const [carrierAgent, setCarrierAgent] = useState<any>(null);
    const [bookingRef, setBookingRef] = useState<string>("");
    const [portLoading, setPortLoading] = useState<any>(null);
    const [portDischarge, setPortDischarge] = useState<any>(null);

    const [etd, setEtd] = useState<Dayjs | null>(null);
    const [eta, setEta] = useState<Dayjs | null>(null);
    
    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});    
    const context = useAuthorizedBackendApi();
    
    const { id, ports, products, services, cities, contacts, ships, setOrderNumber } = props;

    useEffect(() => {
        loadOrder();
    }, [contacts, ports, cities, ships]); // contacts, ports, cities, ships
    
    const editOrder = async () => {
        if (account && instance && context) {
            try {
                setLoadCreate(true);
                var dataSent = {};
                if (seller !== null && buyer !== null && customer !== null && carrier !== null && carrierAgent !== null && 
                    portLoading !== null && portDischarge !== null && etd !== null && eta !== null && incotermToCity !== null && incotermFromCity !== null) {
                    if (orderData !== null && id !== undefined) {
                        dataSent = {
                            "orderId": Number(id),
                            "orderNumber": orderData.orderNumber,
                            "orderDate": orderData.orderDate,
                            "closeDate": orderData.closeDate,
                            "sellerId": seller.contactId,
                            "buyerId": buyer.contactId,
                            "customerId": customer.contactId,
                            "shippingAgent": carrierAgent.contactId,
                            "shipId": ship !== null ? ship.shipId : null,
                            "shipLineId": carrier.contactId,
                            "employeeId": orderData.employeeId,
                            "paymentCondition": orderData.paymentCondition,
                            "orderStatus": orderData.orderStatus,
                            // "orderStatus": 1,
                            "lastEdited": orderData.lastEdited,
                            "lastEditor": orderData.lastEditor,
                            "departurePort": portLoading.portId,
                            "destinationPort": portDischarge.portId,
                            "estimatedDepartureDate": etd?.toISOString(),
                            "estimatedArrivalDate": eta?.toISOString(),
                            "incoTerm": incotermFrom,
                            "refClient": referenceCustomer,
                            "refSeller": referenceSeller,
                            "refBuyer": referenceBuyer,
                            "incotermDestination": incotermTo,
                            "executedInDate": orderData.executedInDate,
                            "fiscalYear": orderData.fiscalYear,
                            "isVal1": orderData.isVal1,
                            "isVal2": orderData.isVal2,
                            "isVal3": orderData.isVal3,
                            "isVal4": orderData.isVal4,
                            "isVal5": orderData.isVal5,
                            "refShippingAgent": bookingRef,
                            "flag": orderData.flag,
                            "docFlag": orderData.docFlag,
                            "city": incotermFromCity.id,
                            "freightCharges": orderData.freightCharges,
                            "freightPayableAt": orderData.freightPayableAt,
                            "freightMoveType": orderData.freightMoveType,
                            "freightShipmentType": orderData.freightShipmentType,
                            "numberOfBlOriginal": orderData.numberOfBlOriginal,
                            "numberOfBlCopy": orderData.numberOfBlCopy,
                            "shipperAddress": orderData.shipperAddress,
                            "consigneeAddress": orderData.consigneeAddress,
                            "notifyParty": orderData.notifyParty,
                            "notifyPartyRef": orderData.notifyPartyRef,
                            "voyageNumber": orderData.voyageNumber,
                            "lcl": orderData.lcl,
                            "exportation": orderData.exportation,
                            "cityIncotermTo": incotermToCity.id,
                            "invoiceUserId": orderData.invoiceUserId,
                            "documentationUserId": orderData.documentationUserId,
                            "operationsUserId": orderData.operationsUserId,
                            "oblOverview": orderData.oblOverview
                        };
                        const response = await (context?.service as BackendService<any>).putWithToken(protectedResources.apiLisShipments.endPoint+"/Orders/"+id, dataSent, context.tokenLogin);
                        enqueueSnackbar("The order has been edited with success!", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                        loadOrder();    
                    }
                    else {
                        dataSent = {
                            "orderDate": new Date().toISOString(),
                            // "closeDate": orderData.closeDate,
                            "sellerId": seller.contactId,
                            "buyerId": buyer.contactId,
                            "customerId": customer.contactId,
                            "shippingAgent": carrierAgent.contactId,
                            "shipId": ship !== null ? ship.shipId : null,
                            "shipLineId": carrier.contactId,
                            // "employeeId": orderData.employeeId,
                            // "paymentCondition": orderData.paymentCondition,
                            "orderStatus": 1,
                            // "lastEdited": orderData.lastEdited,
                            // "lastEditor": orderData.lastEditor,
                            "departurePort": portLoading.portId,
                            "destinationPort": portDischarge.portId,
                            "estimatedDepartureDate": etd?.toISOString(),
                            "estimatedArrivalDate": eta?.toISOString(),
                            "incoTerm": incotermFrom,
                            "refClient": referenceCustomer,
                            "refSeller": referenceSeller,
                            "refBuyer": referenceBuyer,
                            "incotermDestination": incotermTo,
                            // "executedInDate": orderData.executedInDate,
                            "fiscalYear": Number(new Date().getFullYear()),
                            // "isVal1": orderData.isVal1,
                            // "isVal2": orderData.isVal2,
                            // "isVal3": orderData.isVal3,
                            // "isVal4": orderData.isVal4,
                            // "isVal5": orderData.isVal5,
                            "refShippingAgent": bookingRef,
                            // "flag": orderData.flag,
                            // "docFlag": orderData.docFlag,
                            "city": incotermFromCity.id,
                            // "freightCharges": orderData.freightCharges,
                            // "freightPayableAt": orderData.freightPayableAt,
                            // "freightMoveType": orderData.freightMoveType,
                            // "freightShipmentType": orderData.freightShipmentType,
                            // "numberOfBlOriginal": orderData.numberOfBlOriginal,
                            // "numberOfBlCopy": orderData.numberOfBlCopy,
                            // "shipperAddress": orderData.shipperAddress,
                            // "consigneeAddress": orderData.consigneeAddress,
                            // "notifyParty": orderData.notifyParty,
                            // "notifyPartyRef": orderData.notifyPartyRef,
                            // "voyageNumber": orderData.voyageNumber,
                            // "lcl": orderData.lcl,
                            // "exportation": orderData.exportation,
                            "cityIncotermTo": incotermToCity.id,
                            // "invoiceUserId": orderData.invoiceUserId,
                            // "documentationUserId": orderData.documentationUserId,
                            // "operationsUserId": orderData.operationsUserId,
                            // "oblOverview": orderData.oblOverview
                        };
                        const response = await (context?.service as BackendService<any>).postWithToken(protectedResources.apiLisShipments.endPoint+"/Orders", dataSent, context.tokenLogin);
                        if (response !== undefined && response !== null) {
                            enqueueSnackbar("The order has been created with success!", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                            loadOrder();
                        }
                    }
                }
                else {
                    enqueueSnackbar("An error happened, please fill all the fields correctly.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
                setLoadCreate(false);
            }
            catch (err: any) {
                enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                setLoadCreate(false);
                console.log(err);
            }
        }
    }
    
    const loadOrder = async () => {
		if (account && instance && context && contacts !== null && ports !== null && cities !== null && ships !== null && id !== undefined) {
            setLoad(true);
            const response = await (context?.service as BackendService<any>).getSingle(protectedResources.apiLisShipments.endPoint+"/Orders/"+id);
            if (response !== null && response !== undefined) {
                setOrderData(response);
                // Order data import
                setSeller(contacts.find((elm: any) => elm.contactId === response.sellerId));
                setCustomer(contacts.find((elm: any) => elm.contactId === response.customerId));
                setBuyer(contacts.find((elm: any) => elm.contactId === response.buyerId));
                setCarrier(contacts.find((elm: any) => elm.contactId === response.shipLineId));
                setCarrierAgent(contacts.find((elm: any) => elm.contactId === response.shippingAgent));
                
                setPortLoading(ports.find((elm: any) => elm.portId === response.departurePort));
                setPortDischarge(ports.find((elm: any) => elm.portId === response.destinationPort));

                setEtd(dayjs(response.estimatedDepartureDate));
                setEta(dayjs(response.estimatedArrivalDate));

                setIncotermFrom(response.incoTerm);
                setIncotermTo(response.incotermDestination);
                setIncotermFromCity(cities.find((elm: any) => elm.id === response.city));
                setIncotermToCity(cities.find((elm: any) => elm.id === response.cityIncotermTo));
                setBookingRef(response.refShippingAgent);
                // setVessel(String(response.shipId));
                setShip(response.shipId !== null ? ships.find((elm: any) => elm.shipId === Number(response.shipId)) : null);

                setReferenceSeller(response.refSeller);
                setReferenceCustomer(response.refClient);
                setReferenceBuyer(response.refBuyer);
                
                setOrderNumber(response.orderNumber);
                // Order data import end
                setLoad(false);
            }
            else {
                setLoad(false);
            }
        }
	}

    return (
        <>
        <Grid container spacing={0.75}>
            <Grid item xs={12} sx={{ mb: 2 }}>
                <Button variant="contained" onClick={() => { editOrder(); }} sx={actionButtonStyles} disabled={loadCreate}>{t('Save')}</Button>
                <Button variant="contained" onClick={() => { console.log("Dumb"); loadOrder(); }} sx={actionButtonStyles}>{t('reload')}</Button>
            </Grid>
            <Grid item xs={6}>
                {
                    orderData !== null || id === undefined ? 
                    <BusinessShipments
                        customer={customer} setCustomer={setCustomer} 
                        referenceCustomer={referenceCustomer} setReferenceCustomer={setReferenceCustomer} 
                        seller={seller} setSeller={setSeller} 
                        referenceSeller={referenceSeller} setReferenceSeller={setReferenceSeller} 
                        buyer={buyer} setBuyer={setBuyer} 
                        referenceBuyer={referenceBuyer} setReferenceBuyer={setReferenceBuyer} 
                        incotermFrom={incotermFrom} setIncotermFrom={setIncotermFrom} 
                        incotermTo={incotermTo} setIncotermTo={setIncotermTo} 
                        incotermFromCity={incotermFromCity} setIncotermFromCity={setIncotermFromCity} 
                        incotermToCity={incotermToCity} setIncotermToCity={setIncotermToCity} 
                        cities={cities}
                    /> : <Skeleton />
                }
            </Grid>
            
            <Grid item xs={6}>
                {
                    orderData !== null || id === undefined ? 
                    <InformationShipments
                        carrier={carrier}  setCarrier={setCarrier} 
                        carrierAgent={carrierAgent} setCarrierAgent={setCarrierAgent} 
                        bookingRef={bookingRef} setBookingRef={setBookingRef} 
                        portLoading={portLoading} setPortLoading={setPortLoading} 
                        portDischarge={portDischarge} setPortDischarge={setPortDischarge} 
                        etd={etd} setEtd={setEtd} 
                        eta={eta} setEta={setEta} 
                        ship={ship} setShip={setShip} 
                        ships={ships} ports={ports} 
                        products={products} orderData={orderData} id={id} 
                    /> : <Skeleton />
                }
            </Grid>

            <Grid item xs={12} sx={{ mt: 1 }}>
                <BudgetShipments 
                    services={services} 
                    contacts={contacts} 
                    orderData={orderData} 
                    id={id}
                />
            </Grid>
        </Grid>
        </>    
    );
};

export default OrderShipments;
