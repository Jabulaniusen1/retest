import React from 'react'
import Image from 'next/image'

interface LineIconProps {
  name: string
  category?: string
  variant?: 'stroke' | 'solid' | 'outlined' | 'bulk' | 'duotone'
  className?: string
  size?: number
}

export function LineIcon({ 
  name, 
  category = 'interface', 
  variant = 'stroke',
  className = '',
  size = 24
}: LineIconProps) {
  const iconPath = `/free-svg-files/${category}/rounded/${variant}/${name}.svg`
  
  return (
    <img
      src={iconPath}
      alt={name}
      className={className}
      width={size}
      height={size}
      style={{ display: 'inline-block' }}
    />
  )
}
