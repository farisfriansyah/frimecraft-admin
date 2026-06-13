// src/components/admin/users/UserForm.tsx
"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { KeyRound, UserRoundX, Loader2, Save, ShieldCheck, AlertCircle, ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/src/app/ui/button";
import { Input } from "@/src/app/ui/input";
import { Label } from "@/src/app/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/app/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/app/ui/card";
import { DeleteButton } from "@/src/app/admin/common/DeleteButton";
import { updateUserAction, changeUserPasswordAction, createUserAction } from "@/src/actions/user-actions";
import Link from "next/link";

const schema = z.object({
    name: z.string().min(1, "Nama wajib diisi"),
    email: z.string().email("Format email salah"),
    roleId: z.string().min(1, "Peran wajib dipilih"),
    password: z.string().min(6, "Password minimal 6 karakter").optional().or(z.literal("")),
});

type UserFormValues = z.infer<typeof schema>;

export default function UserForm({
    user,
    roles,
    mode,
    canDelete,
    onDelete
}: {
    user?: any,
    roles: any[],
    mode: "create" | "edit",
    canDelete?: boolean,
    onDelete?: () => Promise<void>
}) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const isEdit = mode === "edit";

    const { control, register, handleSubmit, formState: { errors } } = useForm<UserFormValues>({
        resolver: zodResolver(schema) as any,
        defaultValues: {
            name: user?.name || "",
            email: user?.email || "",
            roleId: user ? String(user.roleId) : "",
            password: "",
        },
    });

    const onSubmit = async (data: UserFormValues) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, val]) => val && formData.append(key, val));

        startTransition(async () => {
            if (isEdit) {
                const res = await updateUserAction(user.id, formData);
                res.success ? toast.success(res.message) : toast.error(res.message);
            } else {
                const res = await createUserAction(formData);
                if (res.success) {
                    toast.success(res.message);
                    router.push("/admin/users");
                    router.refresh();
                } else {
                    toast.error(res.message);
                }
            }
        });
    };

    const handlePasswordSubmit = async (formData: FormData) => {
        startTransition(async () => {
            const res = await changeUserPasswordAction(user.id, formData);
            res.success ? toast.success(res.message) : toast.error(res.message);
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-8">
                <div className="flex items-center gap-4 mb-2">
                    <Button variant="ghost" size="icon" asChild><Link href="/admin/users"><ArrowLeft className="h-5 w-5" /></Link></Button>
                    <h1 className="text-2xl font-bold">{isEdit ? "Edit" : "Tambah"} Pengguna</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> Profil Informasi</CardTitle>
                        <CardDescription>Kelola data diri dan hak akses pengguna.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Nama Lengkap</Label>
                                <Input {...register("name")} placeholder="John Doe" />
                                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input {...register("email")} placeholder="email@contoh.com" />
                                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                            </div>
                        </div>

                        {mode === "create" && (
                            <div className="space-y-2">
                                <Label>Password Awal</Label>
                                <Input {...register("password")} type="password" placeholder="Minimal 6 karakter" />
                                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Peran (Role)</Label>
                            <Controller control={control} name="roleId" render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger><SelectValue placeholder="Pilih Peran" /></SelectTrigger>
                                    <SelectContent>
                                        {roles.map((r) => <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            )} />
                            {errors.roleId && <p className="text-xs text-destructive">{errors.roleId.message}</p>}
                        </div>
                    </CardContent>
                </Card>

                {isEdit && (
                    <Card className="border-amber-200 bg-amber-50/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-amber-900"><KeyRound className="h-4 w-4" /> Reset Password</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col sm:flex-row gap-4 items-end">
                                <div className="space-y-2 flex-1">
                                    <Label className="text-amber-900">Password Baru</Label>
                                    <Input name="newPassword" type="password" className="border-amber-200" />
                                </div>
                                <Button variant="outline" type="button" onClick={async () => {
                                    const input = document.querySelector('input[name="newPassword"]') as HTMLInputElement;
                                    const fd = new FormData();
                                    fd.append("newPassword", input.value);
                                    handlePasswordSubmit(fd);
                                }} disabled={isPending} className="border-amber-200 text-amber-900 hover:bg-amber-100">
                                    Perbarui
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            <div className="lg:col-span-4">
                <div className="sticky top-20 space-y-3 rounded-lg border bg-card p-6 shadow-sm">
                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        {isEdit ? "Simpan Perubahan" : "Buat Akun"}
                    </Button>
                    {/* AREA BAHAYA (DeleteButton) - DILUAR FORM UTAMA */}
                    {mode === "edit" && canDelete && onDelete && (
                        <Card className="border-destructive/20">
                            <CardHeader><CardTitle className="text-destructive">Area Bahaya</CardTitle></CardHeader>
                            <CardContent className="flex justify-between items-center">
                                <p className="text-sm">Hapus akun ini secara permanen.</p>
                                <DeleteButton action={onDelete} />
                            </CardContent>
                        </Card>
                    )}
                    <Button variant="ghost" asChild className="w-full"><Link href="/admin/users">Batal</Link></Button>
                </div>
            </div>
        </form>
    );
}