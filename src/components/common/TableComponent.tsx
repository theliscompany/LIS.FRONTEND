import { ColumnDef } from "@tanstack/react-table"

type TableComponentProps<TModel> = {
    table: import("@tanstack/table-core").Table<TModel>;
    columns: ColumnDef<TModel, any>[];
    isLoading: boolean;
}

const TableComponent = <TModel, >(
    { }:TableComponentProps<TModel>) => {
        
    return (
        <></>
    )
}

export default TableComponent