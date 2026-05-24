// src/app/admin/users/page.tsx
import { getUsers, getRolesWithPermissions, updateUserRole, toggleUserStatus } from "@/src/actions/rbac";

export const dynamic = "force-dynamic";

export default async function UsersManagementPage() {
  const users = await getUsers();
  const roles = await getRolesWithPermissions();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Pengguna</h1>
        <p className="text-gray-500 text-sm">Kelola akun administrator, status aktif, dan penugasan peran mereka.</p>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs font-semibold uppercase tracking-wider">
              <th className="p-4">Nama & Email</th>
              <th className="p-4">Peran (Role)</th>
              <th className="p-4">Status</th>
              <th className="p-4">Login Terakhir</th>
              <th className="p-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <div className="font-medium text-gray-900">{user.name || "Tanpa Nama"}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </td>
                <td className="p-4">
                  <form action={async (formData) => {
                    "use server";
                    const roleId = Number(formData.get("roleId"));
                    await updateUserRole(user.id, roleId);
                  }}>
                    <select
                      name="roleId"
                      defaultValue={user.roleId}
                      onChange={async (e) => {
                        e.target.form?.requestSubmit();
                      }}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 p-1.5"
                    >
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </form>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {user.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td className="p-4 text-xs text-gray-500">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleString("id-ID") : "Belum pernah"}
                </td>
                <td className="p-4 text-right">
                  <form action={async () => {
                    "use server";
                    await toggleUserStatus(user.id, user.isActive);
                  }}>
                    <button
                      type="submit"
                      className={`text-xs font-semibold px-3 py-1 rounded border transition-colors ${
                        user.isActive 
                          ? "border-red-300 text-red-600 hover:bg-red-50" 
                          : "border-green-300 text-green-600 hover:bg-green-50"
                      }`}
                    >
                      {user.isActive ? "Nonaktifkan" : "Aktifkan"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}