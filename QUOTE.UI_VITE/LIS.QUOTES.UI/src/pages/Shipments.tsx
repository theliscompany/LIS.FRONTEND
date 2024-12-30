import FlagIcon from '@mui/icons-material/Flag';
import AddCircleIcon from '@mui/icons-material/AddCircle'
import EditIcon from '@mui/icons-material/Edit'
import SyncIcon from '@mui/icons-material/Sync'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { styled } from '@mui/material/styles';
import {  useEffect, useMemo, useState } from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import LensIcon from "@mui/icons-material/Lens"
import SearchIcon from "@mui/icons-material/Search"
import { GetOrdersData, OrdersListDto, OrderStatusEnum } from "../api/client/shipment";
import Badge from "@mui/material/Badge";
import { useQuery } from "@tanstack/react-query";
import { getOrdersOptions } from "../api/client/shipment/@tanstack/react-query.gen";
import Tooltip from "@mui/material/Tooltip";
import Stack from "@mui/material/Stack";
import Search from '../components/shipments/Search';
import { DataGrid } from '@mui/x-data-grid/DataGrid';
import { GridColDef } from '@mui/x-data-grid/models/colDef/gridColDef';
import { GridRenderCellParams } from '@mui/x-data-grid/models/params/gridCellParams';

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginRight: -drawerWidth,
  /**
   * This is necessary to enable the selection of content. In the DOM, the stacking order is determined
   * by the order of appearance. Following this rule, elements appearing later in the markup will overlay
   * those that appear earlier. Since the Drawer comes after the Main content, this adjustment ensures
   * proper interaction with the underlying content.
   */
  position: 'relative',
  variants: [
    {
      props: ({ open }) => open,
      style: {
        transition: theme.transitions.create('margin', {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
        marginRight: 0,
      },
    },
  ],
}));


const getStatusColor = (orderStatus?: OrderStatusEnum) => {
  let color, title;
  switch (orderStatus){
    case OrderStatusEnum.CANCELLED:
      color = "red";
      title = "CANCELLED"
      break;
    case OrderStatusEnum.CLOSED:
      color = "gray";
      title = "CLOSED"
      break;
    case OrderStatusEnum.COMPLETED:
      color = "orange";
      title = "COMPLETED"
      break;
    case OrderStatusEnum.DOCS_SENT:
      color = "purple";
      title = "DOCS SENT"
      break;
    case OrderStatusEnum.VALIDATED:
      color = "blue";
      title = "VALIDATED"
      break;
    default:
      color = "green";
      title = "OPENED"
      break;
  }

  return <Tooltip title={title}>
    <LensIcon fontSize="small" sx={{color:color, width:'0.75em', pt:"10px"}}/>
  </Tooltip>
}

const dateFormatted = (value?: string) => {

  if(!value) return "";

      var date = new Date(value)

      return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(date);
}

const columns: GridColDef<OrdersListDto>[] = [
  {
    width: 40,
    headerName: "",
    field: "exportation",
    renderCell: ({value}: GridRenderCellParams<any, boolean | null>) => {
        const isExport = value === null || value === undefined || value === true
        return (
          <Tooltip title={isExport ? "Export" : "Import"}>
            <Badge badgeContent={isExport ? "E" : "I"} color={isExport ? "success" : "warning"} sx={{ml:"20px"}}  /> 
          </Tooltip> )
        
    }
  },
  {
    width: 30,
    headerName: '',
    field: 'orderStatus',
    renderCell: ({value}: GridRenderCellParams<any, OrderStatusEnum>) => {
      return getStatusColor(value)
    }
  },
  {
    headerName: 'Number',
    field: 'orderNumber',
  },
  {
    headerName: 'Date',
    field: 'orderDate',
    valueFormatter: (value?: string) => dateFormatted(value)
  },
  {
    headerName: 'Fiscal',
    field: 'fiscalYear',
  },
  {
    headerName: 'Seller',
    field: 'sellerName',
  },
  {
    headerName: 'Buyer',
    field: 'buyerName',
  },
  {
    headerName: 'Customer',
    field: 'customerName',
  },
  {
    headerName: 'Loading port',
    field: 'loadingPort',
  },
  {
    headerName: 'ETD',
    field: 'estimatedDepartureDate',
    valueFormatter: (value?: string) => dateFormatted(value)
  },
  {
    headerName: 'Discharge port',
    field: 'dischargePort',
  },
  {
    headerName: 'ETA',
    field: 'estimatedArrivalDate',
    valueFormatter: (value?: string) => dateFormatted(value)
  },
  {
    headerName: 'Ship',
    field: 'shipName',
  },
  {
    headerName: 'Shipping Line',
    field: 'shippingLine',
  },
];


