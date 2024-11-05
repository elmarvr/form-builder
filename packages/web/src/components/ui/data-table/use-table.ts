import {
  getCoreRowModel,
  useReactTable,
  type TableOptions as ReactTableOptions,
} from "@tanstack/react-table";

export interface TableOptions<TData>
  extends Pick<ReactTableOptions<TData>, "data" | "columns"> {}

export function useTable<TData>(opts: TableOptions<TData>) {
  return useReactTable({
    ...opts,
    getCoreRowModel: getCoreRowModel(),
  });
}
