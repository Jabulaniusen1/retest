import React from 'react'
import { iconMap, IconName } from '@/lib/icon-map'

interface IconProps {
  name: IconName
  className?: string
  size?: number
  variant?: 'stroke' | 'solid' | 'outlined' | 'bulk' | 'duotone'
}

export function Icon({ 
  name, 
  className = '',
  size = 24,
  variant = 'stroke'
}: IconProps) {
  const iconConfig = iconMap[name]
  
  if (!iconConfig) {
    console.warn(`Icon "${name}" not found in iconMap`)
    return null
  }
  
  // Check if it's a custom icon
  if (iconConfig.category === 'custom') {
    const iconPath = `/custom-icons/${iconConfig.name}.svg`
    return (
      <img
        src={iconPath}
        alt={name}
        className={className}
        width={size}
        height={size}
        style={{ display: 'inline-block', verticalAlign: 'middle' }}
      />
    )
  }
  
  // Use LineIcons from free-svg-files
  const iconPath = `/free-svg-files/${iconConfig.category}/rounded/${variant}/${iconConfig.name}.svg`
  
  return (
    <img
      src={iconPath}
      alt={name}
      className={className}
      width={size}
      height={size}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    />
  )
}
