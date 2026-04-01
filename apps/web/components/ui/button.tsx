import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
}

const variants: Record<Variant, string> = {
  primary:
    'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-600 hover:border-indigo-500',
  secondary:
    'bg-transparent hover:bg-white/10 text-white border border-white/20 hover:border-white/40',
  ghost: 'bg-transparent hover:bg-white/10 text-gray-300 hover:text-white border border-transparent',
  danger: 'bg-red-600 hover:bg-red-500 text-white border border-red-600',
}

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-md',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-6 py-3 text-base rounded-xl',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#0a0a0a] disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
