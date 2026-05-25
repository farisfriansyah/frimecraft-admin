// src/components/admin/experiences/ExperienceDataTable.tsx

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
import { deleteExperienceAction } from "@/src/actions/experience-actions";

// Tipe data disesuaikan dengan skema WorkExperience
export type Experience = {
  id: number;
  position: string;
  company: { name: string } | null;
  startMonth: number;
  startYear: number;
  endMonth: number | null;
  endYear: number | null;
  isCurrent: boolean;
  tags: string[]; // Sesuai String[] di Prisma
  createdAt: Date;
};

type Props = {
  data: Experience[];
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
};

export function ExperienceDataTable({ data, permissions }: Props) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const { canUpdate, canDelete } = permissions;

  const columns: ColumnDef<Experience>[] = React.useMemo(() => [
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
      accessorKey: "position",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Posisi
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-medium">{row.original.position}</div>,
    },
    {
      accessorKey: "company.name",
      header: "Perusahaan",
      cell: ({ row }) => <div>{row.original.company?.name || "-"}</div>,
    },
    {
      header: "Periode",
      cell: ({ row }) => {
        const { startMonth, startYear, endMonth, endYear, isCurrent } = row.original;
        const start = `${startMonth}/${startYear}`;
        const end = isCurrent ? "Sekarang" : `${endMonth}/${endYear}`;
        return <div className="text-sm">{start} - {end}</div>;
      },
    },
    {
      accessorKey: "tags",
      header: "Tags",
      cell: ({ row }) => {
        const tags = row.original.tags;
        if (!tags || tags.length === 0) return <span className="text-muted-foreground text-xs">-</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
            {tags.length > 3 && <Badge variant="outline" className="text-xs">+{tags.length - 3}</Badge>}
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const exp = row.original;
        if (!canUpdate && !canDelete) return <div className="text-center text-muted-foreground">-</div>;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              {canUpdate && (
                <DropdownMenuItem asChild>
                  <Link href={`/admin/experiences/edit/${exp.id}`} className="flex items-center gap-2 cursor-pointer">
                    <Edit className="h-4 w-4" /> Edit
                  </Link>
                </DropdownMenuItem>
              )}
              {canDelete && (
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onSelect={async (e) => {
                    e.preventDefault();
                    if (confirm("Yakin ingin menghapus data ini?")) {
                      try {
                        await deleteExperienceAction(exp.id);
                        toast.success("Berhasil dihapus!");
                      } catch {
                        toast.error("Gagal menghapus");
                      }
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Hapus
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], [canUpdate, canDelete]);

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

  const handleBulkDelete = async () => {
    const selectedIds = table.getFilteredSelectedRowModel().rows.map(r => r.original.id);
    if (selectedIds.length === 0) return toast.error("Pilih data dulu");
    if (!confirm(`Hapus ${selectedIds.length} data?`)) return;

    try {
      await Promise.all(selectedIds.map(id => deleteExperienceAction(id)));
      toast.success("Berhasil dihapus!");
      table.resetRowSelection();
    } catch {
      toast.error("Gagal hapus massal");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Input
          placeholder="Cari posisi..."
          value={(table.getColumn("position")?.getFilterValue() as string) ?? ""}
          onChange={(e) => table.getColumn("position")?.setFilterValue(e.target.value)}
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
              <Button variant="outline" size="sm">
                Kolom <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table.getAllColumns().filter(col => col.getCanHide()).map(column => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(v) => column.toggleVisibility(!!v)}
                >
                  {column.id === "company.name" ? "Perusahaan" : column.id}
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

      {/* Footer Paginasi */}
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