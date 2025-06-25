import { Alert, Autocomplete, Box, Breadcrumbs, Button, ButtonGroup, Card, CardContent, CardHeader, Checkbox, Chip, Divider, FormControl, 
    FormHelperText, IconButton, InputLabel, ListItemText, MenuItem, OutlinedInput, Paper, Select, SelectChangeEvent, 
    Stack, TextField, Typography } from "@mui/material"
import Grid from "@mui/material/Grid2"
import { ContactViewModel } from "../../../api/client/crm"
import { ChangeEvent, useEffect, useState } from "react"
import { MuiTelInput } from "mui-tel-input"
import { CityViewModel } from "../../../api/client/masterdata"
import AddCircle from "@mui/icons-material/AddCircle"
import { Cancel, Check, CheckBox, CheckBoxOutlineBlank, ChevronRight, DeleteForever } from "@mui/icons-material"
import EditableTable from "../../common/EditableTable"
import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { CargoDetailsViewModel, HSCodeViewModel, RequestQuoteProductViewModel, RequestQuoteViewModel, StatusEnum } from "../../../api/client/quote"
import { Controller, useForm } from "react-hook-form"
import { useConfirmDialog } from "../../../hooks/useConfirmDialog"
import React from "react"
import { Link, useParams } from "react-router-dom"
import Save from "@mui/icons-material/Save"
import { GraphUser, useNewRequestQuote } from "./useNewRequestQuote"
import { useHelpers } from "../../../hooks/useHelpers"
import { getApiRequestByIdOptions } from "../../../api/client/quote/@tanstack/react-query.gen"
import SpinningIcon from "../../common/SpinningIcon"

const columnHelper = createColumnHelper<CargoDetailsViewModel>()
const icon = <CheckBoxOutlineBlank fontSize="small" />;
const checkedIcon = <CheckBox fontSize="small" />;

