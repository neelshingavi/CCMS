import React from 'react'

interface FeatureCardProps {
    title: string
    description: string
    icon: React.ReactNode
    colorClass: string // e.g. "teal", "blue", "purple"
    buttonText: string
    onClick: () => void
    disabled: boolean
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon, colorClass, buttonText, onClick, disabled }) => {
    // Map color names to specific Tailwind classes safely
    const colorMap: Record<string, { bg: string, text: string, border: string, hover: string, glow: string }> = {
        teal: { bg: 'bg-teal-500/20', text: 'text-teal-400', border: 'hover:border-teal-500/50', hover: 'hover:bg-teal-600', glow: 'bg-teal-500/10' },
        blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'hover:border-blue-500/50', hover: 'hover:bg-blue-600', glow: 'bg-blue-500/10' },
        purple: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'hover:border-purple-500/50', hover: 'hover:bg-purple-600', glow: 'bg-purple-500/10' },
        indigo: { bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'hover:border-indigo-500/50', hover: 'hover:bg-indigo-600', glow: 'bg-indigo-500/10' },
        cyan: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'hover:border-cyan-500/50', hover: 'hover:bg-cyan-600', glow: 'bg-cyan-500/10' },
        amber: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'hover:border-amber-500/50', hover: 'hover:bg-amber-600', glow: 'bg-amber-500/10' },
    }

    const theme = colorMap[colorClass] || colorMap.blue

    return (
        <div className={`group bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800 ${theme.border} transition-all duration-300 relative overflow-hidden flex flex-col`}>
            <div className={`absolute top-0 right-0 w-24 h-24 ${theme.glow} rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`}></div>

            <div className={`h-12 w-12 ${theme.bg} rounded-xl flex items-center justify-center mb-4 ${theme.text}`}>
                {icon}
            </div>

            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-slate-400 mb-6 text-sm flex-grow min-h-[40px] leading-relaxed">{description}</p>

            <button
                className={`w-full py-2.5 bg-slate-700 ${theme.hover} hover:text-white rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                disabled={disabled}
                onClick={onClick}
            >
                {buttonText}
            </button>
        </div>
    )
}

export default FeatureCard
