import React, { useEffect, useState } from "react";
import { Chip, Box, Typography, Alert, Skeleton, Button, InputLabel } from "@mui/material";
import Grid from '@mui/material/Grid2';
import { BootstrapInput, datetimeStyles, gridStyles, inputLabelStyles } from '@utils/misc/styles';
import { SnackbarProvider, enqueueSnackbar } from "notistack";
import SearchIcon from "@mui/icons-material/Search";
import { Link } from "react-router-dom";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { useTranslation } from "react-i18next"; // Import the useTranslation hook
import { getApiRequest } from '@features/request/api';
import { getApiQuoteOffer } from '@api/client/offer';
import OffersStatusPieChart from '@features/request/components/chart/OffersStatusPieChart';
import RequestsPerAssigneeChart from '@features/request/components/chart/RequestsPerAssigneeChart';
import RequestsStatusPieChart from '@features/request/components/chart/RequestsStatusPieChart';

const Histories = () => {
	const [load, setLoad] = useState<boolean>(false);
	const [histories, setHistories] = useState<any[]>([]);
	const [offers, setOffers] = useState<any[]>([]);
	const [requestQuoteId, setRequestQuoteId] = useState<string>("");
	const [assigneeId, setAssigneeId] = useState<string>("");
	const [assignedDateStart, setAssignedDateStart] = useState<Dayjs | null>(null);
	const [assignedDateEnd, setAssignedDateEnd] = useState<Dayjs | null>(null);

	const { t } = useTranslation(); // Use the useTranslation hook

	useEffect(() => {
		getRequests();
		getHistories();
		getPriceOffers();
	}, []);

	const columnsEvents: GridColDef[] = [
		{ field: "id", headerName: t("id"), minWidth: 100, flex: 0.5 },
		{
			field: "requestQuoteId", headerName: t("requestQuoteId"),
			renderCell: (params: GridRenderCellParams) => { return (<Box><Link to={"/request/" + params.row.id}>{params.row.id}</Link></Box>); },
			minWidth: 100, flex: 0.5,
		},
		{
			field: "assigneeId", headerName: t("assigneeId"),
			renderCell: (params: GridRenderCellParams) => {
				return (<Box>{params.row.assigneeId !== null ? params.row.assigneeId : "Not defined"}</Box>);
			},
			minWidth: 250, flex: 1,
		},
		{
			field: "assignedAt", headerName: t("assignDate"),
			renderCell: (params: GridRenderCellParams) => {
				return (
					<Box sx={{ my: 1, mr: 1 }}>
						{params.row.createdAt !== null ? (new Date(params.row.createdAt).toLocaleString()) : 
						(<Chip label={t("currentlyAssigned")} color="success" />)}
					</Box>
				);
			},
			minWidth: 100, flex: 1,
		},
		{
			field: "unassignedAt", headerName: t("unassignDate"),
			renderCell: (params: GridRenderCellParams) => {
				return (
				<Box sx={{ my: 1, mr: 1 }}>
					{params.row.updatedAt !== null ? (
					new Date(params.row.updatedAt).toLocaleString()
					) : (
					<Chip label={t("currentlyAssigned")} color="success" />
					)}
				</Box>
				);
			},
			minWidth: 100, flex: 1,
		},
	];

	const getRequests = async () => {
		try {
			setLoad(true);
			const response: any = await getApiRequest();
			if (response !== null && response !== undefined) {
				if (response.code === 200 && response.data) {
					console.log("Requests fetched", response.data);
					setHistories(response.data.data.reverse());
					setLoad(false);
				} 
				else {
					setLoad(false);
				}
			}
		}
		catch (err: any) {
			console.log(err);
			setLoad(false);
		}
	};

	const getHistories = async () => {
		try {
			setLoad(true);
			const response: any = getApiRequest({query: {AssigneeId: Number(assigneeId)}});
			if (response !== null && response.code !== undefined && response.data !== undefined) {
				if (response.code === 200 && response.data) {
					console.log("Histories fetched", response.data);
					setLoad(false);
					setHistories(response.data.data);
				} 
				else {
					setLoad(false);
					enqueueSnackbar(t("errorHappened"), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top" }});
				}
			}
			else {
				setLoad(false);
			}
		}
		catch (err: any) {
			console.log(err);
			setLoad(false);
		}
	};

	const searchHistories = async () => {
		try {
			setLoad(true);
			const response: any = await getApiRequest({query: {AssigneeId: Number(assigneeId)}});
			if (response !== null && response.code !== undefined && response.data !== undefined) {
				if (response.code === 200 && response.data) {
					console.log("Search Histories fetched", response.data);
					setLoad(false);
					setHistories(response.data.data);
				} 
				else {
					setLoad(false);
					enqueueSnackbar(t("errorHappened"), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top" }});
				}
			}
			else {
				setLoad(false);
			}
		}
		catch (err: any) {
			console.log(err);
			setLoad(false);
		}
	};

	const getPriceOffers = async () => {
		try {
			setLoad(true);
			const response: any = getApiQuoteOffer()
			if (response !== null && response.code !== undefined) {
				if (response.code === 200 && response.data) {
					console.log("Offers fetched", response.data);
					setOffers(response.data.reverse());
					setLoad(false);
				} 
				else {
					console.log("Offers Not fetched", response.data);
					setLoad(false);
				}
			}
			else {
				setLoad(false);
			}
		}
		catch (err: any) {
			console.log(err);
			setLoad(false);
		}
	};

	return (
		<div style={{ background: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
			<SnackbarProvider />
			<Box py={2.5}>
				<Typography variant="h5" sx={{ mt: { xs: 4, md: 1.5, lg: 1.5 } }} px={5}>
					<b>{t("overviewTitle")}</b>
				</Typography>
				<Box>
					<Grid container spacing={1} px={5} mt={2}>
						<Grid size={{ xs: 12 }}>
						{!load ? (
							histories !== null && histories.length !== 0 ? (
							<Box sx={{ overflow: "auto" }}>
								<Grid container spacing={2} mt={3}>
									<Grid size={{ xs: 12, md: 5 }}>
										<Typography variant="h6" sx={{ mb: 2 }}>{t("Requests Per Assignee")}</Typography>
										<Box sx={{ width: "100%", height: "250px" }}>
											<RequestsPerAssigneeChart data={histories} />{" "}
										</Box>
									</Grid>
									<Grid size={{ xs: 12, md: 4 }}>
										<Typography variant="h6" sx={{ mb:2 }}>{t("Requests Processing Statuses")}</Typography>
										<Box sx={{ width: "100%", height: "300px" }}>
											<RequestsStatusPieChart data={histories} />{" "}
										</Box>
									</Grid>
									<Grid size={{ xs: 12, md: 3 }}>
										<Typography variant="h6" sx={{ mb: 2 }}>{t("Client Offers Statuses")}</Typography>
										<Box sx={{ width: "100%", height: "300px" }}>
											<OffersStatusPieChart data={offers} />{" "}
										</Box>
									</Grid>
								</Grid>
								<Box sx={{ mt: 8, bgcolor: "lightblue", p: 2, borderRadius: 1 }}>
									<Grid container spacing={2} alignItems="center">
										<Grid size={{ xs: 12, md: 2 }}>
											<InputLabel htmlFor="assignee" sx={inputLabelStyles}>{t("assigneeId")}</InputLabel>
											<BootstrapInput
												id="assignee" type="text" value={assigneeId}
												onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAssigneeId(e.target.value)} fullWidth
											/>
										</Grid>
										<Grid size={{ xs: 12, md: 2 }}>
											<InputLabel htmlFor="request" sx={inputLabelStyles}>{t("requestQuoteId")}</InputLabel>
											<BootstrapInput 
												id="request" type="text" value={requestQuoteId}
												onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRequestQuoteId(e.target.value)} fullWidth
											/>
										</Grid>
										<Grid size={{ xs: 12, md: 3 }}>
											<InputLabel htmlFor="assigned-date-start" sx={inputLabelStyles}>{t("assignDate")}</InputLabel>
											<LocalizationProvider dateAdapter={AdapterDayjs}>
												<DateTimePicker
													value={assignedDateStart}
													onChange={(value: any) => { setAssignedDateStart(value); }}
													slotProps={{
														textField: { id: "assigned-date-start", size: "small", fullWidth: true, sx: datetimeStyles},
														inputAdornment: { sx: { position: "relative", right: "11.5px" }},
													}}
												/>
											</LocalizationProvider>
										</Grid>
										<Grid size={{ xs: 12, md: 3 }}>
											<InputLabel htmlFor="assigned-date-end" sx={inputLabelStyles}>{t("unassignDate")}</InputLabel>
											<LocalizationProvider dateAdapter={AdapterDayjs}>
												<DateTimePicker
													value={assignedDateEnd}
													onChange={(value: any) => { setAssignedDateEnd(value); }}
													slotProps={{
														textField: { id: "assigned-date-end", size: "small", fullWidth: true, sx: datetimeStyles },
														inputAdornment: {
															sx: { position: "relative", right: "11.5px" },
														},
													}}
												/>
											</LocalizationProvider>
										</Grid>
										<Grid size={{ xs: 12, md: 2 }} mt={1} sx={{ display: "flex", alignItems: "end" }}>
											<Button
												variant="contained" color="inherit"
												startIcon={<SearchIcon />} size="large"
												sx={{ backgroundColor: "#fff", color: "#333", textTransform: "none", mb: 0.15 }}
												onClick={searchHistories} fullWidth
											>
												{t("search")}
											</Button>
										</Grid>
									</Grid>
								</Box>
								<Box sx={{ width: "100%", display: "table", tableLayout: "fixed", mt: 2}}>
									<DataGrid
										rows={histories}
										columns={columnsEvents}
										getRowId={(row: any) => row?.id}
										getRowHeight={() => "auto"}
										sx={gridStyles}
										disableRowSelectionOnClick
									/>
								</Box>
							</Box>) : (<Alert severity="warning">{t("noResults")}</Alert>)
						) : (<Skeleton sx={{ mt: 3 }} />)}
						</Grid>
					</Grid>
				</Box>
			</Box>
		</div>
	);
}

export default Histories;
