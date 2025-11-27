// src/components/admin/portfolios/PortfolioTable.tsx
"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  ArrowUpDown,
  MoreHorizontal,
  Edit,
  Trash2,
  ChevronDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { toast } from "sonner";
import { deletePortfolioAction } from "@/src/actions/portfolio-actions";

export type Portfolio = {
  id: number;
  title: string;
  imageUrl?: string | null;
  featured: boolean;
  isDisabled: boolean;
  createdAt: Date;
};

type Props = {
  initialData: Portfolio[];
};

export default function PortfolioTable({ initialData }: Props) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    createdAt: false, // Sembunyikan di mobile
  });
  const [rowSelection, setRowSelection] = React.useState({});

  const columns: ColumnDef<Portfolio>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-0 font-medium"
        >
          Judul
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3 min-w-0">
          {row.original.imageUrl ? (
            <img
              src={row.original.imageUrl}
              alt={row.original.title}
              className="h-10 w-10 rounded-md object-cover flex-shrink-0"
            />
          ) : (
            <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-muted-foreground">?</span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="font-medium truncate">{row.getValue("title")}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {new Date(row.original.createdAt).toLocaleDateString("id-ID")}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "featured",
      header: "Status",
      cell: ({ row }) => {
        const { featured, isDisabled } = row.original;
        return (
          <div className="flex flex-wrap gap-1">
            {featured && <Badge variant="default" className="text-xs">Featured</Badge>}
            {isDisabled && <Badge variant="secondary" className="text-xs">Nonaktif</Badge>}
            {!featured && !isDisabled && <Badge variant="outline" className="text-xs">Normal</Badge>}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Dibuat",
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return <div className="text-sm text-muted-foreground">{date.toLocaleDateString("id-ID")}</div>;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const portfolio = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/portfolios/${portfolio.id}`} className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onSelect={async (e) => {
                  e.preventDefault();
                  if (confirm("Yakin hapus portfolio ini?")) {
                    try {
                      await deletePortfolioAction(portfolio.id);
                      toast.success("Portfolio dihapus!");
                    } catch {
                      toast.error("Gagal menghapus");
                    }
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: initialData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: { pageSize: 10 },
    },
  });

  // Bulk Delete
  const handleBulkDelete = async () => {
    const selectedIds = Object.keys(rowSelection).map(Number);
    if (selectedIds.length === 0) return toast.error("Pilih minimal satu portfolio");

    if (!confirm(`Hapus ${selectedIds.length} portfolio?`)) return;

    try {
      await Promise.all(selectedIds.map(id => deletePortfolioAction(id)));
      toast.success(`${selectedIds.length} portfolio dihapus!`);
      table.resetRowSelection();
    } catch {
      toast.error("Gagal menghapus beberapa portfolio");
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Cari judul..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(e) => table.getColumn("title")?.setFilterValue(e.target.value)}
          className="w-full sm:max-w-sm"
        />

        <div className="flex items-center gap-2">
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Hapus ({table.getFilteredSelectedRowModel().rows.length})
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Kolom
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table.getAllColumns().filter(col => col.getCanHide()).map(column => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(v) => column.toggleVisibility(!!v)}
                >
                  {column.id === "createdAt" ? "Tanggal Dibuat" : column.id}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableHead key={header.id} className="whitespace-nowrap">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map(row => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={row.getIsSelected() ? "bg-muted/50" : ""}
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id} className="py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                    Belum ada portfolio
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div>
          {table.getFilteredSelectedRowModel().rows.length > 0
            ? `${table.getFilteredSelectedRowModel().rows.length} dari ${table.getFilteredRowModel().rows.length} dipilih`
            : `${table.getFilteredRowModel().rows.length} total portfolio`}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}