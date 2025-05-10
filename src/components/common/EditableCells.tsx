import { Checkbox, FormControl, ListItemText, MenuItem, OutlinedInput, Select, SelectChangeEvent, TextField } from "@mui/material"
import { Column, Row, Table } from "@tanstack/react-table"
import { useEffect, useState } from "react"
import { ExtraCellContext } from "./EditableTable"
import { ServiceTypeEnum } from "../../utils/misc/enumsCommon"

export const EditTextFieldCell = <TData,>({ table, row, column,edit,getValue}:{ 
        table: Table<TData>,
        row: Row<TData>,
        column: Column<TData, string | null | undefined>,
        getValue: () => string | null | undefined,
        edit: boolean
    }) => {
        const initialValue = getValue()
        const [value, setValue] = useState(initialValue)
        useEffect(() => {
            setValue(initialValue)
        }, [initialValue])

        const onBlur = () => {
            (table.options.meta as ExtraCellContext).updateServiceData(row.index, column.id, value)
        }

        if(edit){
            return (
                <TextField
                    hiddenLabel
                    size="small"
                    value={value ?? ""}
                    onChange={(e) => setValue(e.target.value )} // Update local value
                     onBlur={onBlur} // Trigger onBlur when focus is lost
                />
            )
        }

        return (
            <span>
                {value ?? ""}
            </span>
        )
    }

    export const EditSelectCell = <TData,>({ getValue, row, column, table, edit }: { 
        getValue: () => number[] | null | undefined,
        row: Row<TData>,
        column: Column<TData, number[] | null | undefined>,
        table: Table<TData>,
        edit: boolean
    }) => {
        const [servicesTypeValue, setServicesTypeValue] = useState(getValue() ?? [])

        const onBlur = () => {
            (table.options.meta as ExtraCellContext).updateServiceData(row.index, column.id, servicesTypeValue)
        }

        const handleServiceTypeChange = (event: SelectChangeEvent<typeof servicesTypeValue>) => {
            const {
              target: { value },
            } = event;
            setServicesTypeValue(
              // On autofill we get a stringified value.
              typeof value === 'string' ? value.split(',').map((v)=>Number(v)) : value,
            );
          };

        if(edit) {
            return (
                <FormControl fullWidth>
                    <Select multiple displayEmpty size='small' value={servicesTypeValue} input={<OutlinedInput />}
                    onChange={handleServiceTypeChange} onBlur={onBlur}
                    renderValue={(selected)=>{
                            if (selected && selected.length === 0) {
                                return <em>-- Select service type -- </em>;
                            }
                            return selected ? getServicesType(selected): ""}
                        }>
                        {
                            Object.keys(ServiceTypeEnum).filter(x=> !isNaN(Number(x))).map((type) => {
                                const typeValue = Number(type);
                                return <MenuItem key={typeValue} value={typeValue}>
                                        <Checkbox checked={(servicesTypeValue).includes(typeValue)} />
                                        <ListItemText primary={
                                            typeValue === ServiceTypeEnum.SEAFREIGHT ? SEAFREIGHT : 
                                            typeValue === ServiceTypeEnum.HAULAGE ? HAULAGE : 
                                            typeValue === ServiceTypeEnum.MISCELLANEOUS ? MISCELLANEOUS : ''
                                        } />
                                    </MenuItem>
                            })
                        }
                    </Select>
                </FormControl>
            )
        }

        return getServicesType(servicesTypeValue);
    }


    const SEAFREIGHT = "SEAFREIGHT";
    const HAULAGE = "HAULAGE";
    const MISCELLANEOUS = "MISCELLANEOUS";  

    const getServicesType = (servicesType:number[]) => {
        return servicesType.map((serviceTypeId: number) => {
            return serviceTypeId === ServiceTypeEnum.SEAFREIGHT ? SEAFREIGHT : 
            serviceTypeId === ServiceTypeEnum.HAULAGE ? HAULAGE : 
            serviceTypeId === ServiceTypeEnum.MISCELLANEOUS ? MISCELLANEOUS : ''
        }).join(", ")
    }