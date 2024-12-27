import { TableVirtuoso, TableComponents } from 'react-virtuoso';
import FlagIcon from '@mui/icons-material/Flag';
import AddCircleIcon from '@mui/icons-material/AddCircle'
import EditIcon from '@mui/icons-material/Edit'
import SyncIcon from '@mui/icons-material/Sync'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { styled } from '@mui/material/styles';
import { useEffect, useState } from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import LensIcon from "@mui/icons-material/Lens"
import SearchIcon from "@mui/icons-material/Search"
import React from "react";
import { GetOrdersData, OrderStatusEnum, ResponseOrdersListDto } from "../api/client/shipment";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Badge from "@mui/material/Badge";
import { useQuery } from "@tanstack/react-query";
import { getOrdersOptions } from "../api/client/shipment/@tanstack/react-query.gen";
import Tooltip from "@mui/material/Tooltip";
import Stack from "@mui/material/Stack";
import Search from '../components/shipments/Search';

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



const dateFormatted = (dateString?: string) => {

  if(!dateString) return ''

  const date = new Date(dateString);

    // Get day, month, and year
  const day = String(date.getDate()).padStart(2, '0');  // Ensures day is two digits
  const month = String(date.getMonth() + 1).padStart(2, '0');  // Months are zero-based, add 1
  const year = date.getFullYear();

  // Format as dd/mm/YYYY
  return `${day}/${month}/${year}`;
}

const getStatusColor = (orderStatus?: OrderStatusEnum) => {
  switch (orderStatus){
    case OrderStatusEnum.CANCELLED:
      return "red";
    case OrderStatusEnum.CLOSED:
      return "gray";
    case OrderStatusEnum.COMPLETED:
      return "orange";
    case OrderStatusEnum.DOCS_SENT:
      return "purple";
    case OrderStatusEnum.VALIDATED:
      return "blue"
    default:
      return "black"
  }
}

interface ColumnData {
  dataKey: keyof ResponseOrdersListDto;
  label: string;
  width?: number | string;
  type?: 'numeric' | 'Date'
}

const columns: ColumnData[] = [
  {
    width: 80,
    label: 'Number',
    dataKey: 'orderNumber',
  },
  {
    width: 50,
    label: 'Date',
    dataKey: 'orderDate',
    type: 'Date'
  },
  {
    width: 50,
    label: 'Fiscal',
    dataKey: 'fiscalYear',
    type: 'numeric',
  },
  {
    width: 150,
    label: 'Seller',
    dataKey: 'sellerName',
  },
  {
    width: 150,
    label: 'Buyer',
    dataKey: 'buyerName',
  },
  {
    width: 150,
    label: 'Customer',
    dataKey: 'customerName',
  },
  {
    width: 230,
    label: 'Loading port',
    dataKey: 'loadingPort',
  },
  {
    width: 50,
    label: 'ETD',
    dataKey: 'estimatedDepartureDate',
    type: 'Date'
  },
  {
    width: 130,
    label: 'Discharge port',
    dataKey: 'dischargePort',
  },
  {
    width: 50,
    label: 'ETA',
    dataKey: 'estimatedArrivalDate',
    type: 'Date'
  },
  {
    width: 130,
    label: 'Ship',
    dataKey: 'shipName',
  },
  {
    width: 130,
    label: 'Shipping Line',
    dataKey: 'shippingLine',
  },
];

const VirtuosoTableComponents: TableComponents<ResponseOrdersListDto> = {
  Scroller: React.forwardRef<HTMLDivElement>((props, ref) => (
    <TableContainer component={Paper} {...props} ref={ref} />
  )),
  Table: (props) => (
    <Table size="small" {...props} sx={{ borderCollapse: 'separate', tableLayout: 'fixed' }} />
  ),
  TableHead: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
    <TableHead {...props} ref={ref} />
  )),
  TableRow,
  TableBody: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
    <TableBody {...props} ref={ref} />
  )),
};

const fixedHeaderContent = () => {
  return (
    <TableRow>
      <TableCell width={30} sx={{backgroundColor: 'background.paper'}} variant="head" />
      <TableCell width={20} sx={{backgroundColor: 'background.paper'}} variant="head" />
      {columns.map((column) => (
        <TableCell
          key={column.dataKey}
          variant="head"
          align={column.type === 'numeric' || false ? 'right' : 'left'}
          width={ column.width }
          sx={{ backgroundColor: 'background.paper' }}
        >
          {column.label}
        </TableCell>
      ))}
    </TableRow>
  );
}

const rowContent = (_index: number, row: ResponseOrdersListDto) => {
  const color = getStatusColor(row.orderStatus)
  return (
    <React.Fragment>
      <TableCell align="center">
        {row.exportation === null || row.exportation === undefined ||row.exportation ? 
        <Badge badgeContent="E" color="success" sx={{mr:"13px", mb:"10px"}} /> : 
        <Badge badgeContent="I" color="warning" sx={{mr:"13px", mb:"10px"}} /> }
        <LensIcon fontSize="small" sx={{color:color, width:'0.75em'}}/>
      </TableCell>
      <TableCell align="center" />
      {columns.map((column) => (
        <TableCell
        style={{color:color}}
          key={column.dataKey}
          align={column.type === 'numeric' || false ? 'right' : 'left'}>
          {
            column.type === 'Date' ?
            dateFormatted(row[column.dataKey]?.toString()) : row[column.dataKey]?.toString()
          }
        </TableCell>
      ))}
    </React.Fragment>
  );
}



const Shipments = () => {

  const [open, setOpen] = useState(false);
  const [orderParams, setOrderParams] = useState<GetOrdersData>({query:{
    Fiscal: (new Date(Date.now()).getFullYear()),
    Month: new Date(Date.now()).getMonth() + 1
  }})

    const { data, refetch} = useQuery({
      ...getOrdersOptions(orderParams),
      enabled: false 
    })

    useEffect(() => {
      refetch()
    }, [orderParams])
    

    const handleDrawerClose = () => {
      setOpen(false);
    };
    
    const refetchShipmentsGrid = (params:GetOrdersData) => {
      setOrderParams(params)
    }
    
    return (
      <Paper sx={{ display: 'flex', height:'100%' }}>

        <Main open={open}>
          
          <Stack direction="row" p={2} justifyContent="space-between" border={1} borderRadius={4} borderColor="#bce8f1">
            <Typography fontSize={13} color="#f8ac58">Total : 1 order(s)</Typography>
            <Typography fontSize={13} color="#2386c7">Outgoing : € 6500.00</Typography>
            <Typography fontSize={13} color="#ed5565">Incoming : € 5045.07</Typography>
            <Typography fontSize={13} color="#31708f">Margin : € 1454.93</Typography>
            <Typography fontSize={13} color="#31708f">Average Margin : € 1454.93</Typography>
            <Typography fontSize={13} color="#24c6c8">Ratio : 22.38 %</Typography>
            
          </Stack>
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
          <TableVirtuoso
            data={data}
            components={VirtuosoTableComponents}
            fixedHeaderContent={fixedHeaderContent}
            itemContent={rowContent}
          />
        </Main>
        
        <Search open={open} closeDrawer={handleDrawerClose} reloadShipmentsGrid={refetchShipmentsGrid} 
        drawerWidth={drawerWidth} />
        
      </Paper>
    )
}

export default Shipments;