export interface GridData {
  columns: GridColDef[];
  rows: OrdersListDto[];
}



const Shipments = () => {

  const [open, setOpen] = useState(false);
  const [displayBudgetDetails, setDisplayBudgetDetails] = useState(false)
  const [orderParams, setOrderParams] = useState<GetOrdersData>({
    query:{
      Fiscal: (new Date(Date.now()).getFullYear()),
      Month: new Date(Date.now()).getMonth() + 1
  }})

    const { data, refetch} = useQuery({
      ...getOrdersOptions(orderParams),
      enabled: false 
    })

    const orders = useMemo(() => {
      setDisplayBudgetDetails(data?.displayBudgetDetails ?? false)
      return data?.orders ?? []
    }, [data])

    useEffect(() => {
      refetch()
    }, [orderParams])
    

    const handleDrawerClose = () => {
      setOpen(false);
    };
    
    const refetchShipmentsGrid = (params:GetOrdersData, fiscalYearChecked: boolean, 
      monthChecked: boolean, statusChecked: boolean ) => {

      if(!fiscalYearChecked && params.query){
        params.query.Fiscal = undefined;
      }

      if(!monthChecked && params.query){
        params.query.Month = undefined;
      }

      if(!statusChecked && params.query){
        params.query.Status = undefined;
      }
       
      setOrderParams(params)
    }
    
    return (
      <Paper sx={{ display: 'flex', height:'100%' }}>

        <Main open={open}>
          {
            displayBudgetDetails && 
          <Stack direction="row" p={2} justifyContent="space-between" border={1} borderRadius={4} borderColor="#bce8f1">
            <Typography fontSize={13} color="#f8ac58">Total : {orders.length} order(s)</Typography>
            <Typography fontSize={13} color="#2386c7">Outgoing : € {data?.outgoing ?? 0}</Typography>
            <Typography fontSize={13} color="#ed5565">Incoming : € {data?.incoming ?? 0}</Typography>
            <Typography fontSize={13} color="#31708f">Margin : € {data?.margin ?? 0}</Typography>
            <Typography fontSize={13} color="#31708f">Average Margin : € {data?.averageMargin ?? 0}</Typography>
            <Typography fontSize={13} color="#24c6c8">Ratio : {data?.ratio ?? 0} %</Typography>
            
          </Stack>
          }
          <Stack p={1} direction="row" justifyContent="space-between">
            <div>
              <Tooltip title="Set order's flag">
                <span>
                  <IconButton size="small" disabled aria-label="Set order's flag">
                    <FlagIcon color="error" fontSize="inherit" />
                  </IconButton>
                </span>
                
              </Tooltip>
              <Tooltip title="New shipment">
                <IconButton size="small" aria-label="New shipment">
                  <AddCircleIcon fontSize="inherit" color="success" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit shipment">
                <span>
                  <IconButton size="small" disabled aria-label="Edit shipment">
                    <EditIcon fontSize="inherit" sx={{color:"#f4da57"}} />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Refresh shipments">
                <IconButton size="small" aria-label="Refresh shipments">
                  <SyncIcon fontSize="inherit" color="primary" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Copy shipment">
                <span>
                  <IconButton size="small" disabled aria-label="Copy shipment">
                    <ContentCopyIcon fontSize="inherit" color="primary" />
                  </IconButton>
                </span>
              </Tooltip>
            </div>
            <IconButton aria-label="search" onClick={()=>setOpen(true)}>
              <SearchIcon />
            </IconButton>
          </Stack>

        <DataGrid getRowId={(row: OrdersListDto) => row.orderId ?? 0} rows={orders} columns={columns} 
          sx={{width:"100%", height:'95%'}} density='compact'  />
        </Main>
        
        <Search open={open} closeDrawer={handleDrawerClose} reloadShipmentsGrid={refetchShipmentsGrid} 
        drawerWidth={drawerWidth} />
        
      </Paper>
    )
}

export default Shipments;