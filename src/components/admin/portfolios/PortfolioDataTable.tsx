// src/components/admin/portfolios/PortfolioDataTable.tsx
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
  Copy,
  FileText,
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
  imageUrl: string | null;
  featured: boolean;
  isDisabled: boolean;
  createdAt: Date;
  workFor: { name: string } | null;
  workAt: { name: string } | null;
  tags: string | null;
};

type Props = {
  data: Portfolio[];
};

export function PortfolioDataTable({ data }: Props) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
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
          className="h-8 px-2"
        >
          Judul
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.imageUrl ? (
            <img
              src={row.original.imageUrl}
              alt={row.original.title}
              className="h-10 w-10 rounded-md object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center text-xs">
              ?
            </div>
          )}
          <div>
            <div className="font-medium">{row.getValue("title")}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "workFor.name",
      header: "Client",
      cell: ({ row }) => <div className="font-medium">{row.original.workFor?.name || "-"}</div>,
    },
    {
      accessorKey: "workAt.name",
      header: "Employer",
      cell: ({ row }) => <div className="font-medium">{row.original.workAt?.name || "-"}</div>,
    },
    {
      accessorKey: "tags",
      header: "Tags",
      cell: ({ row }) => {
        if (!row.original.tags) return <span className="text-muted-foreground text-xs">No tags</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {row.original.tags.split(",").slice(0, 3).map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {tag.trim()}
              </Badge>
            ))}
            {row.original.tags.split(",").length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{row.original.tags.split(",").length - 3}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "featured",
      header: "Status",
      cell: ({ row }) => {
        const { featured, isDisabled } = row.original;
        return (
          <div className="flex flex-col gap-1">
            {featured && <Badge variant="default" className="w-fit">Featured</Badge>}
            {isDisabled && <Badge variant="secondary" className="w-fit">Disabled</Badge>}
            {!featured && !isDisabled && <Badge variant="outline" className="w-fit">Active</Badge>}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Dibuat
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return <div className="text-sm">{date.toLocaleDateString("id-ID")}</div>;
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
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/portfolios/${portfolio.id}`} className="flex items-center gap-2 cursor-pointer">
                  <Edit className="h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={async (e) => {
                  e.preventDefault();
                  if (confirm("Yakin ingin menghapus portfolio ini?")) {
                    try {
                      await deletePortfolioAction(String(portfolio.id));
                      toast.success("Portfolio dihapus!");
                    } catch {
                      toast.error("Gagal menghapus portfolio");
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
    data,
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
  });

  // Bulk Delete Action yang Sudah Diperbaiki
  const handleBulkDelete = async () => {
    // 1. Ambil baris data yang sedang dicentang secara akurat dari model tabel
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    
    // 2. Map ke ID database asli (portfolio.id) bukan indeks baris visual
    const selectedIds = selectedRows.map(row => row.original.id);
    
    if (selectedIds.length === 0) return toast.error("Pilih minimal satu portfolio");

    if (!confirm(`Hapus ${selectedIds.length} portfolio yang dipilih beserta file gambarnya?`)) return;

    try {
      // 3. Eksekusi semua proses hapus ke server secara paralel
      const results = await Promise.all(
        selectedIds.map(id => deletePortfolioAction(id))
      );

      // 4. Periksa apakah ada baris yang gagal dihapus di sisi server
      const failedDelete = results.find(res => res && !res.success);
      if (failedDelete) {
        toast.error(failedDelete.error || "Gagal menghapus beberapa portfolio");
        return;
      }

      // Sukses total
      toast.success(`${selectedIds.length} portfolio berhasil dihapus secara permanen!`);
      table.resetRowSelection(); // Bersihkan tanda centang di tabel
      
    } catch (error) {
      console.error("Bulk delete error:", error);
      toast.error("Terjadi kesalahan saat menghapus massal");
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Input
          placeholder="Cari judul portfolio..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(e) => table.getColumn("title")?.setFilterValue(e.target.value)}
          className="w-full sm:max-w-sm"
        />

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Bulk Actions */}
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              className="mr-2"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Hapus ({table.getFilteredSelectedRowModel().rows.length})
            </Button>
          )}

          {/* Column Visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Kolom
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {table.getAllColumns().filter(col => col.getCanHide()).map(column => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id === "workFor.name" ? "Client" :
                   column.id === "workAt.name" ? "Employer" :
                   column.id}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
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
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                  Belum ada portfolio. Tambah yang pertama!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div>
          {table.getFilteredSelectedRowModel().rows.length > 0
            ? `${table.getFilteredSelectedRowModel().rows.length} dari ${table.getFilteredRowModel().rows.length} baris dipilih`
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