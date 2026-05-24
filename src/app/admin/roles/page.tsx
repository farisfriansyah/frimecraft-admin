// src/app/admin/roles/page.tsx
import { getRolesWithPermissions, getAllPermissions, updateRolePermissions } from "@/src/actions/rbac";

export const dynamic = "force-dynamic";

export default async function RolesManagementPage() {
  const roles = await getRolesWithPermissions();
  const allPermissions = await getAllPermissions();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Matriks Peran & Hak Akses (RBAC)</h1>
        <p className="text-gray-500 text-sm">Sesuaikan izin akses sistem secara dinamis untuk setiap level peran.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map((role) => {
          const activePermissionIds = role.permissions.map((p) => p.id);

          return (
            <div key={role.id} className="bg-white p-5 rounded-lg shadow border border-gray-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-bold text-blue-600 tracking-wide uppercase">{role.name}</h2>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">ID: {role.id}</span>
                </div>
                <p className="text-gray-500 text-xs mb-4">{role.description || "Tidak ada deskripsi."}</p>
                <hr className="mb-4 border-gray-100" />

                <form action={async (formData) => {
                  "use server";
                  const checkedPermissionIds = allPermissions
                    .filter((p) => formData.get(`perm-${p.id}`) === "on")
                    .map((p) => p.id);
                  
                  await updateRolePermissions(role.id, checkedPermissionIds);
                }}>
                  <div className="space-y-2.5 max-h-64 overflow-y-auto pr-2">
                    {allPermissions.map((perm) => {
                      const isAssigned = activePermissionIds.includes(perm.id);
                      return (
                        <label key={perm.id} className="flex items-start gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            name={`perm-${perm.id}`}
                            defaultChecked={isAssigned}
                            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div>
                            <span className="text-xs font-mono font-bold text-gray-800 bg-gray-50 border px-1.5 py-0.5 rounded">
                              {perm.name}
                            </span>
                            <p className="text-gray-400 text-[11px] mt-1">{perm.description}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 text-right">
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow transition-colors"
                    >
                      Simpan Perubahan Izin
                    </button>
                  </div>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}