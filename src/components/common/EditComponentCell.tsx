import { TextField } from "@mui/material"
import { useEffect, useState } from "react"

export const EditTextFieldCell = ({ getValue, edit,onBlur}:{ 
        getValue: () => string | null | undefined,
        onBlur: (value:string) => void,
        edit: boolean
    }) => {
        const initialValue = getValue()
        const [value, setValue] = useState(initialValue)
        useEffect(() => {
            setValue(initialValue)
          }, [initialValue])

        if(edit){
            return (
                <TextField
                    hiddenLabel
                    size="small"
                    value={value ?? ""}
                    onChange={(e) => setValue(e.target.value )} // Update local value
                     onBlur={()=>onBlur(value ?? "")} // Trigger onBlur when focus is lost
                />
            )
        }

        return (
            <span>
                {value ?? ""}
            </span>
        )
        
    }