const Request = () => {

    const { id } = useParams();

    const [customer, setCustomer] = useState<ContactViewModel | null>(null)
    const [cityFrom, setCityFrom] = useState<CityViewModel | null>(null)
    const [cityTo, setCityTo] = useState<CityViewModel | null>(null)
    const [isLoading, setIsLoading] = useState(!!id)
    
    const { confirm, ConfirmDialogComponent } = useConfirmDialog();
    const { isNullOrEmpty } = useHelpers()

    useEffect(() => {
        getRequestQuote();
    }, [])

    const { handleSubmit, control, register,reset, formState: { errors, isSubmitting }, watch, setValue, getValues } = useForm<RequestQuoteViewModel>({
        defaultValues:{
            requestQuoteId:id
        }
    })

    const { 
        allSelectedServices, editingRowIndex, cargoDetailsAdded, cities, customers, HsCodes, 
        isLoadingCities, isLoadingCustomers, members, packages,queryClient, rowDraftRef,
        getTable, handleAddProducts, handleCancelRow, handleGetRowsSelected,
        handleValidRow, onSubmit, reFillRequestTable, setCargoDetailsAdded
    } = useNewRequestQuote({requestQuoteId: watch('requestQuoteId'),setValue})

    useEffect(() => {
      setValue('cargoDetails',cargoDetailsAdded) 
    }, [cargoDetailsAdded])

    const watchFields = watch(['requestQuoteId', 'departureId', 'arrivalId', 'customerId']);

    useEffect(() => {
      if (watch('requestQuoteId')){
        if (watch('departureId') && !cityFrom && cities) {
            setCityFrom(cities.find(x => x.id === watch('departureId')) ?? null)
        }
        if (watch('arrivalId') && !cityTo && cities) {
            setCityTo(cities.find(x => x.id === watch('arrivalId')) ?? null)
        }
        if (watch('customerId') && !customer && customers) {
            setCustomer(customers.data?.find(x => x.contactId === watch('customerId')) ?? null)
        }
      } 
    }, [watchFields, cities, customers])

    const getRequestQuote = async () => {
        const id = getValues('requestQuoteId');
        if (!id) return;

        const data = await queryClient.fetchQuery({
            ...getApiRequestByIdOptions({
                path: {
                    id: id
                }
            })
        })

        reset(data)
        setCargoDetailsAdded(data.cargoDetails ?? [])
        setIsLoading(false)
    }

    const columns: ColumnDef<CargoDetailsViewModel, any>[] = [
        columnHelper.display({
            id: 'select',
            header: ({table})=> (
                <Checkbox size="small"
                    {...{ 
                        checked: table.getIsAllRowsSelected(),
                        indeterminate: table.getIsSomeRowsSelected(),
                        onChange: table.getToggleAllRowsSelectedHandler()
                    }}/>
            ),
            cell: ({row}) => (
                <Checkbox size="small" 
                {...{
                    checked: row.getIsSelected(),
                    disabled: !row.getCanSelect(),
                    indeterminate: row.getIsSomeSelected(),
                    onChange: row.getToggleSelectedHandler()
                }} />
            )
        }),
        columnHelper.accessor('products', {
            header: "Products",
            cell: ({ row, getValue }) => {
                
                if(editingRowIndex === row.index){
                    return (
                        <Autocomplete fullWidth multiple size="small" options={HsCodes?.sort((a,b)=> a.productName?.localeCompare(b.productName ?? '') ?? 0) ?? []} 
                            disableCloseOnSelect getOptionLabel={(option) => option.productName ?? ''} 
                            onChange={(_:any,produts: HSCodeViewModel[])=>{
                                rowDraftRef.current = {
                                    ...rowDraftRef.current,
                                    products: produts.map(item=> {
                                        return {
                                            productId: item.productId,
                                            productName: item.productName
                                        } as RequestQuoteProductViewModel
                                    } )
                                };
                            }}
                            renderOption={(props, option, { selected })=>{
                                const { key, ...optionProps } = props;

                                return (
                                    <li key={key} {...optionProps}>
                                        <Checkbox icon={icon} checkedIcon={checkedIcon}
                                        style={{ marginRight: 8 }} checked={selected} />
                                        {option.productName}
                                    </li>
                                )
                            }}
                            style={{ minWidth: 200 }}
                            renderInput={(params) => (
                                <TextField {...params} label="Products" placeholder="Favorites" />
                            )} />
                     )
                }
                const chipProducts = getValue<RequestQuoteProductViewModel[] | null | undefined>()?.map(item=>(
                    <Chip label={item.productName} key={item.productId} size="small" />
                ))
                return <Stack direction='row' spacing={1}>{chipProducts}</Stack>
            }
        }),
        columnHelper.accessor('packageName', {
            header: "Container",
            cell: ({row})=> {
                const [local, setlocal] = useState(row.original.packageId)
                if(editingRowIndex === row.index){
                    return (
                    <FormControl fullWidth>
                        <Select displayEmpty size='small' value={local ?? ''} input={<OutlinedInput />}
                            onChange={(e?: SelectChangeEvent<number>)=>{
                                if(!rowDraftRef.current) return;
                                
                                const packageId = e ? Number(e.target.value) : undefined;
                                const selectedContainer = packages?.find((x) => x.packageId === packageId);

                                setlocal(packageId)
                                
                                rowDraftRef.current = {
                                    ...rowDraftRef.current,
                                    packageId: packageId,
                                    packageName: selectedContainer?.packageName
                                };
                            }}>
                            {
                                (packages ?? []).map((opt) => (
                                    <MenuItem key={opt.packageId} value={opt.packageId}>
                                        <ListItemText primary={opt.packageName} />
                                    </MenuItem>
                                ))
                            }
                        </Select>
                    </FormControl> )
                }
                return  row.original.packageName ?? ''
            }
        }),
        columnHelper.accessor('quantity', {
            header: "Quantity",
            cell: ({row})=> {
                const [local, setlocal] = useState(row.original.quantity ?? 0)
                if(editingRowIndex === row.index){
                    return <TextField type="number" size="small" value={local}
                    onChange={(e?: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
                        {
                            if (rowDraftRef.current) {
                                setlocal(e ? Number(e.target.value) : 0)
                                rowDraftRef.current = {
                                    ...rowDraftRef.current,
                                    quantity: e ? Number(e.target.value) : 0
                                };
                            }
                        }
                    }  />
                }
                return row.original.quantity ?? 0
            }
        }),
        columnHelper.display({
            id:"option",
            cell: ({row}) => 
                editingRowIndex === row.index ? (
                <Box>
                    <IconButton size="small" color="success" onClick={handleValidRow}>
                        <Check />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={()=>handleCancelRow(row.index)}>
                        <Cancel />
                    </IconButton>
                </Box>
            ) : null
        })
    ]

    const handleDeleteRowsTable = async () => {
        const confirmResult = await confirm(
            'Delete products',
            `Are you sure you want to delete products and package selected ? This action cannot be undone.`
        );
        
        if (confirmResult) {
            reFillRequestTable()
        }
    }
    
    return (
        <React.Fragment>
            <Breadcrumbs separator={<ChevronRight fontSize='small' />} aria-label="breadcrumb">
                <Link to="/requests">
                    <span>Requests quote</span>
                </Link>
                <Typography key="3" sx={{ color: 'text.primary' }}>
                    {watch('requestQuoteId') ? watch('trackingNumber') : "(New)"}
                </Typography>
            </Breadcrumbs>
            {
                isLoading ? 
                <Stack direction='row' alignItems='center' justifyContent='center'>
                    <SpinningIcon />
                    <span style={{ marginLeft: 8 }}>Chargement...</span>
                </Stack> :
                <>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Grid container spacing={2}>
                            <Grid size={6}>
                                <Card sx={{mt:2}}>
                                    <CardHeader title="Customer information" sx={{pb:0}} />
                                    <CardContent>
                                        <Grid container spacing={2}> 
                                            
                                            <Grid size={12}>
                                                <Controller name='customerId' control={control} rules={{ required: "Select customer" }}
                                                    render={({ field }) => 
                                                        <Autocomplete {...field} fullWidth size='small' value={customer} options={customers?.data ?? []}
                                                            getOptionLabel={(option) => option.contactName ?? ''} loading={isLoadingCustomers}
                                                            onChange={(_, value: ContactViewModel | null) => {
                                                                field.onChange(value?.contactId);
                                                                setValue('customerName', value?.contactName ?? '')
                                                                setValue('cellPhone', value?.celPhone)
                                                                setValue('email', value?.email)
                                                                setCustomer(value)
                                                            }}
                                                            renderOption={(props, option) => (
                                                                <li {...props} key={props.id}>
                                                                    {option.contactName ?? ''}
                                                                </li>
                                                            )}
                                                            renderInput={(params) => (
                                                                <TextField {...params} label="Customer" 
                                                                    error={!!errors.customerId}
                                                                    helperText={errors.customerId?.message} />)} />
                                                    } />
                                                
                                            </Grid>
                                            <Grid size={6}>
                                                <MuiTelInput disabled size="small" value={!isNullOrEmpty(customer?.celPhone) ? (customer?.celPhone ?? "+32") : "+32"} label="Cell phone" fullWidth />
                                            </Grid>
                                            <Grid size={6}>
                                                <TextField value={customer?.email ?? ''} disabled size="small" fullWidth />
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid size={6}>
                                <Card sx={{mt:2}}>
                                    <CardHeader title="Manage" sx={{pb:0}} />
                                    <CardContent>
                                        <Grid container spacing={2}> 
                                            <Grid size={4}>
                                                <FormControl fullWidth size="small">
                                                    <InputLabel>Status</InputLabel>
                                                    <Select label="Status" value={watch("status") ?? StatusEnum.NEW} 
                                                        {...register('status', {required:'Select status'})} 
                                                        onChange={(e: SelectChangeEvent<StatusEnum>) => {
                                                            setValue("status", e.target.value as StatusEnum)
                                                        }}>
                                                        <MenuItem value={StatusEnum.NEW}>{StatusEnum.NEW}</MenuItem>
                                                        <MenuItem value={StatusEnum.PENDING}>{StatusEnum.PENDING}</MenuItem>
                                                        <MenuItem value={StatusEnum.VALID}>{StatusEnum.VALID}</MenuItem>
                                                        <MenuItem value={StatusEnum.BLOCKED}>{StatusEnum.BLOCKED}</MenuItem>
                                                        <MenuItem value={StatusEnum.REJECT}>{StatusEnum.REJECT}</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            <Grid size={12}>
                                                <FormControl fullWidth size="small" error={!!errors.assignee}>
                                                    <InputLabel>Assign</InputLabel>
                                                    <Select label="Assign" value={getValues("assignee") ?? ''} {...register("assignee", {required: "Assign to a team member"})} 
                                                        onChange={(e: SelectChangeEvent<string>) => {
                                                            setValue("assignee", e.target.value)
                                                            setValue("assigneeName", members.find(x=>x.id === e.target.value)?.displayName)
                                                        }}>
                                                    {
                                                        members.map((member: GraphUser)=>(
                                                            <MenuItem key={member.id} value={member.id}>{member.displayName}</MenuItem>
                                                        ))
                                                    } 
                                                    </Select>
                                                    {
                                                        errors.assignee && <FormHelperText>{errors.assignee.message}</FormHelperText>
                                                    }
                                                </FormControl>
                                                
                                            </Grid>
                                            
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                        
                        <Paper sx={{p:2, mt:2}}>
                            <Typography variant="h6" gutterBottom>Request</Typography>
                            <Divider sx={{mb:2}} />
                            <Grid container spacing={2}> 
                                <Grid size={6}>
                                    <Controller name='departureId' control={control} rules={{ required: "Select departure" }}
                                        render={({ field }) => 
                                            <Autocomplete fullWidth size="small" value={cityFrom} options={cities ?? []} 
                                                getOptionLabel={(opt) => `${opt.name}, ${opt.country?.toUpperCase()}` } 
                                                renderOption={(props, opt) => (
                                                    <li {...props} key={props.id}>{`${opt.name}, ${opt.country?.toUpperCase()}`}</li>
                                                )} 
                                                renderInput={(params) => (
                                                    <TextField {...params} label="From" 
                                                        error={!!errors.departureId}
                                                        helperText={errors.departureId?.message} />
                                                )} 
                                                onChange={(_, value: CityViewModel | null) => {
                                                    setCityFrom(value)
                                                    field.onChange(value?.id);
                                                    setValue('departure', value?.name ?? '')
                                                }} loading={isLoadingCities} />
                                        } />
                                    
                                </Grid>
                                <Grid size={6}>
                                    <Controller name='arrivalId' control={control} rules={{ required: "Select arrival" }}
                                        render={({ field }) =>
                                            <Autocomplete fullWidth size="small" value={cityTo} options={cities ?? []} 
                                                getOptionLabel={(opt) => `${opt.name}, ${opt.country?.toUpperCase()}` } 
                                                renderOption={(props, opt) => (
                                                    <li {...props} key={props.id}>{`${opt.name}, ${opt.country?.toUpperCase()}`}</li>
                                                )} 
                                                renderInput={(params) => (
                                                    <TextField {...params} label="To" 
                                                        error={!!errors.arrivalId}
                                                        helperText={errors.arrivalId?.message} />
                                                )} 
                                                onChange={(_, value: CityViewModel | null) => {
                                                    setCityTo(value)
                                                    field.onChange(value?.id);
                                                    setValue('arrival', value?.name ?? '')
                                                }} loading={isLoadingCities} />
                                        } />
                                    
                                </Grid>
                                <Grid size={12}>
                                    <TextField value={watch('comment') ?? undefined} fullWidth multiline label="Other details about the request (Optional)" 
                                        onChange={(e?:ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=> setValue('comment', e?.target.value)} />
                                </Grid>
                                <Grid size={12}>
                                    <Paper sx={{p:2, backgroundColor:"#00404533"}}>
                                        <Stack direction="row" alignItems="center" justifyContent="space-between" >
                                            <ButtonGroup color='info' variant='text' size='small' aria-label='text button group'>
                                                <Button onClick={handleAddProducts} startIcon={<AddCircle />}>Add</Button>
                                                <Button disabled={allSelectedServices.length === 0} onClick={handleDeleteRowsTable} startIcon={<DeleteForever />}>
                                                    Delete
                                                </Button>
                                            </ButtonGroup>
                                            {cargoDetailsAdded.length === 0 && <Alert severity="warning">You must add at least one service.</Alert>}
                                        </Stack>
                                        
                                        <EditableTable<CargoDetailsViewModel> data={cargoDetailsAdded} columns={columns} 
                                            enableRowSelection={true} getRowsIndexSelected={handleGetRowsSelected} getTableRef={getTable}
                                            onUpdate={(rowIndex, columnId, value) => {
                                                setCargoDetailsAdded((old) =>
                                                    old.map((row, index) =>
                                                    index === rowIndex ? { ...old[rowIndex], [columnId]: value } : row
                                                ));
                                            }}  />
                                    </Paper>
                                </Grid>
                                
                            </Grid>
                            <Stack sx={{mt:2}} direction="row" alignItems="center" justifyContent="flex-end" spacing={2}>
                                <Button size="small" type="submit" color="success" variant="contained" loading={isSubmitting} startIcon={<Save />}>Save</Button>
                            </Stack>
                        </Paper>
                    </form>
                    {ConfirmDialogComponent}
                </>
            }
            
        </React.Fragment>
        
    )
}

export default Request