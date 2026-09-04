const colorMap = {
  violet: { bg: '#EDE7FF', fg: '#7C5CFC' },
  green: { bg: '#DCFCE7', fg: '#16A34A' },
  blue: { bg: '#DBEAFE', fg: '#3B82F6' },
  orange: { bg: '#FFEDD5', fg: '#F97316' },
}

export default function IconBadge({ icon: Icon, color = 'violet' }) {
  const c = colorMap[color]
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
      style={{ background: c.bg, color: c.fg }}
    >
      <Icon size={18} strokeWidth={2} />
    </div>
  )
}
