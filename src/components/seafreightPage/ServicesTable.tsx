import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import {
    GridRowsProp,
    GridRowModesModel,
    GridRowModes,
    DataGrid,
    GridColDef,
    GridToolbarContainer,
    GridActionsCellItem,
    GridEventListener,
    GridRowId,
    GridRowModel,
    GridRowEditStopReasons,
    GridRenderCellParams,
} from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import { gridStyles, whiteButtonStyles } from '../../utils/misc/styles';

interface EditToolbarProps {
    setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
    setRowModesModel: (
        newModel: (oldModel: GridRowModesModel) => GridRowModesModel,
    ) => void;
}

function EditToolbar(props: EditToolbarProps) {
    const { setRows, setRowModesModel } = props;

    const handleClick = () => {
        const id = randomId();
        setRows((oldRows) => [...oldRows, { id, serviceName: '', price: 0, isNew: true }]);
        setRowModesModel((oldModel) => ({
            ...oldModel,
            [id]: { mode: GridRowModes.Edit, fieldToFocus: 'serviceName' },
        }));
    };

    return (
        <GridToolbarContainer>
            <Button color="primary" startIcon={<AddIcon />} onClick={handleClick} sx={whiteButtonStyles}>
                Add service
            </Button>
        </GridToolbarContainer>
    );
}

function ServicesTable(props: any) {
    // console.log(props);
    const [rows, setRows] = React.useState(props.services);
    const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});

    const handleRowEditStop: GridEventListener<'rowEditStop'> = (params: any, event: any) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            event.defaultMuiPrevented = true;
        }
    };

    const handleEditClick = (id: GridRowId) => () => {
        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
    };

    const handleSaveClick = (id: GridRowId) => () => {
        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
    };

    const handleDeleteClick = (id: GridRowId) => () => {
        var updatedRows = rows.filter((row: any) => row.id !== id);
        setRows(updatedRows);
        props.setServices(updatedRows);
    };

    const handleCancelClick = (id: GridRowId) => () => {
        setRowModesModel({
            ...rowModesModel,
            [id]: { mode: GridRowModes.View, ignoreModifications: true },
        });

        const editedRow = rows.find((row: any) => row.id === id);
        if (editedRow!.isNew) {
            setRows(rows.filter((row: any) => row.id !== id));
        }
    };

    const processRowUpdate = (newRow: GridRowModel) => {
        // Find the matching service object from allServices by serviceName.
        const matchingService = props.allServices.find((service: any) => service.serviceName === newRow.serviceName);
        
        // If a matching service is found, use its ID; otherwise, use the existing ID.
        const updatedRow = {
            ...newRow,
            serviceId: matchingService ? matchingService.serviceId : newRow.serviceId,
            isNew: false
        };

        const updatedRows = rows.map((row: any) => (row.serviceId === newRow.serviceId ? updatedRow : row));
        setRows(updatedRows);
        // Here i try to update the state
        props.setServices(updatedRows);
        return updatedRow;
    };

    const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
        setRowModesModel(newRowModesModel);
    };

    const columns: GridColDef[] = [
        { field: 'serviceId', headerName: 'Service Id', editable: true, flex: 1 },
        { field: 'serviceName', headerName: 'Service Name', editable: true, type: 'singleSelect', valueOptions: props.servicesOptions, flex: 3 },
        { field: 'price', headerName: 'Price', align: "left", headerAlign: "left", type: 'number', editable: true, renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    {params.row.price} {props.currency}
                </Box>
            );
        }, flex: 1 },
        { field: 'container', headerName: 'Container', renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    {props.container !== null && props.container !== undefined ? props.container.packageName : "N/A"}
                </Box>
            );
        }, flex: 1 },
        { field: 'type', headerName: 'Type', renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    {props.type}
                </Box>
            );
        }, flex: 1 },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 100,
            cellClassName: 'actions',
            getActions: ({ id }: any) => {
                const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

                if (isInEditMode) {
                    return [
                        <GridActionsCellItem
                            icon={<SaveIcon />}
                            label="Save"
                            sx={{
                                color: 'primary.main',
                            }}
                            onClick={handleSaveClick(id)}
                        />,
                        <GridActionsCellItem
                            icon={<CancelIcon />}
                            label="Cancel"
                            className="textPrimary"
                            onClick={handleCancelClick(id)}
                            color="inherit"
                        />,
                    ];
                }

                return [
                    <GridActionsCellItem
                        icon={<EditIcon />}
                        label="Edit"
                        className="textPrimary"
                        onClick={handleEditClick(id)}
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        icon={<DeleteIcon />}
                        label="Delete"
                        onClick={handleDeleteClick(id)}
                        color="inherit"
                    />,
                ];
            },
            flex: 1
        },
    ];

    return (
        <Box
            sx={{
                '& .actions': {
                    color: 'text.secondary',
                },
                '& .textPrimary': {
                    color: 'text.primary',
                },
            }}
        >
            <DataGrid
                rows={rows}
                columns={columns}
                editMode="row"
                rowModesModel={rowModesModel}
                onRowModesModelChange={handleRowModesModelChange}
                onRowEditStop={handleRowEditStop}
                processRowUpdate={processRowUpdate}
                slots={{
                    toolbar: EditToolbar,
                }}
                slotProps={{
                    toolbar: { setRows, setRowModesModel },
                }}
                // getRowId={(row: any) => row?.id}
                sx={gridStyles}
            />
        </Box>
    );
}

export default ServicesTable;