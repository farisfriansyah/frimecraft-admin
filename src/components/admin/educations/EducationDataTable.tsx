"use client";

import { Education } from "@prisma/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { deleteEducationAction } from "@/src/actions/education-actions";
import { toast } from "sonner";
import Link from "next/link";

type Props = {
  data: Education[];
  permissions: { canUpdate: boolean; canDelete: boolean };
};

// Helper untuk format tanggal agar tidak Hydration Error
const formatDate = (date: Date | string | null) => {
  if (!date) return "Sekarang";
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

export function EducationDataTable({ data, permissions }: Props) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Institusi</TableHead>
            <TableHead>Gelar</TableHead>
            <TableHead>Periode</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((edu) => (
              <TableRow key={edu.id}>
                <TableCell className="font-medium">{edu.institution}</TableCell>
                <TableCell>{edu.degree || "-"}</TableCell>
                <TableCell>
                  {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {permissions.canUpdate && (
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/educations/edit/${edu.id}`}>Edit</Link>
                        </DropdownMenuItem>
                      )}
                      {permissions.canDelete && (
                        <DropdownMenuItem 
                          className="text-destructive" 
                          onClick={async () => {
                            if (confirm("Yakin ingin menghapus data pendidikan ini?")) {
                              const res = await deleteEducationAction(edu.id);
                              if (res.success) {
                                toast.success("Berhasil dihapus!");
                              } else {
                                toast.error(res.error || "Gagal menghapus");
                              }
                            }
                          }}
                        >
                          Hapus
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                Tidak ada data pendidikan.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}