// src/app/admin/articles/components/ArticleDataTable.tsx
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
  FileText,
} from "lucide-react";

import { Button } from "@/src/app/ui/button";
import { Checkbox } from "@/src/app/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/src/app/ui/dropdown-menu";
import { Input } from "@/src/app/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/app/ui/table";
import { Badge } from "@/src/app/ui/badge";
import Link from "next/link";
import { toast } from "sonner";
import { deleteArticleAction } from "@/src/actions/article-actions";

export type Article = {
  id: number;
  title: string;
  slug: string;
  sortNumber: number | null;
  excerpt: string | null;
  featuredImage: string | null;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  author: { name: string | null } | null;
};

type Props = {
  data: Article[];
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
};

export function ArticleDataTable({ data, permissions }: Props) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const { canUpdate, canDelete } = permissions;

  const columns: ColumnDef<Article>[] = [
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
          {row.original.featuredImage ? (
            <img
              src={row.original.featuredImage}
              alt={row.original.title}
              className="h-12 w-16 rounded-md object-cover"
            />
          ) : (
            <div className="h-12 w-16 rounded-md bg-muted flex items-center justify-center text-xs">
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
          <div>
            <div className="font-medium text-sm">{row.getValue("title")}</div>
            <div className="text-xs text-muted-foreground truncate max-w-xs">
              {row.original.excerpt || "Tidak ada excerpt"}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ row }) => <div className="text-sm font-mono text-muted-foreground">{row.getValue("slug")}</div>,
    },
    {
      accessorKey: "sortNumber",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Sort
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const value = row.getValue("sortNumber") as number | null;
        return <div className="text-sm">{value ?? "-"}</div>;
      },
    },
    {
      accessorKey: "author.name",
      header: "Penulis",
      cell: ({ row }) => <div className="text-sm">{row.original.author?.name || "-"}</div>,
    },
    {
      accessorKey: "isPublished",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.getValue("isPublished") ? "default" : "secondary"} className="text-xs">
          {row.getValue("isPublished") ? "Published" : "Draft"}
        </Badge>
      ),
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
        const article = row.original;

        if (!canUpdate && !canDelete) {
          return <div className="text-center text-muted-foreground">-</div>;
        }

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
              
              {canUpdate && (
                <DropdownMenuItem asChild>
                  <Link href={`/admin/articles/edit/${article.id}`} className="flex items-center gap-2 cursor-pointer">
                    <Edit className="h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
              )}
              
              {canDelete && (
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onSelect={async (e) => {
                    e.preventDefault();
                    if (confirm("Yakin ingin menghapus artikel ini?")) {
                      try {
                        const res = await deleteArticleAction(article.id);
                        if (res?.success) toast.success("Artikel dihapus!");
                        else toast.error(res?.error || "Gagal menghapus artikel");
                      } catch {
                        toast.error("Gagal menghapus artikel");
                      }
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus
                </DropdownMenuItem>
              )}
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

  const handleBulkDelete = async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedIds = selectedRows.map(row => row.original.id);
    
    if (selectedIds.length === 0) return toast.error("Pilih minimal satu artikel");
    if (!confirm(`Hapus ${selectedIds.length} artikel yang dipilih?`)) return;

    try {
      const results = await Promise.all(
        selectedIds.map(id => deleteArticleAction(id))
      );

      const failedDelete = results.find(res => res && !res.success);
      if (failedDelete) {
        toast.error(failedDelete.error || "Gagal menghapus beberapa artikel");
        return;
      }

      toast.success(`${selectedIds.length} artikel berhasil dihapus!`);
      table.resetRowSelection();
      
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
          placeholder="Cari judul artikel..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(e) => table.getColumn("title")?.setFilterValue(e.target.value)}
          className="w-full sm:max-w-sm"
        />

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {canDelete && table.getFilteredSelectedRowModel().rows.length > 0 && (
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
                  {column.id === "title" ? "Judul" :
                   column.id === "slug" ? "Slug" :
                   column.id === "sortNumber" ? "Sort" :
                   column.id === "author.name" ? "Penulis" :
                   column.id === "isPublished" ? "Status" :
                   column.id === "createdAt" ? "Dibuat" :
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
                  Belum ada artikel. Mulai menulis yang pertama!
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
            : `${table.getFilteredRowModel().rows.length} total artikel`}
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

