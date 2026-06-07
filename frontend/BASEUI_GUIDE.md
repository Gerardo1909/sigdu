# Guía Base UI para frontend_dev — SIGDU

> Este proyecto usa **shadcn/ui v4 con @base-ui/react** como primitiva.
> Este documento resume las diferencias clave con la versión Radix (v3) que probablemente conocés.

---

## 1. `render` prop en lugar de `asChild`

**Radix (v3):**
```tsx
<DialogClose asChild>
  <Button variant="ghost">Cerrar</Button>
</DialogClose>
```

**Base UI (v4) — este proyecto:**
```tsx
<DialogClose render={<Button variant="ghost" />}>
  Cerrar
</DialogClose>
```

La prop `render` recibe el elemento que actúa como raíz. Los `children` son el contenido.

---

## 2. `Positioner` separado para elementos flotantes

En Base UI, los componentes como `Select`, `Tooltip`, `Popover` y `DropdownMenu` separan
la lógica de posicionamiento en un componente `Positioner` dedicado.

```tsx
<Select>
  <SelectTrigger>Elegir...</SelectTrigger>
  <SelectContent>          {/* internamente usa Positioner */}
    <SelectItem value="a">Opción A</SelectItem>
  </SelectContent>
</Select>
```

Desde el lado del consumidor **la API es idéntica** — el `Positioner` ya está encapsulado
dentro de `SelectContent`, `DialogContent`, etc. No necesitás tocarlo directamente.

---

## 3. Atributos de estado: `data-open` / `data-closed`

Las animaciones y estilos condicionales usan atributos de datos en lugar de clases:

| Radix           | Base UI          |
|-----------------|------------------|
| `data-state="open"` | `data-open` |
| `data-state="closed"` | `data-closed` |

En Tailwind esto se expresa como `data-open:animate-in` en lugar de `data-[state=open]:animate-in`.
Los componentes instalados ya usan esto internamente — no necesitás ajustar nada a menos que escribas
animaciones propias.

---

## 4. Toast → Sonner (toast está deprecado)

**NO usar:**
```tsx
import { toast } from "@/components/ui/toast" // ❌ deprecado
```

**Usar siempre:**
```tsx
import { toast } from "sonner" // ✓
toast.success("Inscripción confirmada")
toast.error("Cupo completo")
toast("Mensaje neutral")
```

El `<Toaster />` ya está montado en `app/layout.tsx`. Solo importar y llamar `toast()`.

---

## 5. Formularios: react-hook-form + zod + Form component

```tsx
"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
})

export function LoginForm() {
  const form = useForm({ resolver: zodResolver(schema) })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(console.log)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (    // ← aquí "render" es del react-hook-form Controller, no de Base UI
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Ingresar</Button>
      </form>
    </Form>
  )
}
```

**Nota**: El `render` en `FormField` es el render prop de react-hook-form `Controller`, no de Base UI.
Son dos cosas distintas pero con el mismo nombre. No confundir.

---

## 6. Componentes disponibles en `components/ui/`

| Componente | Disponible | Notas |
|-----------|-----------|-------|
| button | ✓ | @base-ui/react/button |
| badge | ✓ | useRender pattern |
| card | ✓ | div puro (no base-ui) |
| input | ✓ | |
| label | ✓ | |
| select | ✓ | Positioner interno |
| table | ✓ | div/table puro |
| dialog | ✓ | @base-ui/react/dialog |
| dropdown-menu | ✓ | @base-ui/react/menu |
| sonner | ✓ | toaster montado en layout |
| skeleton | ✓ | div puro |
| separator | ✓ | |
| avatar | ✓ | |
| tabs | ✓ | @base-ui/react/tabs |
| form | ✓ | wrapper react-hook-form |
| sheet | ✓ | extiende Dialog |
| toast | ✗ | **deprecado** → usar sonner |

---

## 7. Import paths

```tsx
// Componentes UI
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"

// Hooks y lib
import { useAuth } from "@/hooks/use-auth"
import { apiFetch } from "@/lib/api"
import type { User, Activity } from "@/lib/types"
```
