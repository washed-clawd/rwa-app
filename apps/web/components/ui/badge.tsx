import { type HTMLAttributes } from 'react'
import { clsx } from 'clsx'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-white/10 text-gray-300',
  success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  warning: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
  danger: 'bg-red-500/15 text-red-400 border border-red-500/20',
  info: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20',
  purple: 'bg-purple-500/15 text-purple-400 border border-purple-500/20',
}

export const Badge = ({ variant = 'default', className, children, ...props }: BadgeProps) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
