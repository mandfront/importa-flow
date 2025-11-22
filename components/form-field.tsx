import type { ReactNode } from "react"

interface FormFieldProps {
  label: string
  htmlFor: string
  children: ReactNode
  error?: string
}

export function FormField({ label, htmlFor, children, error }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
