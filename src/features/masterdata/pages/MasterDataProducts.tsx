import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { ProductViewModel } from '@features/masterdata/api';
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { deleteApiProductByIdMutation, getApiProductOptions, getApiProductQueryKey, postApiProductMutation, putApiProductByIdMutation } from '@features/masterdata/api/@tanstack/react-query.gen';
import { showSnackbar } from '@components/common/Snackbar';
import ConfirmDialogComponent from '@components/common/ConfirmDialogComponent';
import { EditTextFieldCell } from '@components/common/EditableCells';
import { Box, Button, IconButton, Stack, TextField } from "@mui/material";
import { Add, Cancel, Delete, Edit, Refresh, Save } from "@mui/icons-material";
import Grid from '@mui/material/Grid2';
import EditableTable from '@components/common/EditableTable';


const columnHelper = createColumnHelper<ProductViewModel>()

const MasterDataProducts = () => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    
    const [products, setProducts] = useState<ProductViewModel[]>([]);
    const [productId, setProductId] = useState<number>();
    const [editRow, setEditRow] = useState<boolean>(false)
    const [confirmDeleteRow, setConfirmDeleteRow] = useState(false)
    const [savingRow, setSavingRow] = useState(false)
    const [globalFilter, setGlobalFilter] = useState('')

    const {data, isFetching} = useQuery({...getApiProductOptions()})

    useEffect(() => {
        setProducts(data ?? []);
    }, [data])

    const handleProductStatusUpdated = () => {
        return {
            onSuccess:() => {
                setProductId(undefined);
                setEditRow(false);

                showSnackbar("Saved with success", "success");
                queryClient.invalidateQueries({ queryKey: getApiProductQueryKey() });
            },
            onError: () => showSnackbar(t('errorHappened'), "warning"),
            onSettled:() => setSavingRow(false)
        }
    }

    const deleteProductMutation = useMutation({
        ...deleteApiProductByIdMutation(),
        onSuccess:() => {
            setProductId(undefined);
            showSnackbar("Deleted with success", "success");
            queryClient.invalidateQueries({ queryKey: getApiProductQueryKey() });
        },
        onError : () => showSnackbar(t('errorHappened'), "warning")
    })

    const updateProductMutation = useMutation({
        ...putApiProductByIdMutation(),
        ...handleProductStatusUpdated()
   })

   const createProductMutation = useMutation({
        ...postApiProductMutation(),
        ...handleProductStatusUpdated()
    })

    const handleEditProduct = (id?: number) => {
        setProductId(id);
        setEditRow(true);
    }

    const handleSaveProduct = (index:number) => {
        setSavingRow(true);

        const row = products[index];
        if (productId) updateProductMutation.mutate({ path: { id: productId }, body: row });
        else createProductMutation.mutate({ body: row });
    }

    const handleDeleteProduct = (id?: number) => {
        setProductId(id);
        setConfirmDeleteRow(true);
    }

    const handleCancelEditProduct = () => {
        setProductId(undefined);
        setEditRow(false);
        setProducts(data ?? []);
    }

    const handleAddProduct = () => {
        setEditRow(true);
        setProductId(0);
        setProducts([{ productName: '' }, ...products]);
    }

    const handleIfConfirmDelete = async (deleted: boolean) => {
        setConfirmDeleteRow(false);
        if(!deleted) {
            setProductId(undefined);
        }
        else if(productId) {
            await deleteProductMutation.mutateAsync({ path: { id: productId }})
        }
    }

    const ConfirmDeletion = useCallback(
      () => {
        return <ConfirmDialogComponent title="Delete product" 
            message="Are you sure you want to delete this product?" 
            open={confirmDeleteRow} onDelete={handleIfConfirmDelete} />},
      [confirmDeleteRow])

    const columns: ColumnDef<ProductViewModel, any>[] = [
        columnHelper.accessor('productName', {
            header: 'Product',
            cell: x => <EditTextFieldCell<ProductViewModel> {...x}
                    edit={(editRow && productId !== undefined && productId === x.row.original.productId) || 
                    (productId === 0 && x.row.original.productId === undefined)} />
        }),
        columnHelper.display({
            id: 'option',
            size: 10,
            enableSorting: false,
            cell: ({row}) => {
                if(row.original.productId !== undefined || productId === 0) {
                    const _serviceId = row.original.productId;
                    return (<Box>
                        {
                            (editRow && (productId === _serviceId || (productId === 0 && _serviceId === undefined))) ? 
                            <>
                                 <IconButton size="small" title='Save' sx={{ mr: 0.5 }} 
                                    onClick={()=>handleSaveProduct(row.index)} loading={savingRow}>
                                        <Save sx={{color:'green'}} />
                                </IconButton>
                                   
                                <IconButton size="small" title='Cancel' sx={{ mr: 0.5 }} 
                                    onClick={handleCancelEditProduct}>
                                        <Cancel sx={{color:'red'}} />
                                </IconButton>
                                
                            </> : 
                            <>
                                <IconButton size="small" title='Editer product' sx={{ mr: 0.5 }} onClick={() => handleEditProduct(_serviceId)}>
                                    <Edit sx={{color:'blue'}} />
                                </IconButton>
                                <IconButton size="small" title='Delete product' sx={{ mr: 0.5 }} onClick={() => handleDeleteProduct(_serviceId)}>
                                    <Delete sx={{color:'red'}} />
                                </IconButton>
                            </>
                        }
                   
                    </Box>)
                }
            }
        })
    ]

    const handleRefreshTable = () => {
        queryClient.invalidateQueries({ queryKey: getApiProductQueryKey() });
    }
    
    return (
        <div style={{ background: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            <Box py={2.5}>
                <Grid container spacing={2} mt={0} px={5}>
                    
                    <Grid size={{ xs: 12 }}>
                        <Stack direction='row' alignItems='center' justifyContent='space-between' mb={2}>
                            <Box>
                                <Button variant='contained' sx={{mr:2}} startIcon={<Add />} size='small' onClick={handleAddProduct}>
                                    Add product
                                </Button>
                                <Button variant='outlined' startIcon={<Refresh />} size='small' onClick={handleRefreshTable}>
                                    Refresh
                                </Button>
                            </Box>
                            <TextField value={globalFilter ?? ''} onChange={(e) => setGlobalFilter(e.target.value)}
                                size='small' placeholder="Search products..." />
                        </Stack>
                    
                        <EditableTable data={products} columns={columns}
                            onUpdate={(rowIndex, columnId, value) => {
                                setProducts((old) =>
                                old.map((row, index) =>
                                    index === rowIndex ? { ...old[rowIndex], [columnId]: value } : row
                                )
                                );
                            }}
                            isLoading={isFetching} globalFilter={globalFilter} onGlobalFilterChange={setGlobalFilter}
                            />
                    </Grid>
                </Grid>
            </Box>
            { ConfirmDeletion() }
        </div>
        
    );
}

export default MasterDataProducts;