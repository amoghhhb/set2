const RightWrongIndicator = ({ type, message, showIcon = true, customIcon = null, blockTimer = null }) => {
  const getIcon = () => {
    if (customIcon) return customIcon

    switch (type) {
      case "success":
        return "✅"
      case "error":
        return "❌"
      case "warning":
        return "⚠️"
      case "info":
        return "ℹ️"
      case "blocked":
        return "⏳"
      case "timeout":
        return "⏰"
      default:
        return ""
    }
  }

  const getClassName = () => {
    switch (type) {
      case "success":
        return "success-message"
      case "error":
        return "error-message"
      case "warning":
        return "warning-message"
      case "info":
        return "info-message"
      case "blocked":
        return "warning-message"
      case "timeout":
        return "error-message"
      default:
        return "info-message"
    }
  }

  if (!message && !blockTimer) return null

  return (
    <div className="indicator-container">
      <p className={getClassName()}>
        {showIcon && <span>{getIcon()}</span>}
        <span>
          {message}
          {blockTimer !== null && blockTimer > 0 && ` (${blockTimer}s)`}
        </span>
      </p>
    </div>
  )
}

export default RightWrongIndicator
