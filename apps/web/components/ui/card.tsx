import { type HTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  noPadding?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ hover, noPadding, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          'bg-[#111318] border border-white/10 rounded-xl',
          !noPadding && 'p-5',
          hover && 'hover:border-white/20 hover:bg-[#15181f] transition-all duration-150 cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export const CardHeader = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx('mb-4', className)} {...props}>
    {children}
  </div>
)

export const CardTitle = ({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={clsx('text-lg font-semibold text-white', className)} {...props}>
    {children}
  </h3>
)

export const CardContent = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx('', className)} {...props}>
    {children}
  </div>
)
