/**
 * Theme hook for accessing theme configuration
 */

import { useContext } from 'react'
import { AppContext } from '../AppContext'

export function useTheme() {
  const { config } = useContext(AppContext)
  const primaryColor = config.theme?.primaryColor ?? 'green'
  const inactiveColor = 'gray'
  const errorColor = 'red'
  const successColor = 'green'
  const warningColor = 'yellow'
  const infoColor = 'cyan'

  // Contrast text color for primaryColor when used as background
  const primaryColorContrastText = (() => {
    switch (primaryColor) {
      case 'cyan':
      case 'yellow':
      case 'white':
        return 'black'
      default:
        return 'white'
    }
  })()

  return {
    primaryColor,
    primaryColorContrastText,
    inactiveColor,
    errorColor,
    successColor,
    warningColor,
    infoColor,
  }
}
