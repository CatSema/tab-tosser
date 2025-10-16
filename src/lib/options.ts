import { clearArchivedTabsHistory, getClosedTabs } from "./closed-tabs.js"
import { getNextRun, isPaused, resume, setTtl } from "./config.js"
import { sliderMarks, updateSliderMarks } from "./slider.js"
import { totalTabsClosedCount, totalTabsClosedCountSince } from "./stats.js"
import { localizeElements, getMessage, setLocalizedTitle } from "./i18n.js"

async function saveOptions(): Promise<void> {
	await setTtl(Number((document.querySelector("#ttl") as HTMLSelectElement).value))
}

async function restoreOptions(): Promise<void> {
	const options = await browser.storage.local.get(["ttl"])

	if (typeof options.ttl !== "undefined") {
		(document.querySelector("#ttl") as HTMLSelectElement).value = options.ttl
	}
}

function populateSlider(): void {
	// Update slider marks with localized labels
	updateSliderMarks()

	const select = document.querySelector("#ttl")!

	// Clear existing options
	select.innerHTML = ""

	for (const sliderMark of sliderMarks) {
		select.appendChild(new Option(sliderMark[1], `${sliderMark[0]}`))
	}
}

async function populateTossedTabs(): Promise<void> {
	const tossedTabsDiv = document.querySelector("#archivedTabsSection") as HTMLDivElement
	const tossedTabsUl = document.querySelector("#archivedTabs") as HTMLUListElement

	const tossedTabs = await getClosedTabs()
	tossedTabs.reverse()

	if (tossedTabs.length === 0) {
		tossedTabsDiv.style.display = "none"
		return
	}

	let listHtml = ""

	for (const tossedTab of tossedTabs) {
		// [tab.url, tab.title, tab.lastAccessed, clearFromArchiveDateCache]
		listHtml += `<li><a rel="noopener noreferrer" target="_blank" href="${tossedTab[0]}">${tossedTab[1]}</a></li>`
	}
	tossedTabsUl.innerHTML = listHtml
}

async function populateStats(): Promise<void> {
	const tabsClosedCount = await totalTabsClosedCount()
	const initDate = await totalTabsClosedCountSince()

	// Update counter only
	const counterElement = document.getElementById("totalTabsClosedCount")
	if (counterElement) {
		counterElement.classList.add('updating')
		counterElement.textContent = tabsClosedCount.toString()

		// Remove animation class after animation completes
		setTimeout(() => {
			counterElement.classList.remove('updating')
		}, 300)
	}

	// Update detailed statistics separately
	const detailedStatsElement = document.getElementById("detailedStats")
	if (detailedStatsElement) {
		const dateString = new Intl.DateTimeFormat("default", {
			year: "numeric",
			month: "numeric",
			day: "numeric"
		}).format(new Date(initDate))

		detailedStatsElement.textContent = getMessage('detailedStatsMessage', [dateString])
	}
}

async function handlePausedState(): Promise<void> {
	if ((await isPaused()) === true) {
		const nextRunElement = document.getElementById("nextRun")
		const pausedElement = document.getElementById("paused")

		if (nextRunElement && pausedElement) {
			nextRunElement.innerHTML = `after ${await getNextRun()}`
			pausedElement.style.display = "block"
		}
	}
}

function resumeHandler(event: MouseEvent): void {
	event.preventDefault()
	resume()

	const pausedP = document.getElementById("paused")!
	pausedP.style.display = "none"
}

async function clearHistoryHandler(event: MouseEvent): Promise<void> {
	event.preventDefault()

	if ((await clearArchivedTabsHistory()) === true) {
		const tossedTabsDiv = document.getElementById("archivedTabsSection")!
		tossedTabsDiv.style.display = "none"
	}
}

async function openHistoryHandler(event: MouseEvent): Promise<void> {
	event.preventDefault()

	const tossedTabs = await getClosedTabs()
	tossedTabs.reverse()

	for (const tossedTab of tossedTabs) {
		await browser.tabs.create({
			url: tossedTab[0]
		})
	}
}

async function openSupportHandler(event: MouseEvent): Promise<void> {
	event.preventDefault()

	await browser.tabs.create({
		url: "support.html"
	})
}

document.addEventListener("DOMContentLoaded", async () => {
	// Set localized page title
	setLocalizedTitle('settingsPageTitle')

	localizeElements()

	populateSlider()
	restoreOptions()
	handlePausedState()
	await populateTossedTabs()
	await populateStats()

	document.getElementById("ttl")!.addEventListener("change", saveOptions)
	document.getElementById("resumeLink")!.addEventListener("click", resumeHandler)
	document.getElementById("clearHistoryLink")!.addEventListener("click", clearHistoryHandler)
	document.getElementById("openHistoryLink")!.addEventListener("click", openHistoryHandler)
	document.getElementById("openSupportLink")!.addEventListener("click", openSupportHandler)
})