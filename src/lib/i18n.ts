// Simple wrapper for browser.i18n.getMessage
export function getMessage(messageName: string, substitutions?: string | string[]): string {
	return browser.i18n.getMessage(messageName, substitutions)
}

// Helper to get TTL option labels
export function getTtlLabel(hours: number): string {
	if (hours === 0) {
		return getMessage('ttlDisabled')
	} else if (hours === 1) {
		return getMessage('ttlOneDay')
	} else if (hours === 7) {
		return getMessage('ttlOneWeek')
	} else if (hours === 31) {
		return getMessage('ttlOneMonth')
	} else {
		// Fallback for any other values
		return `${hours} days`
	}
}

// Function to localize all elements with data-i18n attribute
export function localizeElements(): void {
	const elements = document.querySelectorAll('[data-i18n]')
	elements.forEach(element => {
		const key = element.getAttribute('data-i18n')
		if (key) {
			const htmlElement = element as HTMLElement
			htmlElement.textContent = getMessage(key)
		}
	})
}

// Function to set page title from localization
export function setLocalizedTitle(titleKey: string): void {
	const title = getMessage(titleKey)
	if (title) {
		document.title = title
	}
}
