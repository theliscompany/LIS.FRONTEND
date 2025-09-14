import FlagIcon from '@mui/icons-material/Flag';
import AddCircleIcon from '@mui/icons-material/AddCircle'
import EditIcon from '@mui/icons-material/Edit'
import SyncIcon from '@mui/icons-material/Sync'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import {  useCallback, useEffect, useMemo, useState } from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import LensIcon from "@mui/icons-material/Lens"
import SearchIcon from "@mui/icons-material/Search"
// import { GetOrdersData, OrdersListDto, OrderStatusEnum } from '@api/client/shipment'; // TODO: Fix import path
import Badge from "@mui/material/Badge";
import { useQuery } from "@tanstack/react-query";
// import { getOrdersOptions } from '@api/client/shipment/@tanstack/react-query.gen'; // TODO: Fix import path
import Tooltip from "@mui/material/Tooltip";
import Stack from "@mui/material/Stack";
import Search from '@components/shipments/Search';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

// Types temporaires pour éviter les erreurs de build
enum OrderStatusEnum {
  CANCELLED = 'CANCELLED',
  CLOSED = 'CLOSED',
  COMPLETED = 'COMPLETED',
  DOCS_SENT = 'DOCS_SENT',
  VALIDATED = 'VALIDATED'
}

interface OrdersListDto {
  id: string;
  status?: OrderStatusEnum;
  [key: string]: any;
}

interface GetOrdersData {
  [key: string]: any;
}

// Mock function pour éviter les erreurs
const getOrdersOptions = (params: any) => ({
  queryKey: ['orders', params],
  queryFn: () => Promise.resolve({ orders: [], outgoing: 0, incoming: 0, margin: 0, averageMargin: 0, ratio: 0, displayBudgetDetails: false })
});

const drawerWidth = 240;

const getTextColor = (orderStatus?: OrderStatusEnum) => {
  let color;
  switch (orderStatus){
    case OrderStatusEnum.CANCELLED:
      color = "red";
      break;
    case OrderStatusEnum.CLOSED:
      color = "gray";
      break;
    case OrderStatusEnum.COMPLETED:
      color = "orange";
      break;
    case OrderStatusEnum.DOCS_SENT:
      color = "purple";
      break;
    case OrderStatusEnum.VALIDATED:
      color = "blue";
      break;
    default:
      color = "HighlightText";
      break;
  }

  return color
}


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

const dateFormatted = (value?: Date | null) => {

  if(!value) return "";

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

const columnHelper = createColumnHelper<OrdersListDto>()

const Shipments = () => {

  const [open, setOpen] = useState(false);
  const [displayBudgetDetails, setDisplayBudgetDetails] = useState(false)
  const [orderParams, setOrderParams] = useState<GetOrdersData>({
    query:{
      Fiscal: 2024//(new Date(Date.now()).getFullYear()),
      //Month: new Date(Date.now()).getMonth() + 1
  }})

  const columns = [
    columnHelper.accessor('exportation', {  
      header: '',
      size: 40, 
      cell: ({getValue}) => {
        const isExport = getValue() === null || getValue() === undefined || getValue() === true
        return (
          <Tooltip title={isExport ? "Export" : "Import"}>
            <Badge badgeContent={isExport ? "E" : "I"} color={isExport ? "success" : "warning"} sx={{ml:"20px"}}  /> 
          </Tooltip> )
      }
    }),
    columnHelper.accessor('orderStatus', {
      header: '',
      size: 15, 
      cell: ({getValue}) => {
        return getStatusColor(getValue())
      }
    }),
    columnHelper.accessor('orderNumber', {
      header: 'Number',
      size: 75, 
    }),
    columnHelper.accessor('orderDate', {
      header: 'Date',
      size: 70, 
      cell: ({getValue}) => dateFormatted(getValue())
    }),
    columnHelper.accessor('fiscalYear', {
      header: 'Fiscal',
      size: 45, 
    }),
    columnHelper.accessor('sellerName', {
      header: 'Seller',
    }),
    columnHelper.accessor('buyerName', {
      header: 'Buyer',
    }),
    columnHelper.accessor('customerName', {
      header: 'Customer',
    }),
    columnHelper.accessor('loadingPort', {
      header: 'Loading port',
    }),
    columnHelper.accessor('estimatedDepartureDate', {
      header: 'ETD',
      size: 70, 
      cell: ({getValue}) => dateFormatted(getValue())
    }),
    columnHelper.accessor('dischargePort', {
      header: 'Discharge port',
    }),
    columnHelper.accessor('estimatedArrivalDate', {
      header: 'ETA',
      size: 70, 
      cell: ({getValue}) => dateFormatted(getValue())
    }),
    columnHelper.accessor('shipName', {
      header: 'Ship',
    }),
    columnHelper.accessor('shippingLine', {
      header: 'Shipping Line',
    })
  ]

  

    const { data, refetch} = useQuery({
      ...getOrdersOptions(orderParams),
      enabled: false 
    })

    const table = useReactTable({
      data: data?.orders ?? [],
      columns,
      getCoreRowModel: getCoreRowModel(),
      getRowId: (row) => row.orderId?.toString() ?? "", 
    })

    const orders = useMemo(() => {
      setDisplayBudgetDetails(data?.displayBudgetDetails ?? false)
      return data?.orders ?? []
    }, [data])

    useEffect(() => {
      refetch()
    }, [orderParams])
    

    const handleDrawerClose = useCallback(
      () => {
        setOpen(false);
      },
      [open])
    
    const refetchShipmentsGrid = useCallback(
      (params:GetOrdersData, fiscalYearChecked: boolean, 
        monthChecked: boolean, statusChecked: boolean) => {
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
      }, [orderParams])
    
    
    return (
      <Paper sx={{ display: 'flex', height:'100%' }}>

        {/* <Main open={open}> */}
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
          

          <Stack>
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

            <TableContainer component={Paper}>
            <Table id="ordersTable" aria-label="Orders table" size='small' {
              ...{
                style: {
                  width: `${table.getCenterTotalSize()}px`,
                },
              }
            }>
              <TableHead>
                
                {
                  table.getHeaderGroups().map(headerGroup => (
                    <TableRow key={headerGroup.id} >
                      {
                        headerGroup.headers.map(header => (
                          <TableCell key={header.id} colSpan={header.colSpan} 
                          style={{width:`${header.getSize()}px`}} sx={{fontWeight: "bold"}}>
                            {header.isPlaceholder ? null : 
                              flexRender(
                                header.column.columnDef.header,
                                header.getContext())
                            }
                          </TableCell>
                        ))
                      }
                    </TableRow>
                  ))
                }
                
                
              </TableHead>
              <TableBody>
                {
                  table.getRowModel().rows.map(row => (
                    <TableRow key={row.id} sx={{color:"red"}}>
                      {
                        row.getVisibleCells().map(cell => (
                          <TableCell key={cell.id} sx={{fontSize:'0.75rem', color:getTextColor(row.original.orderStatus)}} >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext())}
                          </TableCell>
                        ))
                      }
                    </TableRow>
                  ))
                }
              </TableBody>
            </Table>
          </TableContainer>
          </Stack>

          
        {/* </Main> */}
        
        <Search open={open} closeDrawer={handleDrawerClose} reloadShipmentsGrid={refetchShipmentsGrid} 
        drawerWidth={drawerWidth} />
        
      </Paper>
    )
}

export default Shipments;