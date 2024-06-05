import React, { useEffect, useState } from "react";
import {
  Chip,
  Box,
  Grid,
  Typography,
  Alert,
  Skeleton,
  Button,
  InputLabel,
} from "@mui/material";
import {
  BootstrapInput,
  datetimeStyles,
  gridStyles,
  inputLabelStyles,
} from "../utils/misc/styles";
import { SnackbarProvider, enqueueSnackbar } from "notistack";
import SearchIcon from "@mui/icons-material/Search";
import { protectedResources } from "../config/authConfig";
import { useAuthorizedBackendApi } from "../api/api";
import { BackendService } from "../utils/services/fetch";
import { Link } from "react-router-dom";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridValueFormatterParams,
} from "@mui/x-data-grid";
import { useAccount, useMsal } from "@azure/msal-react";
import { useTranslation } from "react-i18next"; // Import the useTranslation hook
import { RequestResponseDto, RequestDto, PriceOfferDto, PriceOfferResponseDto } from "../utils/models/models";
import RequestsPerAssigneeChart from "../utils/others/RequestsPerAssigneeChart";
import RequestsStatusPieChart from "../utils/others/RequestsStatusPieChart";
import OffersStatusPieChart from "../utils/others/OffersStatusPieChart"; // Import the pie chart component for offers

function createGetRequestUrl(
  startDate: Dayjs | null,
  endDate: Dayjs | null,
  assigneeId: string,
  requestQuoteId: string,
  requestStatus?: string
): string {
  let url = `${protectedResources.apiLisQuotes.endPoint}/Request?`;

  if (startDate) {
    url += `startDate=${encodeURIComponent(
      startDate.format("YYYY-MM-DDTHH:mm:ss")
    )}&`;
  }

  if (endDate) {
    url += `endDate=${encodeURIComponent(
      endDate.format("YYYY-MM-DDTHH:mm:ss")
    )}&`;
  }

  if (assigneeId) {
    url += `assigneeId=${encodeURIComponent(assigneeId)}&`;
  }

  if (requestQuoteId) {
    url += `requestQuoteId=${encodeURIComponent(requestQuoteId)}&`;
  }

  if (url.endsWith("&")) {
    url = url.slice(0, -1);
  }

  return url;
}

