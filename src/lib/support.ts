import { localizeElements, getMessage, setLocalizedTitle } from "./i18n.js"

function formatDate(timestamp: number | undefined): string {
	if (!timestamp) return 'Never'
	return new Date(timestamp).toLocaleString()
}

function formatJSON(obj: any): string {
	try {
		return JSON.stringify(obj, null, 2)
	} catch (e) {
		return 'Error formatting data'
	}
}

async function exportSettingsToFile(): Promise<void> {
	try {
		const data = await browser.storage.local.get()
		const dataStr = formatJSON(data)
		const blob = new Blob([dataStr], { type: 'application/json' })
		const url = URL.createObjectURL(blob)

		const a = document.createElement('a')
		a.href = url
		a.download = `tab-tosser-settings-${new Date().toISOString().split('T')[0]}.json`
		document.body.appendChild(a)
		a.click()
		document.body.removeChild(a)
		URL.revokeObjectURL(url)
	} catch (e) {
		alert('Failed to export settings')
	}
}

async function clearExtensionLogs(): Promise<void> {
	if (confirm(getMessage('confirmClearLogs') || 'Are you sure you want to clear all logs?')) {
		await browser.storage.local.set({ logs: [] })
		location.reload()
	}
}

document.addEventListener("DOMContentLoaded", async () => {
	// Set localized page title
	setLocalizedTitle('supportPageTitle')

	localizeElements()

	// Display Tab Tosser settings
	const settings = await browser.storage.local.get([
		"enabled",
		"initDate",
		"lastCheck",
		"pauseUntil",
		"statTabsClosed",
		"ttl"
	])

	// Format settings for better readability
	const formattedSettings = {
		...settings,
		initDate: settings.initDate ? new Date(settings.initDate).toLocaleString() : 'Not set',
		lastCheck: settings.lastCheck ? new Date(settings.lastCheck).toLocaleString() : 'Never',
		pauseUntil: settings.pauseUntil ? new Date(settings.pauseUntil).toLocaleString() : 'Not paused'
	}

	const settingsSection = document.getElementById("settings")!
	settingsSection.textContent = formatJSON(formattedSettings)

	// Display extension logs
	const { logs = [] } = await browser.storage.local.get(["logs"])
	const logsSection = document.getElementById("logs")!
	if (logs.length === 0) {
		logsSection.textContent = 'No logs available'
	} else {
		logsSection.textContent = formatJSON(logs)
	}

	// Display recently closed tabs
	const { closedTabs = [] } = await browser.storage.local.get(["closedTabs"])
	const closedTabsSection = document.getElementById("closedTabs")!
	if (closedTabs.length === 0) {
		closedTabsSection.textContent = 'No closed tabs in archive'
	} else {
		closedTabsSection.textContent = formatJSON(closedTabs)
	}

	// Display currently open tabs eligible for tossing
	try {
		const tabs: browser.tabs.Tab[] = await browser.tabs.query({ pinned: false })
		const openTabsSection = document.getElementById("openTabs")! as HTMLTableSectionElement

		if (tabs.length === 0) {
			openTabsSection.innerHTML = '<tr><td colspan="4" style="text-align: center; font-style: italic;">No unpinned tabs found</td></tr>'
		} else {
			for (const tab of tabs) {
				const row = document.createElement('tr')
				row.innerHTML = `
          <td>${tab.id || 'N/A'}</td>
          <td>${tab.windowId || 'N/A'}</td>
          <td>${formatDate(tab.lastAccessed)}</td>
          <td title="${tab.title || 'No title'}">${(tab.title || 'No title').substring(0, 60)}${(tab.title?.length || 0) > 60 ? '...' : ''}</td>
        `
				openTabsSection.appendChild(row)
			}
		}
	} catch (e) {
		const openTabsSection = document.getElementById("openTabs")! as HTMLTableSectionElement
		openTabsSection.innerHTML = '<tr><td colspan="4" style="text-align: center; color: red;">Error loading tabs</td></tr>'
	}

	// Setup event listeners
	document.getElementById("exportSettings")?.addEventListener("click", exportSettingsToFile)
	document.getElementById("clearLogs")?.addEventListener("click", clearExtensionLogs)
})
