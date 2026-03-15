import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
	darkMode: ["class"],
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx,scss}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx,scss}",
	],
	theme: {
		extend: {
			screens: {
				'3xl': '1920px'
			},
			fontSize: {
				'8xl': [
					'6rem',
					{
						lineHeight: '1'
					}
				]
			},
			fontFamily: {
				arimo: 'var(--font-arimo)',
				arima: 'var(--font-arima)'
			},
			flex: {
				'2': '2 2 0%'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			colors: {
				primary: "rgb(var(--primary) / <alpha-value>)",
				secondary: "rgba(var(--secondary) / <alpha-value>)",

				background: "rgb(var(--background) / <alpha-value>)",
				foreground: "rgb(var(--foreground) / <alpha-value>)",

				charcoal: "rgb(var(--charcoal) / <alpha-value>)",
				darkGrey: "rgb(var(--dark-grey) / <alpha-value>)",
				stroke: "rgb(var(--stroke) / <alpha-value>)",

				green: "rgb(var(--green) / <alpha-value>)",
				greenII: "rgb(var(--green-ii) / <alpha-value>)",
				greenDark: "rgb(var(--green-dark) / <alpha-value>)",
				bullish: "rgb(var(--bullish) / <alpha-value>)",

				lemonGlacier: "rgb(var(--lemon-glacier) / <alpha-value>)",
				brightYellow: "rgb(var(--bright-yellow) / <alpha-value>)",
				mandarine: "rgb(var(--mandarine) / <alpha-value>)",

				royalBlue: "rgb(var(--royal-blue) / <alpha-value>)",
				electricBlue: "rgb(var(--electric-blue) / <alpha-value>)",

				sell: "rgb(var(--sell) / <alpha-value>)",

				sidebarActive: "rgb(var(--sidebar-active) / <alpha-value>)",
				pressed: "rgb(var(--pressed) / <alpha-value>)",

				sidebarText: "rgb(var(--sidebar-text) / <alpha-value>)",

				currencyStrengthIndexBackground: "rgb(var(--currency-strength-index-background) / <alpha-value>)",
				switchTrack: "rgb(var(--switch-track) / <alpha-value>)",
				chartInnerBg: "rgb(var(--chart-inner-bg) / <alpha-value>)",

				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'rgba(255, 255, 255, 0.10)',
				inputBg: 'rgb(var(--input-bg) / <alpha-value>)',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				}
			}
		}
	},
	plugins: [tailwindcssAnimate],
};

export default config;