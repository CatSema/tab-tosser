import { getTtl, setTtl } from "./config.js"
import { sliderMarks, updateSliderMarks } from "./slider.js"
import { localizeElements, setLocalizedTitle } from "./i18n.js"

async function ttlChange(): Promise<void> {
	const form = document.getElementById("settings") as HTMLFormElement
	const formData = new FormData(form)
	const selectedValue = formData.get("ttl") as string

	if (selectedValue) {
		await setTtl(Number(selectedValue))
	}
}

async function populateSlider(): Promise<void> {
	updateSliderMarks()

	const preselectedValue = await getTtl()
	let radioButtons = ""

	for (const sliderMark of sliderMarks) {
		const isChecked = sliderMark[0] === preselectedValue ? "checked" : ""
		radioButtons += `
      <label class="radio-item" for="option-${sliderMark[0]}">
        <input type="radio" id="option-${sliderMark[0]}" name="ttl" value="${sliderMark[0]}" ${isChecked}>
        ${sliderMark[1]}
      </label>`
	}

	const container = document.getElementById("ttlOptions") as HTMLDivElement
	container.innerHTML = radioButtons
}

document.addEventListener("DOMContentLoaded", async () => {
	// Set localized page title
	setLocalizedTitle('setupPageTitle')

	document.body.classList.add("fade-in")
	localizeElements()

	document.getElementById("settings")!.addEventListener("change", ttlChange)

	await populateSlider()
	await ttlChange()
})
