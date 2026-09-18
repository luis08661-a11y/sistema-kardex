"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  crearPermisoAction,
  crearRolAction,
  crearUsuarioAction,
  cambiarEstadoUsuarioAction,
  asignarPermisosRolAction,
  asignarRolesUsuarioAction,
} from "@/actions/usuarios.actions";

type Props = {
  usuarios: any[];
  roles: any[];
  permisos: any[];
  auditoria: any[];
};

export function UsuariosModule({
  usuarios,
  roles,
  permisos,
  auditoria,
}: Props) {
  const [selectedUser, setSelectedUser] = useState(usuarios[0]?.id ?? "");
  const [selectedRole, setSelectedRole] = useState(roles[0]?.id ?? "");
  const [userRoles, setUserRoles] = useState<string[]>(
    usuarios[0]?.roles?.map((x: any) => x.role.id) ?? [],
  );
  const [rolePermissions, setRolePermissions] = useState<string[]>(
    roles[0]?.permissions?.map((x: any) => x.permission.id) ?? [],
  );
  const changeUser = (id: string) => {
    const u = usuarios.find(x => x.id === id);
    setSelectedUser(id);
    setUserRoles(u?.roles?.map((x: any) => x.role.id) ?? []);
  };
  const changeRole = (id: string) => {
    const r = roles.find(x => x.id === id);
    setSelectedRole(id);
    setRolePermissions(r?.permissions?.map((x: any) => x.permission.id) ?? []);
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Usuarios, Roles y Auditoría</h1>
        <p className="text-muted-foreground">
          Administración de acceso y trazabilidad del sistema.
        </p>
      </div>
      <Tabs defaultValue="usuarios">
        <TabsList>
          <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
          <TabsTrigger value="roles">Roles y permisos</TabsTrigger>
          <TabsTrigger value="auditoria">Auditoría</TabsTrigger>
        </TabsList>
        <TabsContent value="usuarios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Nuevo usuario</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                action={crearUsuarioAction}
                className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Usuario</Label>
                  <Input name="username" required />
                </div>
                <div>
                  <Label>Nombre</Label>
                  <Input name="name" required />
                </div>
                <div>
                  <Label>Correo</Label>
                  <Input name="email" type="email" required />
                </div>
                <div>
                  <Label>Contraseña</Label>
                  <Input name="password" type="password" required />
                </div>
                <div className="md:col-span-2">
                  <Button>Crear usuario</Button>
                </div>
              </form>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Usuarios registrados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-2">Usuario</th>
                      <th className="p-2">Nombre</th>
                      <th className="p-2">Correo</th>
                      <th className="p-2">Roles</th>
                      <th className="p-2">Estado</th>
                      <th className="p-2">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map(u => (
                      <tr key={u.id} className="border-b">
                        <td className="p-2 font-medium">{u.username}</td>
                        <td className="p-2">{u.name}</td>
                        <td className="p-2">{u.email}</td>
                        <td className="p-2">
                          {u.roles.map((r: any) => (
                            <Badge
                              key={r.role.id}
                              variant="secondary"
                              className="mr-1">
                              {r.role.name}
                            </Badge>
                          ))}
                        </td>
                        <td className="p-2">
                          {u.status ? (
                            <Badge>Activo</Badge>
                          ) : (
                            <Badge variant="outline">Inactivo</Badge>
                          )}
                        </td>
                        <td className="p-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              cambiarEstadoUsuarioAction(u.id, !u.status)
                            }>
                            {u.status ? "Desactivar" : "Activar"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Asignar roles a usuario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <select
                  className="border rounded-md h-9 px-3 w-full"
                  value={selectedUser}
                  onChange={e => changeUser(e.target.value)}>
                  {usuarios.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.username} — {u.name}
                    </option>
                  ))}
                </select>
                <div className="grid gap-2 md:grid-cols-3">
                  {roles.map(r => (
                    <label
                      key={r.id}
                      className="flex gap-2 items-center border rounded-md p-2">
                      <input
                        type="checkbox"
                        checked={userRoles.includes(r.id)}
                        onChange={e =>
                          setUserRoles(v =>
                            e.target.checked
                              ? [...v, r.id]
                              : v.filter(x => x !== r.id),
                          )
                        }
                      />
                      {r.name}
                    </label>
                  ))}
                </div>
                <Button
                  onClick={() =>
                    asignarRolesUsuarioAction(selectedUser, userRoles)
                  }>
                  Guardar roles
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Crear rol</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                action={crearRolAction}
                className="grid gap-4 md:grid-cols-3">
                <Input name="name" placeholder="Nombre del rol" required />
                <Input name="description" placeholder="Descripción" />
                <Button>Crear rol</Button>
              </form>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Permisos del rol</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <select
                  className="border rounded-md h-9 px-3 w-full"
                  value={selectedRole}
                  onChange={e => changeRole(e.target.value)}>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
                <div className="grid gap-2 md:grid-cols-3">
                  {permisos.map(p => (
                    <label
                      key={p.id}
                      className="flex gap-2 items-center border rounded-md p-2">
                      <input
                        type="checkbox"
                        checked={rolePermissions.includes(p.id)}
                        onChange={e =>
                          setRolePermissions(v =>
                            e.target.checked
                              ? [...v, p.id]
                              : v.filter(x => x !== p.id),
                          )
                        }
                      />
                      <span>
                        {p.modulo} · {p.codigo}
                      </span>
                    </label>
                  ))}
                </div>
                <Button
                  onClick={() =>
                    asignarPermisosRolAction(selectedRole, rolePermissions)
                  }>
                  Guardar permisos
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Nuevo permiso</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                action={crearPermisoAction}
                className="grid gap-4 md:grid-cols-4">
                <Input name="codigo" placeholder="MODULO.ACCION" required />
                <Input name="nombre" placeholder="Nombre" required />
                <Input name="modulo" placeholder="Módulo" required />
                <Button>Crear permiso</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="auditoria">
          <Card>
            <CardHeader>
              <CardTitle>Registro de auditoría</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-2">Fecha</th>
                      <th className="p-2">Usuario</th>
                      <th className="p-2">Acción</th>
                      <th className="p-2">Entidad</th>
                      <th className="p-2">ID</th>
                      <th className="p-2">Detalle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditoria.map(a => (
                      <tr key={a.id} className="border-b">
                        <td className="p-2">
                          {new Date(a.createdAt).toLocaleString()}
                        </td>
                        <td className="p-2">
                          {a.usuario?.username ?? "Sistema"}
                        </td>
                        <td className="p-2">{a.accion}</td>
                        <td className="p-2">{a.entidad}</td>
                        <td className="p-2">{a.entidadId ?? "—"}</td>
                        <td className="p-2 max-w-md truncate">
                          {a.detalle ? JSON.stringify(a.detalle) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