function Histories(props: any) {
  const [load, setLoad] = useState<boolean>(false);
  const [histories, setHistories] = useState<RequestDto[]>([]);
  const [offers, setOffers] = useState<PriceOfferDto[]>([]);
  const [requestQuoteId, setRequestQuoteId] = useState<string>("");
  const [assigneeId, setAssigneeId] = useState<string>("");
  const [assignedDateStart, setAssignedDateStart] = useState<Dayjs | null>(
    null
  );
  const [assignedDateEnd, setAssignedDateEnd] = useState<Dayjs | null>(null);

  const context = useAuthorizedBackendApi();
  const { instance, accounts } = useMsal();
  const account = useAccount(accounts[0] || {});
  const { t } = useTranslation(); // Use the useTranslation hook

  useEffect(() => {
    getRequests();
    getHistories();
    getPriceOffers();
  }, [account, instance, account]);

  const columnsEvents: GridColDef[] = [
    { field: "id", headerName: t("id"), minWidth: 100, flex: 0.5 },
    {
      field: "requestQuoteId",
      headerName: t("requestQuoteId"),
      renderCell: (params: GridRenderCellParams) => {
        return (
          <Box>
            <Link to={"/admin/request/" + params.row.id}>
              {params.row.id}
            </Link>
          </Box>
        );
      },
      minWidth: 100,
      flex: 0.5,
    },
    {
      field: "assigneeId",
      headerName: t("assigneeId"),
      renderCell: (params: GridRenderCellParams) => {
        return (
          <Box>
            {params.row.assigneeId !== null
              ? params.row.assigneeId
              : "Not defined"}
          </Box>
        );
      },
      minWidth: 250,
      flex: 1,
    },
    {
      field: "assignedAt",
      headerName: t("assignDate"),
      renderCell: (params: GridRenderCellParams) => {
        return (
          <Box sx={{ my: 1, mr: 1 }}>
            {params.row.createdAt !== null ? (
              new Date(params.row.createdAt).toLocaleString()
            ) : (
              <Chip label={t("currentlyAssigned")} color="success" />
            )}
          </Box>
        );
      },
      minWidth: 100,
      flex: 1,
    },
    {
      field: "unassignedAt",
      headerName: t("unassignDate"),
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
      minWidth: 100,
      flex: 1,
    },
  ];

  const getRequests = async () => {
    if (account && instance && context) {
      setLoad(true);
      const response: RequestResponseDto = await (
        context?.service as BackendService<any>
      ).getWithToken(
        `${protectedResources.apiLisQuotes.endPoint}/Request`,
        context.tokenLogin
      );
      if (response !== null && response.code !== undefined) {
        if (response.code === 200 && response.data) {
          console.log("Requests fetched", response.data);
          setHistories(response.data.reverse());
          setLoad(false);
        } else {
          setLoad(false);
        }
      }
    }
  };

  const getHistories = async () => {
    if (account && instance && context) {
      setLoad(true);
      const requestFormatted = createGetRequestUrl(
        assignedDateStart,
        assignedDateEnd,
        assigneeId,
        requestQuoteId
      );
      const response: RequestResponseDto = await (
        context?.service as BackendService<any>
      ).getWithToken(requestFormatted, context.tokenLogin);
      if (
        response !== null &&
        response.code !== undefined &&
        response.data !== undefined
      ) {
        if (response.code === 200 && response.data) {
          console.log("Histories fetched", response.data);
          setLoad(false);
          setHistories(response.data);
        } else {
          setLoad(false);
          enqueueSnackbar(t("errorHappened"), {
            variant: "error",
            anchorOrigin: { horizontal: "right", vertical: "top" },
          });
        }
      }
    }
  };

  const searchHistories = async () => {
    if (account && instance && context) {
      setLoad(true);
      const requestFormatted = createGetRequestUrl(
        assignedDateStart,
        assignedDateEnd,
        assigneeId,
        requestQuoteId,
      );
      const response: RequestResponseDto = await (
        context?.service as BackendService<any>
      ).getWithToken(requestFormatted, context.tokenLogin);
      if (
        response !== null &&
        response.code !== undefined &&
        response.data !== undefined
      ) {
        if (response.code === 200 && response.data) {
          console.log("Search Histories fetched", response.data);
          setLoad(false);
          setHistories(response.data);
        } else {
          setLoad(false);
          enqueueSnackbar(t("errorHappened"), {
            variant: "error",
            anchorOrigin: { horizontal: "right", vertical: "top" },
          });
        }
      }
    }
  };

  const getPriceOffers = async () => {
    if (account && instance && context) {
      setLoad(true);
      const response: PriceOfferResponseDto = await (
        context?.service as BackendService<any>
      ).getWithToken(
        `${protectedResources.apiLisOffer.endPoint}/QuoteOffer`,
        context.tokenLogin
      );
      if (response !== null && response.code !== undefined) {
        if (response.code === 200 && response.data) {
          console.log("Offers fetched", response.data);
          setOffers(response.data.reverse());
          setLoad(false);
        } else {
            console.log("Offers Not fetched", response.data);
          setLoad(false);
        }
      }
    }
  };

  return (
    <div
      style={{
        background: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      }}
    >
      <SnackbarProvider />
      <Box py={2.5}>
        <Typography
          variant="h5"
          sx={{ mt: { xs: 4, md: 1.5, lg: 1.5 } }}
          px={5}
        >
          <b>{t("overviewTitle")}</b>
        </Typography>
        <Box>
          <Grid container spacing={1} px={5} mt={2}>
            <Grid item xs={12}>
              {!load ? (
                histories !== null && histories.length !== 0 ? (
                  <Box sx={{ overflow: "auto" }}>
                    <Grid container spacing={2} mt={3}>
                      <Grid item xs={12} md={5}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          {t("Requests Per Assignee")}
                        </Typography>
                        <Box sx={{ width: "100%", height: "250px" }}>
                          <RequestsPerAssigneeChart data={histories} />{" "}
                          {/* Add your bar chart component here */}
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="h6" sx={{ mb:2 }}>
                          {t("Requests Processing Statuses")}
                        </Typography>
                        <Box sx={{ width: "100%", height: "300px" }}>
                          <RequestsStatusPieChart data={histories} />{" "}
                          {/* Add your pie chart component here */}
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          {t("Client Offers Statuses")}
                        </Typography>
                        <Box sx={{ width: "100%", height: "300px" }}>
                          <OffersStatusPieChart data={offers} />{" "}
                          {/* Add your pie chart component here */}
                        </Box>
                      </Grid>
                    </Grid>
                    <Box
                      sx={{ mt: 8, bgcolor: "lightblue", p: 2, borderRadius: 1 }}
                    >
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={2}>
                          <InputLabel htmlFor="assignee" sx={inputLabelStyles}>
                            {t("assigneeId")}
                          </InputLabel>
                          <BootstrapInput
                            id="assignee"
                            type="text"
                            value={assigneeId}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) => setAssigneeId(e.target.value)}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} md={2}>
                          <InputLabel htmlFor="request" sx={inputLabelStyles}>
                            {t("requestQuoteId")}
                          </InputLabel>
                          <BootstrapInput
                            id="request"
                            type="text"
                            value={requestQuoteId}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) => setRequestQuoteId(e.target.value)}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <InputLabel
                            htmlFor="assigned-date-start"
                            sx={inputLabelStyles}
                          >
                            {t("assignDate")}
                          </InputLabel>
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DateTimePicker
                              value={assignedDateStart}
                              onChange={(value: any) => {
                                setAssignedDateStart(value);
                              }}
                              slotProps={{
                                textField: {
                                  id: "assigned-date-start",
                                  fullWidth: true,
                                  sx: datetimeStyles,
                                },
                                inputAdornment: {
                                  sx: { position: "relative", right: "11.5px" },
                                },
                              }}
                            />
                          </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <InputLabel
                            htmlFor="assigned-date-end"
                            sx={inputLabelStyles}
                          >
                            {t("unassignDate")}
                          </InputLabel>
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DateTimePicker
                              value={assignedDateEnd}
                              onChange={(value: any) => {
                                setAssignedDateEnd(value);
                              }}
                              slotProps={{
                                textField: {
                                  id: "assigned-date-end",
                                  fullWidth: true,
                                  sx: datetimeStyles,
                                },
                                inputAdornment: {
                                  sx: { position: "relative", right: "11.5px" },
                                },
                              }}
                            />
                          </LocalizationProvider>
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          md={2}
                          mt={1}
                          sx={{ display: "flex", alignItems: "end" }}
                        >
                          <Button
                            variant="contained"
                            color="inherit"
                            startIcon={<SearchIcon />}
                            size="large"
                            sx={{
                              backgroundColor: "#fff",
                              color: "#333",
                              textTransform: "none",
                              mb: 0.15,
                            }}
                            onClick={searchHistories}
                            fullWidth
                          >
                            {t("search")}
                          </Button>
                        </Grid>
                      </Grid>
                    </Box>
                    <Box
                      sx={{
                        width: "100%",
                        display: "table",
                        tableLayout: "fixed",
                        mt: 2,
                      }}
                    >
                      <DataGrid
                        rows={histories}
                        columns={columnsEvents}
                        getRowId={(row: any) => row?.id}
                        getRowHeight={() => "auto"}
                        sx={gridStyles}
                        disableRowSelectionOnClick
                      />
                    </Box>
                  </Box>
                ) : (
                  <Alert severity="warning">{t("noResults")}</Alert>
                )
              ) : (
                <Skeleton sx={{ mt: 3 }} />
              )}
            </Grid>
          </Grid>
        </Box>
      </Box>
    </div>
  );
}

export default Histories;
