import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import React from 'react';
import { datetimeStyles } from '../../utils/misc/styles';

interface DateComplexProps {
    id: string;
    value: any;
    onChange: (value: any) => void;
    fullWidth?: boolean;
}

const DateComplex: React.FC<DateComplexProps> = ({id, value, onChange, fullWidth}) => {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker 
                value={value}
                format="DD/MM/YYYY"
                onChange={(newValue: any) => { onChange(newValue); }}
                slotProps={{ textField: { id: id, fullWidth: fullWidth, sx: datetimeStyles }, inputAdornment: { sx: { position: "relative", right: "11.5px" } } }}
            />
        </LocalizationProvider>
    );
};

export default DateComplex;
