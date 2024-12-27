import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import { CategoryEnum, GetOrdersData, OrderRoleEnum, OrderStatusEnum } from "../../api/client/shipment";
import MenuItem from "@mui/material/MenuItem";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid2";
import Button from "@mui/material/Button";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Checkbox from "@mui/material/Checkbox";
import { styled, useTheme } from "@mui/material/styles";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import { useState } from "react";
import SearchIcon from "@mui/icons-material/Search"

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-start',
  }));

const months = [
  {
    text: "January",
    value:1
  },
  {
    text: "February",
    value:2
  },
  {
    text: "March",
    value:3
  },
  {
    text: "April",
    value:4
  },
  {
    text: "May",
    value:5
  },
  {
    text: "June",
    value:6
  },
  {
    text: "July",
    value:7
  },
  {
    text: "August",
    value:8
  },
  {
    text: "September",
    value:9
  },
  {
    text: "October",
    value:10
  },
  {
    text: "November",
    value:11
  },
  {
    text: "December",
    value:12
  },
]
  
const Search = ({open,drawerWidth, closeDrawer, reloadShipmentsGrid}:{open:boolean,drawerWidth:number, closeDrawer:()=>void,
    reloadShipmentsGrid: (params: GetOrdersData) => void }) => {

    const theme = useTheme();
    
    const [fiscalYearDisabled, setFiscalYearDisabled] = useState<boolean>(false)
    const [monthDisabled, setMonthDisabled] = useState<boolean>(false)
    const [statusDisabled, setStatusDisabled] = useState<boolean>(true)
    const [orderParams, setOrderParams] = useState<GetOrdersData>({query:{
        Fiscal: (new Date(Date.now()).getFullYear()),
        Month: new Date(Date.now()).getMonth() + 1,
        Status: OrderStatusEnum.OPEN
      }})
      

    return (
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
            },
          }}
          variant="persistent"
          anchor="right"
          open={open}
      >
        <DrawerHeader />
        <DrawerHeader>
          <IconButton onClick={closeDrawer}>
            {theme.direction === 'rtl' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <Stack spacing={1} m={2}>
           <FormControl fullWidth>
            <InputLabel id="userRole">User role</InputLabel>
            <Select size="small" labelId="userRole" label="User role" value={orderParams.query?.OrderRole ?? ""}
             onChange={(e: SelectChangeEvent<OrderRoleEnum>)=> setOrderParams(prev=> ({
              query: {
                ...prev.query,
                OrderRole: e.target.value as OrderRoleEnum
              }
            }))}>
              <MenuItem value="" />
              <MenuItem value={OrderRoleEnum.SAME_FOLDER}>SAME FOLDER</MenuItem>
              <MenuItem value={OrderRoleEnum.DOCUMENTATION}>DOCUMENTATION</MenuItem>
              <MenuItem value={OrderRoleEnum.INVOICE}>INVOICE</MenuItem>
              <MenuItem value={OrderRoleEnum.OPERATIONS}>OPERATIONS</MenuItem>
            </Select>
          </FormControl>
          <Autocomplete options={[]} disablePortal size="small"
          renderInput={(params) => <TextField {...params} label="User" />} />

          <FormControl fullWidth>
            <InputLabel id="object">Object</InputLabel>
            <Select size="small" labelId="object" label="Object" value={orderParams.query?.ContactType ?? CategoryEnum.CUSTOMERS}
            onChange={(e: SelectChangeEvent<CategoryEnum>)=> setOrderParams(prev=> ({
              query: {
                ...prev.query,
                ContactType: e.target.value as CategoryEnum
              }
            }))}>
              <MenuItem value={CategoryEnum.CUSTOMERS}>Customer</MenuItem>
              <MenuItem value={CategoryEnum.SUPPLIERS}>Supplier</MenuItem>
            </Select>
          </FormControl>
          <TextField size="small" label="Value" variant="outlined" />
          <Grid container spacing={1}> 
            <Grid size={10}>
              <TextField type="number" size="small" label="Fiscal" variant="outlined" disabled={fiscalYearDisabled}
              value={orderParams.query?.Fiscal} onChange={(e?:React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=>
                setOrderParams(prev=>({
                  query:{
                    ...prev.query,
                    Fiscal: e?.target.value as number | undefined
                  }
                }))
              } />
            </Grid>
            <Grid size={2}>
              <Checkbox checked={!fiscalYearDisabled} onChange={(_:any, checked: boolean)=> setFiscalYearDisabled(!checked)} size="small" />
            </Grid>
            <Grid size={10}>
              <FormControl fullWidth disabled={monthDisabled}>
                <InputLabel id="month">Month</InputLabel>
                <Select size="small" labelId="month" label="Month" value={orderParams.query?.Month}
                 onChange={(e:SelectChangeEvent<number>)=>setOrderParams(prev=>({
                  query:{
                    ...prev.query,
                    Month: e?.target.value as number | undefined
                  }
                }))}>
                  {
                    months.map(month=>(
                      <MenuItem key={month.value} value={month.value}>{month.text}</MenuItem>
                    ))
                  }
                </Select>
              </FormControl>
            </Grid>
            <Grid size={2}>
              <Checkbox size="small" checked={!monthDisabled}
              onChange={(_:any, checked: boolean)=> setMonthDisabled(!checked)} />
            </Grid>
            <Grid size={10}>
              <FormControl fullWidth disabled={statusDisabled}>
                <InputLabel id="status">Status</InputLabel>
                <Select size="small" labelId="status" label="Status" value={orderParams.query?.Status} 
                onChange={(e:SelectChangeEvent<OrderStatusEnum>)=>setOrderParams(prev=>({
                  query:{
                    ...prev.query,
                    Status: e?.target.value as OrderStatusEnum | undefined
                  }
                }))}>
                {
                  Object.keys(OrderStatusEnum) .filter(key => isNaN(Number(key))) // Only get the string keys 
                  .map((key) => ( 
                      <MenuItem key={key} value={OrderStatusEnum[key as keyof typeof OrderStatusEnum]}> 
                        {OrderStatusEnum[key as keyof typeof OrderStatusEnum]} 
                      </MenuItem> ))
                }
                </Select>
              </FormControl>
            </Grid>
            <Grid size={2}>
              <Checkbox size="small" checked={!statusDisabled} onChange={(_:any, checked: boolean)=> setStatusDisabled(!checked)} />
            </Grid>
          </Grid>
          

          <FormControl fullWidth>
            <InputLabel id="type">Type</InputLabel>
            <Select size="small" labelId="type" label="Type" value={orderParams.query?.Export} 
            onChange={(e: SelectChangeEvent<boolean>)=>setOrderParams(prev=>({
              query:{
                ...prev.query,
                Export: e?.target.value as boolean | undefined
              }
            }))}>
              <MenuItem value={undefined}>ALL</MenuItem>
              <MenuItem value="true">EXPORT</MenuItem>
              <MenuItem value="false">IMPORT</MenuItem>
            </Select>
          </FormControl>
          <LocalizationProvider dateAdapter={AdapterDayjs} >
            <DatePicker label="From" />
          </LocalizationProvider>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker label="To" />
          </LocalizationProvider>
          
          <Autocomplete options={[]} disablePortal size="small"
          renderInput={(params) => <TextField {...params} label="Loading" />} />

          <Autocomplete options={[]} disablePortal size="small"
          renderInput={(params) => <TextField {...params} label="Discharge" />} />

          <TextField size="small" label="Container number" />

          
        </Stack>

        <Stack justifyContent="flex-end">
          <Button style={{marginLeft:20, marginRight:20, marginBottom:20}} variant="contained" size="small" 
          onClick={()=>reloadShipmentsGrid(orderParams)}>
            <SearchIcon /> Search
          </Button>
        </Stack>
      </Drawer>
    )
}

export default Search;