// src/components/admin/users/UserDataTable.tsx
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

import { ArrowUpDown, Edit, Power, ChevronDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
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
import { toggleUserStatusAction, deleteUserAction } from "@/src/actions/user-actions";
import { toast } from "sonner";
import Link from "next/link";

interface Role {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string | null;
  email: string;
  roleId: number;
  isActive: boolean;
  lastLogin: Date | null;
  role: Role;
}

type Props = {
  data: User[];
  currentAdminId: number;
  permissions: { canUpdate: boolean; canDelete: boolean };
};

export function UserDataTable({ data: initialData, currentAdminId, permissions }: Props) {
  const [data, setData] = React.useState(initialData);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [loadingId, setLoadingId] = React.useState<number | null>(null);

  const { canUpdate, canDelete } = permissions;

  // Fungsi Toggle Status
  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    if (userId === currentAdminId) return toast.error("Tidak bisa menonaktifkan akun sendiri");
    setLoadingId(userId);
    const result = await toggleUserStatusAction(userId, currentStatus);
    if (result.success) {
      setData((prev) => prev.map((u) => (u.id === userId ? { ...u, isActive: !currentStatus } : u)));
      toast.success(result.message || "Status berhasil diubah");
    } else {
      toast.error(result.message || "Gagal mengubah status");
    }
    setLoadingId(null);
  };

  // Fungsi Hapus Massal
  const handleBulkDelete = async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    if (selectedRows.length === 0) return toast.error("Pilih pengguna terlebih dahulu");
    if (!confirm(`Hapus ${selectedRows.length} pengguna terpilih?`)) return;

    try {
      await Promise.all(selectedRows.map((row) => deleteUserAction(row.original.id)));
      toast.success("Berhasil dihapus!");
      // Filter data lokal
      const deletedIds = new Set(selectedRows.map((r) => r.original.id));
      setData((prev) => prev.filter((u) => !deletedIds.has(u.id)));
      table.resetRowSelection();
    } catch {
      toast.error("Gagal menghapus pengguna");
    }
  };

  const columns: ColumnDef<User>[] = React.useMemo(() => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="px-0">
          User <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name || "Tanpa Nama"}</div>
          <div className="text-xs text-muted-foreground">{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Peran",
      cell: ({ row }) => <span className="text-xs font-mono bg-muted px-2 py-1 rounded">{row.original.role?.name || "N/A"}</span>,
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <span className={`px-2 py-1 text-xs rounded-full ${row.original.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {row.original.isActive ? "Aktif" : "Nonaktif"}
        </span>
      ),
    },
    {
      accessorKey: "lastLogin",
      header: "Login Terakhir",
      cell: ({ row }) => row.original.lastLogin ? new Date(row.original.lastLogin).toLocaleString('id-ID') : "Belum pernah",
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/admin/users/edit/${user.id}`}><Edit className="h-4 w-4" /></Link>
            </Button>
            {canUpdate && user.id !== currentAdminId && (
              <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(user.id, user.isActive)} disabled={loadingId === user.id}>
                <Power className={`h-4 w-4 ${user.isActive ? "text-red-500" : "text-green-500"}`} />
              </Button>
            )}
          </div>
        );
      },
    },
  ], [canUpdate, currentAdminId, loadingId]);

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
    state: { sorting, columnFilters, columnVisibility, rowSelection },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Input
          placeholder="Cari nama..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(e) => table.getColumn("name")?.setFilterValue(e.target.value)}
          className="w-full sm:max-w-sm"
        />
        <div className="flex items-center gap-2">
          {canDelete && table.getFilteredSelectedRowModel().rows.length > 0 && (
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              <Trash2 className="h-4 w-4 mr-2" /> Hapus ({table.getFilteredSelectedRowModel().rows.length})
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">Kolom <ChevronDown className="ml-2 h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table.getAllColumns().filter(c => c.getCanHide()).map(column => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(v) => column.toggleVisibility(!!v)}
                >
                  {column.id === "name" ? "User" : column.id.charAt(0).toUpperCase() + column.id.slice(1)}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(hg => (
              <TableRow key={hg.id}>
                {hg.headers.map(h => <TableHead key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</TableHead>)}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map(cell => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={columns.length} className="text-center h-24">Tidak ada data.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>{table.getFilteredSelectedRowModel().rows.length} baris dipilih</div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
        </div>
      </div>
    </div>
  );
}