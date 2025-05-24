import { Checkbox, FormControl, ListItemText, MenuItem, OutlinedInput, Select, SelectChangeEvent, TextField } from "@mui/material"
import { Column, Row, Table } from "@tanstack/react-table"
import { useEffect, useState } from "react"
import { ExtraCellContext } from "./EditableTable"

export const EditTextFieldCell = <TData,>({ table, row, column,edit, type="text",getValue}:{ 
        table: Table<TData>,
        row: Row<TData>,
        column: Column<TData, string | null | undefined>,
        getValue: () => string | null | undefined,
        edit: boolean, 
        type?: "text" | "number"
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
                    type={type}
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

    type OptionItem = {
        id: number | string;  
        label: string;
    };

    export const EditSelectCell = <TData,>({ getValue, row, column, table, edit, options, multiple }: { 
        getValue: () => number[] | string[] | string | number | null | undefined,
        row: Row<TData>,
        column: Column<TData, number[] | null | undefined>,
        table: Table<TData>,
        edit: boolean,
        multiple?: boolean
        options: OptionItem[]
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
              typeof value === 'string' ? value.split(',').map((v)=>v) : value,
            );
        };

        const getLabel = (id: string | number) => options.find((opt) => opt.id === id)?.label

        if(edit) {
            return (
                <FormControl fullWidth>
                    <Select multiple={multiple} displayEmpty size='small' value={servicesTypeValue} input={<OutlinedInput />}
                    onChange={handleServiceTypeChange} onBlur={onBlur}
                    renderValue={(selected)=> {
                            if(Array.isArray(selected)) {
                                if (selected.length === 0) {
                                    return <em>-- Select service type -- </em>;
                                }
                                
                                return selected.map(getLabel).join(', ')
                            } 

                            return getLabel(selected)
                            
                        }}>
                        {
                            options.map((opt) => (
                                <MenuItem key={opt.id} value={opt.id}>
                                    {
                                    multiple && <Checkbox checked={(servicesTypeValue as (string | number)[]).includes(opt.id)} />
                                    }
                                    <ListItemText primary={opt.label} />
                                </MenuItem>
                            ))
                        }
                    </Select>
                </FormControl>
            )
        }

        return Array.isArray(servicesTypeValue) ?
            servicesTypeValue.map(id => options.find(x=>x.id == id)?.label).join(", ") 
            : getLabel(servicesTypeValue)
    }